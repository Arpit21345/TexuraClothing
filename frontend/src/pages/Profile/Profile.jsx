import { useState, useEffect, useContext, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const { url, token, refreshProfile } = useContext(StoreContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        preferences: {
            newsletter: true,
            promotions: true
        }
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    // Fetch user profile data
    const resolveImg = (base, path) => (path && path.startsWith('http') ? path : `${base}/images/${path || ''}`);
    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${url}/api/user/profile`, {}, {
                headers: { token }
            });
            
            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                setProfileData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
                    gender: userData.gender || '',
                    address: userData.address || {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    },
                    preferences: userData.preferences || {
                        newsletter: true,
                        promotions: true
                    }
                });
                
                if (userData.profilePicture) {
                    setPreviewImage(resolveImg(url, userData.profilePicture));
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [url, token]);

    const fetchUserOrders = useCallback(async () => {
        try {
            const response = await axios.post(`${url}/api/order/userorders`, {}, {
                headers: { token }
            });
            
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }, [url, token]);

    useEffect(() => {
        fetchUserProfile();
        fetchUserOrders();
    }, [fetchUserProfile, fetchUserOrders]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or WebP)');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size too large. Please select an image smaller than 5MB.');
                return;
            }

            setProfilePicture(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`${url}/api/user/profile`, profileData, {
                headers: { token }
            });
            
            if (response.data.success) {
                alert('Profile updated successfully!');
                fetchUserProfile();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${url}/api/user/profile`, {
                password: passwordData.newPassword
            }, {
                headers: { token }
            });
            
            if (response.data.success) {
                alert('Password updated successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Error updating password');
        } finally {
            setLoading(false);
        }
    };

    const uploadProfilePicture = async () => {
        if (!profilePicture) {
            alert('Please select a picture first');
            return;
        }

        if (!token) {
            alert('You must be logged in to upload a profile picture');
            return;
        }

        try {
            setLoading(true);
            console.log('Starting upload with token:', token); // Debug log
            
            const formData = new FormData();
            formData.append('profilePicture', profilePicture);
            
            console.log('FormData contents:', formData.get('profilePicture')); // Debug log

            const response = await axios.post(`${url}/api/user/profile-picture`, formData, {
                headers: { 
                    token: token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Upload response:', response.data); // Debug log
            
            if (response.data.success) {
                alert('Profile picture updated successfully!');
                setProfilePicture(null);
                
                // Update the preview image with the new uploaded image
                if (response.data.profilePicture) {
                    setPreviewImage(resolveImg(url, response.data.profilePicture));
                }
                
                // Refresh the profile data and navbar
                fetchUserProfile();
                if (refreshProfile) refreshProfile();
            } else {
                alert(response.data.message || 'Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading picture:', error);
            console.error('Error response:', error.response); // Debug log
            
            // More detailed error message
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Upload failed: ${error.response.data.message}`);
            } else if (error.message) {
                alert(`Upload failed: ${error.message}`);
            } else {
                alert('Error uploading picture. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <img 
                        src={previewImage || assets.profile_icon} 
                        alt="Profile" 
                        className="avatar-image"
                    />
                    <div className="avatar-upload">
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="avatar-upload" className="upload-btn">
                            📷 Change Photo
                        </label>
                        {profilePicture && (
                            <button onClick={uploadProfilePicture} className="save-photo-btn">
                                Save Photo
                            </button>
                        )}
                    </div>
                </div>
                <div className="profile-info">
                    <h1>{user?.name || 'User'}</h1>
                    <p>{user?.email}</p>
                    <p className="member-since">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="profile-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Information
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    My Orders ({orders.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'profile' && (
                    <div className="profile-form">
                        <h2>Personal Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profileData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <h3>Address Information</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={profileData.address.street}
                                    onChange={handleInputChange}
                                    placeholder="Enter street address"
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={profileData.address.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter city"
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="address.state"
                                    value={profileData.address.state}
                                    onChange={handleInputChange}
                                    placeholder="Enter state"
                                />
                            </div>
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    name="address.zipCode"
                                    value={profileData.address.zipCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter ZIP code"
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={profileData.address.country}
                                    onChange={handleInputChange}
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>

                        <h3>Preferences</h3>
                        <div className="preferences-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="preferences.newsletter"
                                    checked={profileData.preferences.newsletter}
                                    onChange={handleInputChange}
                                />
                                Subscribe to newsletter
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="preferences.promotions"
                                    checked={profileData.preferences.promotions}
                                    onChange={handleInputChange}
                                />
                                Receive promotional emails
                            </label>
                        </div>

                        <button 
                            className="save-btn" 
                            onClick={updateProfile}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <h2>My Orders</h2>
                        {orders.length === 0 ? (
                            <div className="no-orders">
                                <p>You haven&apos;t placed any orders yet.</p>
                                <button onClick={() => window.location.href = '/'}>
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div key={order._id} className="order-card">
                                        <div className="order-header">
                                            <div className="order-id">Order #{order._id.slice(-8)}</div>
                                            <div className={`order-status ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="order-details">
                                            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                                            <p><strong>Amount:</strong> ${order.amount}</p>
                                            <p><strong>Items:</strong> {order.items.length} item(s)</p>
                                        </div>
                                        <div className="order-items">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="order-item">
                                                    <span>{item.name} x {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="security-section">
                        <h2>Change Password</h2>
                        <div className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password (min 8 characters)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button 
                                className="save-btn" 
                                onClick={updatePassword}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

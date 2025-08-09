import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './Customers.css';

const Customers = ({ url }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        recentUsers: 0,
        activeUsers: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const resolveImg = (base, path) => (path && path.startsWith('http') ? path : `${base}/images/${path || ''}`);
    useEffect(() => {
        fetchCustomers();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, url]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/user/all`, {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchTerm
                }
            });

            if (response.data.success) {
                setCustomers(response.data.users || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                toast.error('Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Error fetching customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${url}/api/user/stats`);
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getActivityStatus = (lastLogin) => {
        const now = new Date();
        const loginDate = new Date(lastLogin);
        const diffDays = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) return { status: 'Active', class: 'active' };
        if (diffDays <= 30) return { status: 'Recent', class: 'recent' };
        return { status: 'Inactive', class: 'inactive' };
    };

    return (
        <div className="customers-container">
            <div className="customers-header">
                <h1>Customer Management</h1>
                <p>Manage and view customer information</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Customers</p>
                    </div>
                </div>
                <div className="stat-card recent">
                    <div className="stat-icon">🆕</div>
                    <div className="stat-info">
                        <h3>{stats.recentUsers}</h3>
                        <p>New This Month</p>
                    </div>
                </div>
                <div className="stat-card active">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active This Week</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="customers-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <div className="search-icon">🔍</div>
                </div>
                <button onClick={fetchCustomers} className="refresh-btn">
                    🔄 Refresh
                </button>
            </div>

            {/* Customers Table */}
            <div className="customers-table-container">
                {loading ? (
                    <div className="loading">Loading customers...</div>
                ) : (
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Profile</th>
                                <th>Customer Info</th>
                                <th>Contact</th>
                                <th>Join Date</th>
                                <th>Last Login</th>
                                <th>Status</th>
                                <th>Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => {
                                    const activity = getActivityStatus(customer.lastLogin);
                                    return (
                                        <tr key={customer._id} className="customer-row">
                                            <td>
                                                <div className="profile-cell">
                                                    {customer.profilePicture ? (
                                                        <img 
                                                            src={resolveImg(url, customer.profilePicture)} 
                                                            alt="Profile" 
                                                            className="profile-pic"
                                                        />
                                                    ) : (
                                                        <div className="profile-placeholder">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="customer-info">
                                                    <h4>{customer.name}</h4>
                                                    <p className="customer-id">ID: {customer._id.slice(-8)}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <p className="email">{customer.email}</p>
                                                    <p className="phone">{customer.phone || 'Not provided'}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="date">
                                                    {formatDate(customer.createdAt)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="date">
                                                    {formatDate(customer.lastLogin)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status ${activity.class}`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="view-orders-btn" onClick={() => navigate(`/orders?userId=${customer._id}`)}>
                                                    View Orders
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

                        {/* Mobile Cards (shown on small screens) */}
                        {!loading && (
                            <div className="customers-cards">
                                {customers.length === 0 ? (
                                    <div className="no-data">{searchTerm ? 'No customers found matching your search' : 'No customers found'}</div>
                                ) : (
                                    customers.map((customer) => {
                                        const activity = getActivityStatus(customer.lastLogin);
                                        return (
                                            <div key={customer._id} className="customer-card">
                                                <div className="card-header">
                                                    <div className="card-profile">
                                                        {customer.profilePicture ? (
                                                            <img 
                                                                src={resolveImg(url, customer.profilePicture)} 
                                                                alt="Profile" 
                                                                className="profile-pic"
                                                            />
                                                        ) : (
                                                            <div className="profile-placeholder">
                                                                {customer.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="card-title">
                                                        <h4>{customer.name}</h4>
                                                        <span className="customer-id">ID: {customer._id.slice(-8)}</span>
                                                    </div>
                                                    <span className={`status ${activity.class}`}>{activity.status}</span>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <span className="label">Email</span>
                                                        <span className="value">{customer.email}</span>
                                                    </div>
                                                    <div className="row">
                                                        <span className="label">Phone</span>
                                                        <span className="value">{customer.phone || 'Not provided'}</span>
                                                    </div>
                                                    <div className="row two-col">
                                                        <div>
                                                            <span className="label">Joined</span>
                                                            <span className="value">{formatDate(customer.createdAt)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="label">Last Login</span>
                                                            <span className="value">{formatDate(customer.lastLogin)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-actions">
                                                    <button className="view-orders-btn" onClick={() => navigate(`/orders?userId=${customer._id}`)}>
                                                        View Orders
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    
                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

Customers.propTypes = {
    url: PropTypes.string.isRequired,
};

export default Customers;

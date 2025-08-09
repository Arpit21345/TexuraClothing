import { useState } from 'react';
import './AdminLogin.css';
import axios from 'axios';
import { toast } from 'react-toastify';

// eslint-disable-next-line react/prop-types
const AdminLogin = ({ setIsAdminLoggedIn }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Use axios baseURL configured globally in main.jsx
  const url = axios.defaults.baseURL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
  const response = await axios.post(`${url}/api/admin/login`, formData);
      
      if (response.data.success) {
        // Store admin token
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        setIsAdminLoggedIn(true);
        toast.success('Admin login successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h2>🔐 Admin Login</h2>
          <p>Access the Texura Clothing Admin Panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>🛡️ Secure Admin Access</p>
          <small>Only authorized personnel can access this panel</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

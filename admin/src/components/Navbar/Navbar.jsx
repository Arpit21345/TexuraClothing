import './Navbar.css';
import { assets } from '../../assets/assets';

// eslint-disable-next-line react/prop-types
const Navbar = ({ onLogout }) => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  return (
    <div className="navbar">
        <img className="logo" src={assets.logo} alt="Brand Logo" />
        <div className="navbar-right">
          <div className="admin-info">
            <span className="admin-welcome">Welcome, {adminData.username || 'Admin'}</span>
            <span className="admin-role">🔐 {adminData.role || 'Administrator'}</span>
          </div>
          <img className="profile" src={assets.profile_image} alt="User Profile" />
          <button className="logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>      
    </div>
  );
};

export default Navbar;
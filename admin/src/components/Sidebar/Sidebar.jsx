import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
      <div className="sidebar-options">
        <NavLink 
          to="/add" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
          onClick={onClose}
        >
          <img src={assets.add_icon} alt="Add Items" />
          <p>Add Items</p>
        </NavLink>
        <NavLink 
          to="/list" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
          onClick={onClose}
        >
          <img src={assets.list_icon || assets.order_icon} alt="List Items" />
          <p>List Items</p>
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
          onClick={onClose}
        >
          <img src={assets.order_icon} alt="Orders" />
          <p>Orders</p>
        </NavLink>
        <NavLink 
          to="/customers" 
          className={({ isActive }) => 
            isActive ? "sidebar-option active" : "sidebar-option"
          }
          onClick={onClose}
        >
          <img src={assets.profile_icon || assets.order_icon} alt="Customers" />
          <p>Customers</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
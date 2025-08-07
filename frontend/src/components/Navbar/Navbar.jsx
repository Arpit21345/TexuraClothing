import { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import SearchModal from "../SearchModal/SearchModal";
import PropTypes from "prop-types";
import axios from "axios";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("menu");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { getTotalCartAmount, token, setToken, url, profileUpdateTrigger } = useContext(StoreContext);
  const navigate = useNavigate();

  // Fetch user profile to get profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await axios.post(`${url}/api/user/profile`, {}, {
            headers: { token }
          });
          if (response.data.success) {
            setUserProfile(response.data.user);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [token, url, profileUpdateTrigger]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserProfile(null);
    navigate("/");
  };

  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          mobile-app
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact us
        </a>
      </ul>

      <div className="navbar-right">
        <img 
          src={assets.search_icon} 
          alt="Search Icon" 
          onClick={handleSearchClick}
          style={{ cursor: 'pointer' }}
        />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="Basket Icon" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <div className="navbar-profile-pic">
              {userProfile?.profilePicture ? (
                <img 
                  src={`${url}/images/${userProfile.profilePicture}`} 
                  alt="Profile" 
                  className="profile-avatar"
                />
              ) : (
                <img 
                  src={assets.profile_icon} 
                  alt="Profile Icon" 
                  className="profile-avatar"
                />
              )}
            </div>
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/profile')}>
                <img src={assets.profile_icon} alt="Profile Icon" />
                <p>Profile</p>
              </li>
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="Bag Icon" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="Logout Icon" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </div>
  );
};

export default Navbar;

Navbar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};
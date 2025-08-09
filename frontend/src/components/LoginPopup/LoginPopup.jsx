import { useState, useContext } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from './../../context/StoreContext';
import axios from "axios";
import PropTypes from 'prop-types';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currState, setCurrState] = useState("login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    
    console.log("Login attempt with data:", { 
      email: data.email, 
      password: data.password ? "***hidden***" : "empty",
      state: currState 
    });
    
    let newUrl = url;
    if (currState === "login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);
      console.log("Login response:", response.data);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
      } else {
        console.error("Login failed:", response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Login failed: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt='' />
        </div>
        <div className="login-popup-inputs">
          {currState === "login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
          <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Your password' required />
        </div>
        <button>{currState === "Sign Up" ? "Create account" : "Login"}</button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
        {currState === "login"
          ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click Here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("login")}>Login Here</span></p>
        }
        
        {/* Admin Access Link */}
        <div className="admin-access-link">
          <p>
            Admin? {" "}
            <span
              onClick={() => {
                const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://texura-admin.vercel.app';
                window.open(adminUrl, '_blank');
              }}
            >
              Login as Admin
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

LoginPopup.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default LoginPopup;
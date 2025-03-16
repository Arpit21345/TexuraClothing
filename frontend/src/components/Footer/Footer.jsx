import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
        <img src={assets.logo} alt="Brand Logo" className="footer-logo"/>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat dicta aut suscipit sapiente delectus, aspernatur nostrum ratione cum vitae doloremque. Accusantium, dolore. Modi odit minus saepe incidunt sint quidem facere eius porro cupiditate, quam nostrum, culpa, placeat id.</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+1-212-456-78994</li>
            <li>contact@textile.com</li>
          </ul>
        </div>
      </div>
      <hr/>
      <p className="footer-copyright">Copyright 2024 ©️ Textile.com - All Rights Reserved.</p>
    </div>
  );
};

export default Footer;
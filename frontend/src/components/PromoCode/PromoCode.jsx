/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './PromoCode.css';

const PromoCode = ({ onPromoApplied, currentPromo }) => {
  const [promoCode, setPromoCode] = useState(currentPromo?.code || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { url, token } = useContext(StoreContext);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setMessage('Please enter a promo code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${url}/api/promo/validate`, {
        code: promoCode.trim()
      }, {
        headers: { token }
      });

      if (response.data.success) {
        setMessage(response.data.message);
        onPromoApplied({
          code: response.data.code,
          discount: response.data.discount
        });
      } else {
        setMessage(response.data.message);
        onPromoApplied(null);
      }
    } catch (error) {
      console.error('Promo code validation error:', error);
      setMessage('Error validating promo code');
      onPromoApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setMessage('');
    onPromoApplied(null);
  };

  return (
    <div className="promo-code-container">
      <div className="promo-code-header">
        <h3>🎁 Have a Promo Code?</h3>
      </div>
      
      <div className="promo-code-input-section">
        <div className="promo-input-wrapper">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="promo-input"
            disabled={loading || currentPromo}
          />
          {currentPromo ? (
            <button 
              className="promo-remove-btn"
              onClick={removePromoCode}
              title="Remove promo code"
            >
              ✕
            </button>
          ) : (
            <button 
              className="promo-apply-btn"
              onClick={validatePromoCode}
              disabled={loading || !promoCode.trim()}
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          )}
        </div>
        
        {message && (
          <div className={`promo-message ${currentPromo ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {currentPromo && (
        <div className="applied-promo">
          <div className="promo-badge">
            <span className="promo-icon">🎉</span>
            <span className="promo-text">
              {currentPromo.code} - {currentPromo.discount}% OFF Applied!
            </span>
          </div>
        </div>
      )}

      <div className="available-codes">
        <p className="codes-hint">💡 Try these codes:</p>
        <div className="codes-list">
          <span className="code-tag">WELCOME10</span>
          <span className="code-tag">SAVE20</span>
          <span className="code-tag">SUMMER25</span>
          <span className="code-tag">MEGA50</span>
        </div>
      </div>
    </div>
  );
};

export default PromoCode;

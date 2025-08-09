import { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PromoCode from "../../components/PromoCode/PromoCode";

const Cart = () => {
  const { cartItems, textile_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);
  const resolveImg = (base, path) => (path && path.startsWith('http') ? path : `${base}/images/${path || ''}`);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  const calculateDiscountAmount = () => {
    if (!appliedPromo) return 0;
    return Math.round((getTotalCartAmount() * appliedPromo.discount) / 100);
  };

  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const discount = calculateDiscountAmount();
    return Math.max(0, subtotal + deliveryFee - discount);
  };

  const handlePromoApplied = (promoData) => {
    setAppliedPromo(promoData);
  };

  const proceedToCheckout = () => {
    // Pass promo data to checkout page
    navigate('/order', { 
      state: { 
        appliedPromo: appliedPromo 
      } 
    });
  };

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Stock</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {textile_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={resolveImg(url, item.image)} alt="" />
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p className={item.stock === 0 ? 'out' : cartItems[item._id] > item.stock ? 'warn' : ''}>
                    {item.stock === 0 ? 'Out' : `${item.stock}`}
                  </p>
                  <p>${item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">x</p>
                </div>
                <hr />
              </div>
            );
          }
          return null; // Ensures a return for every map iteration
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            {appliedPromo && (
              <>
                <hr />
                <div className="cart-total-details promo-discount">
                  <p style={{color: '#28a745'}}>Discount ({appliedPromo.code})</p>
                  <p style={{color: '#28a745'}}>-${calculateDiscountAmount()}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getFinalTotal()}</b>
            </div>
          </div>
          <button onClick={proceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        
        <PromoCode 
          onPromoApplied={handlePromoApplied}
          currentPromo={appliedPromo}
        />
      </div>
    </div>
  );
};

export default Cart;
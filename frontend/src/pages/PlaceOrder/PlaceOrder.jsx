import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlaceOrder.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, textile_list, cartItems, url } = useContext(StoreContext);
  const location = useLocation();
  const appliedPromo = location.state?.appliedPromo || null;

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

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

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    textile_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });
    let orderData = {
      address: data,
      items: orderItems,
      amount: getFinalTotal(),
      promoCode: appliedPromo ? {
        code: appliedPromo.code,
        discount: appliedPromo.discount,
        discountAmount: calculateDiscountAmount()
      } : null
    };
    try {
      let response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Order placement failed:", error);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, navigate, getTotalCartAmount]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title"></p>
        <div className="multi-fields">
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type='text' placeholder='street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type='text' placeholder='city' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type='text' placeholder='state' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type='text' placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type='text' placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type='text' placeholder='phone' />
      </div>
      <div className="place-order-right">
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
                <div className="promo-applied-badge">
                  <small style={{color: '#28a745', fontWeight: 'bold'}}>
                    🎉 {appliedPromo.discount}% OFF Applied!
                  </small>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getFinalTotal()}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
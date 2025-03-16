import { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from "axios";
import { assets } from '../../assets/assets';

// eslint-disable-next-line react/prop-types
const Orders = ({ url }) => {

  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/listorders`, {
        headers: { token: localStorage.getItem('token') },
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error in fetching orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Error in fetching orders");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/updatestatus`, {
        orderId,
        status: event.target.value
      }, {
        headers: { token: localStorage.getItem('token') },
      });
      if (response.data.success) {
        await fetchAllOrders();
      } else {
        toast.error("Error in updating order status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Error in updating order status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order-container">
      <h3>Order Management</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-card">
            <img src={assets.parcel_icon} alt="Parcel Icon" />
            <div className="order-details">
              <p className="order-items">
                {order.items.map((item, idx) => (
                  idx === order.items.length - 1 ? `${item.name} x ${item.quantity}` : `${item.name} x ${item.quantity}, `
                ))}
              </p>
              <p className="customer-name">{order.address.firstName} {order.address.lastName}</p>
              <div className="customer-address">
                <p>{order.address.street},</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
              </div>
              <p className="customer-phone">{order.address.phone}</p>
              <p>Items: {order.items.length}</p>
              <p>Amount: ${order.amount}</p>
              <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                <option value="Textile Processing">Textile Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
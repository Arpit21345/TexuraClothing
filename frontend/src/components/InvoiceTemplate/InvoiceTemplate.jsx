import './InvoiceTemplate.css';

/* eslint-disable react/prop-types */
const InvoiceTemplate = ({ invoiceData }) => {
  const { order, user, items, generatedDate } = invoiceData;

  return (
    <div className="invoice-container">
      <div className="header">
        <div className="company-name">TEXURA CLOTHING</div>
        <div className="company-tagline">Premium Fashion & Textiles</div>
      </div>
      
      <div className="invoice-info">
        <div className="invoice-details">
          <div className="section-title">Invoice Details</div>
          <div className="detail-row">
            <span className="label">Invoice #:</span> 
            <span className="value">{order._id}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date:</span> 
            <span className="value">{generatedDate}</span>
          </div>
          <div className="detail-row">
            <span className="label">Order Date:</span> 
            <span className="value">{new Date(order.date).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span> 
            <span className={`payment-status ${order.payment ? 'paid' : 'pending'}`}>
              {order.payment ? 'PAID' : 'PENDING'}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Method:</span> 
            <span className="value">{order.paymentMethod || 'Stripe Card Payment'}</span>
          </div>
        </div>
        
        <div className="customer-details">
          <div className="section-title">Customer Details</div>
          <div className="detail-row">
            <span className="label">Name:</span> 
            <span className="value">{user.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span> 
            <span className="value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Address:</span> 
            <span className="value">
              {order.address.street}<br/>
              {order.address.city}, {order.address.state}<br/>
              {order.address.zipcode}, {order.address.country}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span> 
            <span className="value">{order.address.phone || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>${item.price}</td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="total-section">
        <div className="total-row">
          <span className="label">Subtotal:</span> 
          <span className="value">${(order.amount - 2).toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span className="label">Delivery Charges:</span> 
          <span className="value">$2.00</span>
        </div>
        <div className="total-row grand-total">
          <span className="label">Grand Total:</span> 
          <span className="value">${order.amount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="footer">
        <p>Thank you for shopping with Texura Clothing!</p>
        <p>For any queries, contact us at support@texuraclothing.com | +1-234-567-8900</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;

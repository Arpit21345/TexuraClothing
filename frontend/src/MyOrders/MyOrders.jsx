import { StoreContext } from '../context/StoreContext'
import './MyOrders.css'
import { useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { assets } from '../assets/assets'
import InvoiceTemplate from '../components/InvoiceTemplate/InvoiceTemplate'
import { createRoot } from 'react-dom/client'

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = useCallback(async () => {
    const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
    setData(response.data.data);
  }, [url, token]);

  const generateInvoiceHTML = (invoiceData) => {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    const root = createRoot(tempContainer);
    
    // Render the Invoice component
    root.render(<InvoiceTemplate invoiceData={invoiceData} />);
    
    // Wait for render and return HTML
    return new Promise((resolve) => {
      setTimeout(() => {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Invoice - ${invoiceData.order._id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; }
              .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
              .company-name { font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 5px; }
              .company-tagline { color: #666; font-size: 14px; }
              .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .invoice-details, .customer-details { width: 48%; }
              .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
              .detail-row { margin-bottom: 8px; font-size: 14px; }
              .label { font-weight: bold; color: #555; }
              .value { color: #333; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd; }
              .items-table th { background-color: #007bff; color: white; padding: 12px; text-align: left; font-weight: bold; }
              .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
              .items-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
              .total-section { margin-top: 20px; text-align: right; }
              .total-row { margin-bottom: 10px; font-size: 16px; }
              .grand-total { font-size: 20px; font-weight: bold; color: #007bff; border-top: 2px solid #007bff; padding-top: 10px; }
              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
              .payment-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
              .paid { background-color: #28a745; color: white; }
              .pending { background-color: #ffc107; color: #333; }
            </style>
          </head>
          <body>
            ${tempContainer.innerHTML}
          </body>
          </html>
        `;
        
        // Cleanup
        root.unmount();
        resolve(htmlContent);
      }, 100);
    });
  };

  const downloadInvoice = async (orderId) => {
    try {
      // Step 1: Get invoice data from backend
      const dataResponse = await axios.get(`${url}/api/invoice/data/${orderId}`, {
        headers: { token }
      });
      
      if (!dataResponse.data.success) {
        alert('Failed to fetch invoice data');
        return;
      }
      
      // Step 2: Generate HTML content using frontend component
      const htmlContent = await generateInvoiceHTML(dataResponse.data.data);
      
      // Step 3: Send HTML to backend for PDF generation
      const response = await axios.post(`${url}/api/invoice/generate/${orderId}`, {
        htmlContent
      }, {
        headers: { 
          token,
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // Important for handling PDF blob
      });
      
      // Step 4: Download the PDF
      const url_blob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url_blob;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, fetchOrders]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="Parcel Icon" />
            <p>
              {order.items.map((item, index) => (
                index === order.items.length - 1 ? `${item.name} x ${item.quantity}` : `${item.name} x ${item.quantity}, `
              ))}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p><span>&#x25cf;</span><b>{order.status}</b></p>
            <div className="order-actions">
              <button 
                className="download-invoice-btn" 
                onClick={() => downloadInvoice(order._id)}
              >
                📄 Download Invoice
              </button>
              <button 
                className="view-details-btn"
                onClick={() => {
                  alert(`Order Details:\nOrder ID: ${order._id}\nItems: ${order.items.length}\nAmount: $${order.amount}\nStatus: ${order.status}`);
                }}
              >
                👁️ View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
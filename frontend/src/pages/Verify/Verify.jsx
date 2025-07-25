import './Verify.css'
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useContext, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    const response = await axios.post(url + "/api/order/verify", { success, orderId });
    if (response.data.success) {
      // Payment successful, redirect to orders page where user can download invoice
      navigate('/myorders');
    } else {
      navigate('/');
    }
  }, [url, success, orderId, navigate]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="verify">
      <div className="spinner">
      </div>
    </div>
  );
}

export default Verify;
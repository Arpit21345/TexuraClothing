import { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import AdminLogin from './components/AdminLogin/AdminLogin';
import { Routes, Route, Navigate } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Customers from './pages/Customers/Customers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const App = () => {
  const url = "http://localhost:4000";
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if admin is already logged in
  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        try {
          const response = await axios.get(`${url}/api/admin/verify`, {
            headers: { token: adminToken }
          });
          
          if (response.data.success) {
            setIsAdminLoggedIn(true);
          } else {
            // Invalid token, remove from localStorage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      }
      
      setLoading(false);
    };

    checkAdminAuth();
  }, [url]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAdminLoggedIn(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666' 
      }}>
        🔄 Loading Admin Panel...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <>
        <ToastContainer />
        <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />
      </>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <hr />
      <div className="app-content">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Routes>
          <Route path='/' element={<Navigate to="/add" replace />} />
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url} />} />
          <Route path='/orders' element={<Orders url={url} />} />
          <Route path='/customers' element={<Customers url={url} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
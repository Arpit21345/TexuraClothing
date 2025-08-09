import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';

// Configure API base URL for all axios calls in admin
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use((cfg) => {
  if (cfg.url && /^https?:\/\/localhost:4000/.test(cfg.url)) {
    cfg.url = cfg.url.replace(/^https?:\/\/localhost:4000/, API_BASE);
  }
  return cfg;
});
// Optional debug
console.log('Admin API base:', API_BASE);

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
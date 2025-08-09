import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";
import axios from "axios";

// Configure API base URL for all axios calls
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use((cfg) => {
  if (cfg.url && /^https?:\/\/localhost:4000/.test(cfg.url)) {
    cfg.url = cfg.url.replace(/^https?:\/\/localhost:4000/, API_BASE);
  }
  return cfg;
});
// Optional debug
console.log("Frontend API base:", API_BASE);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
);

// frontend :npm run dev
// backend :npm run server
// admin :npm run dev
// change the link of frontend url in ordercontroller.js
import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  // Use axios base URL configured in main.jsx
  const url = axios.defaults.baseURL;
  const [token, setToken] = useState("");

  const [textile_list, setTextileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

  // Function to trigger profile refresh
  const refreshProfile = () => {
    setProfileUpdateTrigger(prev => prev + 1);
  };

  const addToCart = async (itemId) => {
    // find stock for this item
    const itemInfo = textile_list.find((p) => p._id === itemId);
    const maxStock = itemInfo?.stock ?? 0;
    const currentQty = cartItems[itemId] || 0;

    if (maxStock === 0) {
      window.alert('This item is out of stock.');
      return;
    }

    if (currentQty >= maxStock) {
      window.alert(`Only ${maxStock} left in stock.`);
      return;
    }

    setCartItems((prev) => ({ ...prev, [itemId]: currentQty + 1 }));
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
  setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1) }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        // Safely find the item in the textile list
        const itemInfo = textile_list.find((product) => product._id === item);

        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  const fetchTextileList = useCallback(async () => {
    const response = await axios.get(url + "/api/textile/list");
    setTextileList(response.data.data);
  }, [url]);

  const loadCartData = useCallback(async (token) => {
    const response = await axios.get(url + "/api/cart/get", { headers: { token } });
    setCartItems(response.data.cartData);
  }, [url]);

  useEffect(() => {
    async function loadData() {
      await fetchTextileList();
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    }
    loadData();
  }, [fetchTextileList, loadCartData]);

  const contextValue = {
    textile_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    profileUpdateTrigger,
    refreshProfile,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
import "./List.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const resolveImg = (base, path) => (path && path.startsWith('http') ? path : `${base}/images/${path || ''}`);
  const [busy, setBusy] = useState({});

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/textile/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error in fetching data.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch list. Please try again.");
    }
  };

  const removeTextile = async (textileId) => {
    try {
      const response = await axios.delete(`${url}/api/textile/remove`, { data: { id: textileId } });
      if (response.data.success) {
        toast.success(response.data.message);
        setList(prevList => prevList.filter(item => item._id !== textileId)); // Optimistic UI update
      } else {
        toast.error("Error in removing item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const adjustStock = async (textileId, delta) => {
    try {
      setBusy((b) => ({ ...b, [textileId]: true }));
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        toast.error('Admin authentication required. Please log in again.');
        return;
      }
      const response = await axios.post(
        `${url}/api/textile/adjust-stock`,
        { id: textileId, delta },
        { headers: { token } }
      );
      if (response.data.success) {
        const updated = response.data.data;
        setList((prev) => prev.map((p) => (p._id === textileId ? { ...p, stock: updated.stock } : p)));
        toast.success('Stock updated');
      } else {
        toast.error(response.data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Adjust stock error:', error);
      toast.error('Failed to update stock');
    } finally {
      setBusy((b) => ({ ...b, [textileId]: false }));
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Textile Items List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b>Action</b>
        </div>
        {list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className="list-table-format">
              <img src={resolveImg(url, item.image)} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <p>
                <span className={`stock-badge ${item.stock === 0 ? 'zero' : item.stock <= 5 ? 'low' : 'ok'}`}>
                  {item.stock === 0 ? 'Out' : item.stock}
                </span>
                <span className="stock-controls">
                  <button
                    disabled={busy[item._id] || (item.stock || 0) <= 0}
                    title={item.stock <= 0 ? 'No stock to decrement' : 'Decrease stock'}
                    onClick={() => adjustStock(item._id, -1)}
                  >-</button>
                  <button
                    disabled={busy[item._id]}
                    title="Increase stock"
                    onClick={() => adjustStock(item._id, +1)}
                  >+</button>
                </span>
              </p>
              <p onClick={() => removeTextile(item._id)} className="cursor">❌</p>
            </div>
          ))
        ) : (
          <p className="no-data">No textile items available.</p>
        )}
      </div>
    </div>
  );
};

export default List;

List.propTypes = {
  url: PropTypes.string.isRequired,
};
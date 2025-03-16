import "./List.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);

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

  useEffect(() => {
    fetchList();
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
          <b>Action</b>
        </div>
        {list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className="list-table-format">
              <img src={`${url}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
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
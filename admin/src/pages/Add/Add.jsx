import "./Add.css";
import { useState } from "react";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
  category: "Fabric", // default category
  stock: "" // new stock field
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
  formData.append("stock", Number(data.stock || 0));
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/textile/add`, formData);

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Fabric",
          stock: "",
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("Error adding product. Please try again.");
    }
  };

  return (
    <div className="add">
      <h2>Add New Product</h2>
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="Upload"
            />
          </label>
          <p className="upload-text">Click to upload product image</p>
          <input
            type="file"
            id="image"
            hidden
            required
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className="form-group add-product-name">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={data.name}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="form-group add-product-description">
          <label>Product Description</label>
          <textarea
            name="description"
            rows="6"
            placeholder="Enter detailed product description"
            value={data.description}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="add-category-price">
          <div className="form-group add-category">
            <label>Product Category</label>
            <select name="category" value={data.category} onChange={onChangeHandler}>
              <option value="Fabric">Fabric</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="HomeTextiles">Home Textiles</option>
              <option value="Footwear">Footwear</option>
              <option value="Pet Wear">Pet Wear</option>
              <option value="Toddlers">Toddlers</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group add-price">
            <label>Product Price ($)</label>
            <input
              type="number"
              name="price"
              placeholder="20"
              value={data.price}
              onChange={onChangeHandler}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group add-stock">
            <label>Stock Count</label>
            <input
              type="number"
              name="stock"
              placeholder="e.g. 100"
              value={data.stock}
              onChange={onChangeHandler}
              min="0"
              step="1"
            />
          </div>
        </div>

        <button type="submit" className="add-btn">Add Product</button>
      </form>
    </div>
  );
};

Add.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Add;
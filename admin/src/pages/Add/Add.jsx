import "./Add.css";
import { useState, } from "react";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";


const Add = ({url}) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad", // default category
    // customCategory: "" // only needed if "Other" is selected
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // useEffect to log data changes
  // import usestate for this
  // useEffect(() => {
  //   console.log(data);
  // }, [data]);
const onSubmitHandler = async (event) =>{
  event.preventDefault();
  const formData = new FormData();
  formData.append("name",data.name)
  formData.append("description",data.description)
  formData.append("price",Number(data.price))
  formData.append("category",data.category)
  formData.append("image",image)
  const response = await axios.post(`${url}/api/food/add`,formData);
  // formData.append("customCategory",data.customCategory)
if(response.data.success){
  setData({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  })
  setImage(false)
  toast.success(response.data.message)
}
else{
    toast.error(response.data.message)   
}
}
  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type Here"
          />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
          />
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="PureVeg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
              <option value="Other">Other</option> {/* Uncomment this line to add the "Other" option */}
            </select>
          </div>

          {/* Add custom category input if "Other" is selected */}
          {/* {data.category === "Other" && (
            <div className="add-custom-category flex-col">
              <p>Specify Custom Category</p>
              <input
                type="text"
                name="customCategory"
                placeholder="Enter custom category"
                value={data.customCategory}
                onChange={onChangeHandler}
              />
            </div>
          )} */}

          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="Number"
              name="price"
              placeholder="$20"
            />
          </div>
        </div>
        <button type="submit" className="add-btn">ADD</button>
      </form>
    </div>
  );
};

export default Add;





// import "./Add.css";
// import { useState } from "react";
// import { assets } from "../../assets/assets";
// const Add = () => {
//   const [image, setImage] = useState(false);
//    const [data,setData]=useState({
//           name:"";
//           discription:"";
//           price:"";
//           category:"salad";

// })
// const onChangeHandler = (event)=> {
//   const name = event.target.name;
//   const value = event.target.value;
//   setData(data=>({...data,[name]}))
// }

// useEffect(()=>{
//   console.log(data)''
// },data)





  
//   return (
//     <div className="add">
//       <form className="flex-col">
//         <div className="add-img-upload flex-col">
//           <p>Upload Image </p>
//           <label htmlFor="image">
//             <img src={image?URL.createObjectURL(image):assets.upload_area} alt="" />
//           </label>
//           <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" hidden required />
//         </div>
//         <div className="add-product-name flex-col">
//           <p>Product name</p>
//           <input onChange{onChangeHandler}value{data.name} type="text" name="name" placeholder="Type Here" />
//         </div>
//         <div className="add-product-description flex-col">
//           <p>Product Discription</p>
//           <textarea  onChange={onChangeHandler} valur = {data.discription}
//             name="description"
//             rows="6"
//             placeholder="Write content here"
//           />
//         </div>
//         <div className="add-category-price">
//           <div className="add-category flex-col">
//             <p>Product category</p>
//             <select  onChange={onChangeHandler} name="category">
//               <option value="Salad">Salad</option>
//               <option value="Rolls">Rolls</option>
//               <option value="Deserts">Deserts</option>
//               <option value="Sandwich">Sandwich</option>
//               <option value="Cake">Cake</option>
//               <option value="PureVeg">Pure Veg</option>
//               <option value="Pasta">Pasta</option>
//               <option value="Noodles">Noodles</option>
//             </select>
//           </div>
//           <div className="add-price flex-col">
//             <p>Product price</p>
//             <input  onChange={onChangeHandler} value = {data.price} type="Number" name='price' placeholder="$20" />
//           </div>
//         </div>
//         <button type='submit' className="add-btn">ADD</button>
//       </form>
//     </div>
//   );
// };
import foodModel from "../models/foodModel.js";
import fs from 'fs'


//add food item

const addFood = async(req,res)=>{
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try {
        await food.save();
        console.log("Food item saved successfully");
        console.log("Name:", req.body.name);

        res.json({success:true,message:"food added"})

    }
    catch(error){
        console.log(error);
        res.json({success:false,message:"error"})
    }
}

const listFood = async(req,res)=>{
    try{
        const foods= await foodModel.find({});
        res.json({success:true,data:foods})
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const removeFood = async(req,res)=>{
    try {

        const food = await foodModel.findById(req.body.id);
        console.log(food);
        fs.unlink(`uploads/${food.image}`,()=>{})
    
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,meesage:"Food Removed"})
    } catch (error){
        console.log(error,"hh");
        res.json({Success:false,message:"Error"})
     }
}
// const removeFood = async (req, res) => {
//     try {
//    const food = await foodModel.findById(req.body.id);
  
//       if (food) {
//         // Use the path you provided (assuming uploads is in the parent directory)
//         const imagePath = `uploads/${food.image}`;
  
//         // Delete the image file (assuming uploads is the correct path)
//         fs.unlink(imagePath, (err) => {
//           if (err) {
//             console.error("Error deleting image:", err);
//             // Handle file deletion errors gracefully (e.g., log, send error response)
//           } else {
//             console.log("Image deleted successfully");
//           }
//         });
//       }
//       } catch (error) {
//       console.error(error);
//       res.json({ success: false, message: "Error removing food" });
//     }
//   };


export {addFood,listFood,removeFood}

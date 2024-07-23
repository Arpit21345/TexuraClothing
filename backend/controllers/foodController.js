import foodModel from "../models/foodModel.js";

// const fs = require('fs');
// import fs from 'fs'

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
        res.json({success:false,data:foods})
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
export {addFood,listFood}

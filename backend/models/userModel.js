import mongoose from "mongoose";
 

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    cartData:{type:Object,default:{}}
},{minimize:false})
// this minimize thing is added so that we can create that cart as an empty daTA

const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;
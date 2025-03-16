import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },  // Ensure "user" model exists
    items: { type: Array, required: true },  // Define the structure of items if needed
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "textile Processing" },  // Confirm this default value
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, default: "COD" }  // Can store "COD", "Online", etc.
}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
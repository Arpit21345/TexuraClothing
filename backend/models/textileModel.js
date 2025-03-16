import mongoose from "mongoose";

const textileSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },  // Ensure price is non-negative
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 100, min: 0 }  // Ensure stock is non-negative
}, { timestamps: true });

const textileModel = mongoose.models.textile || mongoose.model("textile", textileSchema);
export default textileModel;
import mongoose from "mongoose";

const textileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    // New: inventory stock count
    stock: { type: Number, required: true, default: 0, min: 0 }
});

const textileModel = mongoose.models.textile || mongoose.model("textile", textileSchema);
export default textileModel;
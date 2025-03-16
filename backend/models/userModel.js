import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },  // Ensure email format
    password: { type: String, required: true },
    cartData: { type: Array, default: [] },  // Array makes more sense for a cart
}, { minimize: false, timestamps: true });

// Ensure email is indexed
userSchema.index({ email: 1 }, { unique: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
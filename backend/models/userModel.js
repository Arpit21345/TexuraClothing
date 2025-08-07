import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // New profile fields
    profilePicture: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "" }
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    preferences: {
        newsletter: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
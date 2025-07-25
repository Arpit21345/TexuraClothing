import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true }
}, { minimize: false, timestamps: true });

// Ensure username and email are indexed
adminSchema.index({ username: 1 }, { unique: true });
adminSchema.index({ email: 1 }, { unique: true });

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;

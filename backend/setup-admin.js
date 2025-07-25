import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin schema (duplicate for setup)
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Admin = mongoose.model("admin", adminSchema);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Admin Setup");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

// Create initial admin
const createInitialAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: "admin" });
        
        if (existingAdmin) {
            console.log("❌ Admin already exists!");
            console.log("Username: admin");
            console.log("Use this account to login to the admin panel.");
            return;
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        const newAdmin = new Admin({
            username: "admin",
            email: "admin@texuraclothing.com",
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        await newAdmin.save();
        
        console.log("✅ Initial Admin Created Successfully!");
        console.log("=".repeat(50));
        console.log("🔐 Admin Login Credentials:");
        console.log("Username: admin");
        console.log("Password: admin123");
        console.log("Email: admin@texuraclothing.com");
        console.log("=".repeat(50));
        console.log("⚠️  IMPORTANT: Change this password after first login!");
        console.log("🚀 You can now access the admin panel");
        
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run setup
const runSetup = async () => {
    console.log("🛠️  Setting up Texura Clothing Admin...");
    await connectDB();
    await createInitialAdmin();
};

runSetup();

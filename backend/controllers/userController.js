import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Function to create JWT token with expiration
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🟢 LOGIN USER
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email, password: password ? "***provided***" : "missing" });

    try {
        if (!email || !password) {
            console.log("Missing fields - email:", !!email, "password:", !!password);
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });
        console.log("User lookup result:", user ? `Found user: ${user.name}` : "User not found");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Update last login
        await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        const token = createToken(user._id);
        console.log("Login successful for user:", user.email);
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 REGISTER USER
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.status(201).json({ success: true, token });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 GET USER PROFILE
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const updateData = { ...req.body };
        delete updateData.userId;

        // If password is being updated, hash it
        if (updateData.password) {
            if (updateData.password.length < 8) {
                return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Validate email if it's being updated
        if (updateData.email && !validator.isEmail(updateData.email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // Check if email already exists (for other users)
        if (updateData.email) {
            const existingUser = await userModel.findOne({ 
                email: updateData.email, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }
        }

        const user = await userModel.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, select: "-password" }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 UPLOAD PROFILE PICTURE
const uploadProfilePicture = async (req, res) => {
    try {
        console.log("Upload request body:", req.body); // Debug log
        console.log("Upload request file:", req.file); // Debug log
        
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID not found in request" });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." 
            });
        }

        // Validate file size (5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ 
                success: false, 
                message: "File too large. Maximum size is 5MB." 
            });
        }

        const profilePicture = req.file.filename;
        
        console.log("Looking for user with ID:", userId); // Debug log
        
        // Get current user to delete old profile picture
        const currentUser = await userModel.findById(userId);
        if (!currentUser) {
            console.log("User not found with ID:", userId); // Debug log
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("User found:", currentUser.name); // Debug log

        // Delete old profile picture if it exists
        if (currentUser.profilePicture) {
            try {
                const fs = await import('fs');
                const path = await import('path');
                const oldImagePath = path.join('uploads', currentUser.profilePicture);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } catch (deleteError) {
                console.log('Could not delete old profile picture:', deleteError);
                // Continue anyway, don't fail the upload
            }
        }
        
        const user = await userModel.findByIdAndUpdate(
            userId,
            { profilePicture },
            { new: true, select: "-password" }
        );

        console.log("User updated successfully"); // Debug log

        res.status(200).json({ 
            success: true, 
            message: "Profile picture updated successfully", 
            profilePicture: profilePicture,
            user: user
        });
    } catch (error) {
        console.error("Upload Profile Picture Error:", error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            try {
                const fs = await import('fs');
                const path = await import('path');
                const uploadPath = path.join('uploads', req.file.filename);
                if (fs.existsSync(uploadPath)) {
                    fs.unlinkSync(uploadPath);
                }
            } catch (cleanupError) {
                console.log('Could not clean up uploaded file:', cleanupError);
            }
        }
        
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 GET ALL USERS (FOR ADMIN)
const getAllUsers = async (req, res) => {
    try {
        console.log('📊 GET ALL USERS - Admin request received');
        console.log('Query params:', req.query);
        
        const { page = 1, limit = 10, search = "" } = req.query;
        
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        console.log('Database query:', query);
        console.log('Pagination - Page:', page, 'Limit:', limit);

        const users = await userModel.find(query)
            .select("-password -cartData")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalUsers = await userModel.countDocuments(query);

        console.log('Found users:', users.length);
        console.log('Total users:', totalUsers);

        res.status(200).json({
            success: true,
            users,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit)
        });
    } catch (error) {
        console.error("❌ Get All Users Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// 🟢 GET USER STATISTICS (FOR ADMIN)
const getUserStats = async (req, res) => {
    try {
        console.log('📈 GET USER STATS - Admin request received');
        
        const totalUsers = await userModel.countDocuments();
        const recentUsers = await userModel.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });
        const activeUsers = await userModel.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        console.log('Stats calculated:', { totalUsers, recentUsers, activeUsers });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                recentUsers,
                activeUsers
            }
        });
    } catch (error) {
        console.error("❌ Get User Stats Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export { 
    loginUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile, 
    uploadProfilePicture,
    getAllUsers,
    getUserStats
};
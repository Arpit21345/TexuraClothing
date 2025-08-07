import express from 'express';
import { 
    loginUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile, 
    uploadProfilePicture,
    getAllUsers,
    getUserStats
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import { uploadProfilePictureMiddleware } from "../middleware/upload.js";

const userRouter = express.Router();

// Public Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Protected Routes (require authentication)
userRouter.post("/profile", authMiddleware, getUserProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);

// Profile picture upload with custom middleware
userRouter.post("/profile-picture", authMiddleware, uploadProfilePictureMiddleware, uploadProfilePicture);

// Admin Routes (these should have admin middleware in production)
userRouter.get("/all", getAllUsers);
userRouter.get("/stats", getUserStats);

export default userRouter;
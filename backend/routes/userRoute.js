import express from 'express';
import { loginUser, registerUser } from "../middleware/controllers/userController.js";

const userRouter = express.Router();

// Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
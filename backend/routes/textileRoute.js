import express from 'express';
import { addtextile, listtextile, removetextile, getCategories, adjustStock } from '../controllers/textileController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';

const textileRouter = express.Router();

// Use memoryStorage for Cloudinary compatibility
const upload = multer({ storage: multer.memoryStorage() });

textileRouter.post("/add", upload.single("image"), addtextile);
textileRouter.get("/list", listtextile);
textileRouter.get("/categories", getCategories);
textileRouter.delete("/remove", removetextile);  // Changed to DELETE
textileRouter.post("/adjust-stock", adminAuth, adjustStock);

export default textileRouter;
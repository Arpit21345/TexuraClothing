import express from 'express';
import { addtextile, listtextile, removetextile, getCategories, adjustStock } from '../controllers/textileController.js';
import multer from 'multer';
import fs from 'fs';
import adminAuth from '../middleware/adminAuth.js';

const textileRouter = express.Router();

// Ensure 'uploads' directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

textileRouter.post("/add", upload.single("image"), addtextile);
textileRouter.get("/list", listtextile);
textileRouter.get("/categories", getCategories);
textileRouter.delete("/remove", removetextile);  // Changed to DELETE
textileRouter.post("/adjust-stock", adminAuth, adjustStock);

export default textileRouter;
import multer from "multer";
import path from "path";
import fs from "fs";

// Keep uploads dir for other features that may depend on disk
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'), false);
    }
};

const profileUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Custom middleware that preserves userId
export const uploadProfilePictureMiddleware = (req, res, next) => {
    // Store userId before multer processes the request
    const userId = req.body.userId;
    console.log("Before multer - userId:", userId);
    
    profileUpload.single("profilePicture")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false, 
                    message: "File too large. Maximum size is 5MB." 
                });
            }
            return res.status(400).json({ 
                success: false, 
                message: `Upload error: ${err.message}` 
            });
        } else if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        // Restore userId after multer processing
        req.body.userId = userId;
        console.log("After multer - userId:", req.body.userId);
        next();
    });
};

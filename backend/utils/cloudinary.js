import { v2 as cloudinary } from "cloudinary";

// Prefer explicit keys if present; otherwise rely on CLOUDINARY_URL from env
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } = process.env;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (CLOUDINARY_URL) {
  // SDK will read CLOUDINARY_URL automatically from process.env
  cloudinary.config({ secure: true });
} else {
  console.warn("Cloudinary not configured: missing credentials.");
}

export default cloudinary;

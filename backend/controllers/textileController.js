import textileModel from "../models/textileModel.js";
import fs from "fs";

// Add textile Item
const addtextile = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        let image_filename = req.file.filename;

        const textile = new textileModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        });

        await textile.save();
        console.log("textile item saved successfully:", req.body.name);

        res.json({ success: true, message: "textile added successfully" });

    } catch (error) {
        console.error("Error adding textile:", error);
        res.json({ success: false, message: "Error adding textile" });
    }
};

// List all textile Items
const listtextile = async (req, res) => {
    try {
        const textiles = await textileModel.find({});
        res.json({ success: true, data: textiles });

    } catch (error) {
        console.error("Error fetching textile list:", error);
        res.json({ success: false, message: "Error fetching textile list" });
    }
};

// Remove textile Item
const removetextile = async (req, res) => {
    try {
        const textile = await textileModel.findById(req.body.id);

        if (!textile) {
            return res.json({ success: false, message: "textile item not found" });
        }

        // Delete the image file
        const imagePath = `uploads/${textile.image}`;
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Error deleting image:", err);
            } else {
                console.log("Image deleted successfully");
            }
        });

        // Delete the textile item from DB
        await textileModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "textile item removed" });

    } catch (error) {
        console.error("Error removing textile:", error);
        res.json({ success: false, message: "Error removing textile" });
    }
};

export { addtextile, listtextile, removetextile };
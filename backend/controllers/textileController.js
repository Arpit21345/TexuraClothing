import textileModel from "../models/textileModel.js";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";

// Add textile Item (now uploads image to Cloudinary for persistence)
const addtextile = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        let image_url = null;
        // Try Cloudinary upload
        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "texura/products",
                        resource_type: "image",
                        overwrite: true,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            image_url = result.secure_url;
        } catch (cloudErr) {
            console.error("Cloudinary upload failed, falling back to local file:", cloudErr);
        }

        let image_filename = req.file.filename;
        // If Cloudinary succeeded, use URL; else fallback to local filename
        const textile = new textileModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_url || image_filename,
            stock: Number.isFinite(Number(req.body.stock)) ? Number(req.body.stock) : 0
        });

        await textile.save();
        console.log("textile item saved successfully:", req.body.name);

        res.json({ success: true, message: "textile added successfully" });

    } catch (error) {
        console.error("Error adding textile:", error);
        res.json({ success: false, message: "Error adding textile" });
    }
};

// List all textile Items with Search & Filtering
const listtextile = async (req, res) => {
    try {
        // Get query parameters
        const { 
            search = '', 
            category = '', 
            minPrice = 0, 
            maxPrice = 10000, 
            sortBy = 'name', 
            sortOrder = 'asc',
            page = 1,
            limit = 12
        } = req.query;

        // Build query object
        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter (normalize to handle spacing/case differences like "Home Textiles" vs "HomeTextiles")
        if (category && category !== 'All') {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Allow optional whitespace between characters in the provided category and ignore case
            // e.g., "Home Textiles" will match "Home Textiles" and "HomeTextiles"
            const normalizedPattern = escapeRegex(String(category)).replace(/\s+/g, '\\s*');
            query.category = new RegExp(`^${normalizedPattern}$`, 'i');
        }

        // Price range filter
        query.price = { 
            $gte: Number(minPrice), 
            $lte: Number(maxPrice) 
        };

        // Sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const textiles = await textileModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await textileModel.countDocuments(query);

        res.json({ 
            success: true, 
            data: textiles,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching textile list:", error);
        res.json({ success: false, message: "Error fetching textile list" });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await textileModel.distinct('category');
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.json({ success: false, message: "Error fetching categories" });
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

export { addtextile, listtextile, removetextile, getCategories };
// Admin: adjust stock for existing product
const adjustStock = async (req, res) => {
    try {
    let { id, delta, set } = req.body;
    // Coerce potential string numbers
    const raw = { id, delta, set };
    if (typeof delta !== 'number' && delta !== undefined) delta = Number(delta);
    if (typeof set !== 'number' && set !== undefined) set = Number(set);
    console.log("Adjust stock request:", { ...raw, parsed: { id, delta, set } });
        if (!id) return res.json({ success: false, message: "Product id is required" });

        let update;
        if (typeof set === 'number') {
            if (set < 0) return res.json({ success: false, message: "Stock cannot be negative" });
            update = { $set: { stock: Math.floor(set) } };
        } else if (typeof delta === 'number') {
            const inc = Math.floor(delta);
            if (inc === 0) return res.json({ success: true, message: "No change" });
            if (inc > 0) {
                // Simple increment
                const updated = await textileModel.findByIdAndUpdate(
                    id,
                    { $inc: { stock: inc } },
                    { new: true }
                );
                if (!updated) return res.json({ success: false, message: "Product not found for increment" });
                return res.json({ success: true, data: updated, message: "Stock increased" });
            } else {
                // Decrement: ensure not going below zero atomically
                const needed = -inc;
                const updated = await textileModel.findOneAndUpdate(
                    { _id: id, stock: { $gte: needed } },
                    { $inc: { stock: inc } },
                    { new: true }
                );
                if (!updated) {
                    return res.json({ success: false, message: "Insufficient stock to decrement or product not found" });
                }
                return res.json({ success: true, data: updated, message: "Stock decreased" });
            }
        } else {
            return res.json({ success: false, message: "Provide delta (increment) or set (absolute) value" });
        }

        const result = await textileModel.findByIdAndUpdate(id, update, { new: true });
        if (!result) return res.json({ success: false, message: "Product not found" });
        res.json({ success: true, data: result, message: "Stock updated" });
    } catch (error) {
        console.error("Error adjusting stock:", error);
        res.json({ success: false, message: "Error adjusting stock" });
    }
};

export { adjustStock };
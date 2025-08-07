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

        // Category filter
        if (category && category !== 'All') {
            query.category = category;
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
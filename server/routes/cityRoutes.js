import express from "express";
import mongoose from "mongoose";
import { cityModel } from "../models/city.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { search, country, region, sort } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (region) filter.region = { $regex: region, $options: "i" };

    const sortOption = sort === "costIndex"
      ? { costIndex: 1 }
      : { popularityScore: -1 }; // default: sort by popularity desc

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [cities, total] = await Promise.all([
      cityModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      cityModel.countDocuments(filter)
    ]);

    res.json({
      data: cities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid city id" });
    }

    const city = await cityModel.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(city);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

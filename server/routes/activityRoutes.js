import express from "express";
import mongoose from "mongoose";
import { activityModel } from "../models/activity.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { cityId, category, costMax, durationMax, search } = req.query;

    const filter = {};
    if (cityId) filter.cityId = cityId;
    if (category) filter.category = category;
    if (costMax) filter.cost = { $lte: Number(costMax) };
    if (durationMax) filter.durationMinutes = { $lte: Number(durationMax) };
    if (search) filter.name = { $regex: search, $options: "i" };

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      activityModel.find(filter).skip(skip).limit(limit).lean(),
      activityModel.countDocuments(filter)
    ]);

    res.json({
      data: activities,
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
      return res.status(400).json({ message: "Invalid activity id" });
    }

    const activity = await activityModel.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
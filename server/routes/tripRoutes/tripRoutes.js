import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Trip from "../models/Trip.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

function generateSlug(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

router.post("/", async (req, res) => {
  try {
    const { name, description, startDate, endDate, coverPhotoUrl } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "name, startDate and endDate are required" });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      name,
      description,
      startDate,
      endDate,
      coverPhotoUrl,
      stops: [],
      expenses: []
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      Trip.find({ userId: req.user.id })
        .select("name description startDate endDate coverPhotoUrl isPublic stops createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Trip.countDocuments({ userId: req.user.id })
    ]);

    const shaped = trips.map(t => ({
      ...t,
      destinationCount: t.stops ? t.stops.length : 0,
      stops: undefined
    }));

    res.json({
      data: shaped,
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
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["name", "description", "startDate", "endDate", "coverPhotoUrl"];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Trip deleted", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const nextState = typeof req.body.isPublic === "boolean" ? req.body.isPublic : !trip.isPublic;
    trip.isPublic = nextState;

    if (nextState && !trip.publicSlug) {
      let slug;
      let exists = true;
      while (exists) {
        slug = generateSlug();
        exists = await Trip.exists({ publicSlug: slug });
      }
      trip.publicSlug = slug;
    }

    await trip.save();

    res.json({
      isPublic: trip.isPublic,
      publicSlug: trip.publicSlug,
      publicUrl: trip.publicSlug ? `/trips/public/${trip.publicSlug}` : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
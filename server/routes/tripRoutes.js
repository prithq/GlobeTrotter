import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import OpenAI from "openai";
import { tripModel } from "../models/trip.model.js";
import { requireAuth } from "../middleware/auth.js";

import { buildItinerary } from "../utils/itineraryHelper.js";

const router = express.Router();

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "placeholder",
});

function generateSlug(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

/**
 * GET /api/trips/public/:slug
 * Read-only public view of a shared trip. Unauthenticated.
 */
router.get("/public/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const trip = await tripModel.findOne({ publicSlug: slug, isPublic: true });
    if (!trip) {
      return res.status(404).json({ message: "Public trip not found" });
    }

    res.json({
      ...buildItinerary(trip),
      coverPhotoUrl: trip.coverPhotoUrl || null,
      description: trip.description || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.use(requireAuth);

function getPlaceImageUrl(placeName = "") {
  const p = (placeName || "").toLowerCase().trim();
  if (p.includes("manali") || p.includes("solang") || p.includes("rohtang") || p.includes("hadimba")) return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800";
  if (p.includes("kasol") || p.includes("parvati")) return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800";
  if (p.includes("shimla") || p.includes("kullu")) return "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800";
  if (p.includes("goa")) return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800";
  if (p.includes("mumbai")) return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800";
  if (p.includes("gujarat") || p.includes("ahmedabad")) return "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800";
  if (p.includes("bangalore") || p.includes("bengaluru")) return "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800";
  if (p.includes("delhi") || p.includes("agra") || p.includes("taj")) return "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800";
  if (p.includes("jaipur") || p.includes("udaipur") || p.includes("rajasthan")) return "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800";
  if (p.includes("paris")) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800";
  if (p.includes("tokyo") || p.includes("japan") || p.includes("kyoto")) return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800";
  if (p.includes("york")) return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800";
  if (p.includes("london")) return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800";
  if (p.includes("rome") || p.includes("italy") || p.includes("venice")) return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800";
  if (p.includes("barcelona") || p.includes("spain")) return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800";
  if (p.includes("dubai") || p.includes("uae")) return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800";
  if (p.includes("bali") || p.includes("indonesia")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800";
  if (p.includes("singapore")) return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800";
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800";
}

router.post("/", async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    let coverPhotoUrl = req.body.coverPhotoUrl;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "name, startDate and endDate are required" });
    }

    if (!coverPhotoUrl || coverPhotoUrl.includes("photo-1469854523086")) {
      coverPhotoUrl = getPlaceImageUrl(name);
    }

    const trip = await tripModel.create({
      userId: req.user.id,
      name,
      description,
      startDate,
      endDate,
      coverPhotoUrl,
      targetBudget: req.body.targetBudget || 0,
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
      tripModel.find({ userId: req.user.id })
        .select("name description startDate endDate coverPhotoUrl targetBudget isPublic stops createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      tripModel.countDocuments({ userId: req.user.id })
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

    const trip = await tripModel.findOne({ _id: id, userId: req.user.id });

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
    const allowedFields = ["name", "description", "startDate", "endDate", "coverPhotoUrl", "targetBudget"];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const trip = await tripModel.findOneAndUpdate(
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

    const trip = await tripModel.findOneAndDelete({ _id: id, userId: req.user.id });

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

    const trip = await tripModel.findOne({ _id: id, userId: req.user.id });
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
        exists = await tripModel.exists({ publicSlug: slug });
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

router.post("/:id/optimize-route", async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await tripModel.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.stops || trip.stops.length < 2) {
      return res.json(trip);
    }

    const currentCityNames = trip.stops.map(s => s.cityName);

    const prompt = `
You are a geographical route optimization assistant.
The user's trip includes stops at: ${currentCityNames.join(", ")}.

Starting from "${currentCityNames[0]}", rearrange all these cities into the optimal geographical sequence to minimize travel distance and lower travel costs (avoiding back-and-forth travel, e.g., Gujarat -> Mumbai -> Bangalore).

Respond ONLY with a valid JSON array of city names in the optimized order, no markdown:
["City 1", "City 2", "City 3"]
`;

    let optimizedNames = currentCityNames;
    try {
      const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });
      let raw = "";
      for (const item of response.output) {
        if (item.type === "message") {
          for (const block of item.content) {
            if (block.type === "output_text") raw += block.text;
          }
        }
      }
      raw = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        optimizedNames = JSON.parse(match[0]);
      }
    } catch (e) {
      console.warn("Route optimization AI error, fallback to current names:", e.message);
    }

    const newStops = [];
    const remainingStops = [...trip.stops];

    for (let i = 0; i < optimizedNames.length; i++) {
      const name = optimizedNames[i];
      const matchIdx = remainingStops.findIndex(s => s.cityName.toLowerCase() === name.toLowerCase());
      if (matchIdx !== -1) {
        const found = remainingStops.splice(matchIdx, 1)[0];
        found.orderIndex = i;
        newStops.push(found);
      }
    }
    remainingStops.forEach((s) => {
      s.orderIndex = newStops.length;
      newStops.push(s);
    });

    const startMs = new Date(trip.startDate).getTime();
    const endMs = new Date(trip.endDate).getTime();
    const totalDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
    const daysPerStop = Math.max(1, Math.floor(totalDays / newStops.length));

    let currentStart = new Date(trip.startDate);
    for (let i = 0; i < newStops.length; i++) {
      const stopEnd = new Date(currentStart);
      const addDays = (i === newStops.length - 1)
        ? Math.max(0, Math.floor((endMs - currentStart.getTime()) / (1000 * 60 * 60 * 24)))
        : daysPerStop - 1;
      stopEnd.setDate(stopEnd.getDate() + addDays);

      newStops[i].startDate = currentStart;
      newStops[i].endDate = stopEnd;

      currentStart = new Date(stopEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    trip.stops = newStops;
    await trip.save();
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:tripId/stops", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { cityId, cityName, startDate, endDate } = req.body;

    if (!cityId || !cityName || !startDate || !endDate) {
      return res.status(400).json({ message: "cityId, cityName, startDate and endDate are required" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const orderIndex = trip.stops.length;

    if (!trip.coverPhotoUrl || trip.coverPhotoUrl.includes("photo-1469854523086")) {
      trip.coverPhotoUrl = getPlaceImageUrl(cityName);
    }

    trip.stops.push({
      cityId,
      cityName,
      startDate,
      endDate,
      orderIndex,
      activities: []
    });

    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:tripId/stops/:stopId", async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const allowedFields = ["cityName", "startDate", "endDate"];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[`stops.$[stop].${field}`] = req.body[field];
    }

    const trip = await tripModel.findOneAndUpdate(
      { _id: tripId, userId: req.user.id },
      { $set: updates },
      {
        arrayFilters: [{ "stop._id": stopId }],
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:tripId/stops/:stopId", async (req, res) => {
  try {
    const { tripId, stopId } = req.params;

    const trip = await tripModel.findOneAndUpdate(
      { _id: tripId, userId: req.user.id },
      { $pull: { stops: { _id: stopId } } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:tripId/stops/reorder", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { orderedStopIds } = req.body;

    if (!Array.isArray(orderedStopIds)) {
      return res.status(400).json({ message: "orderedStopIds must be an array" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    orderedStopIds.forEach((stopId, index) => {
      const stop = trip.stops.id(stopId);
      if (stop) stop.orderIndex = index;
    });

    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.post("/:tripId/stops/:stopId/activities", async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const { activityId, name, category, scheduledDate, scheduledTime, cost } = req.body;

    if (!activityId || !name || !category || cost === undefined) {
      return res.status(400).json({ message: "activityId, name, category and cost are required" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const stop = trip.stops.id(stopId);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    const orderIndex = stop.activities.length;

    stop.activities.push({
      activityId,
      name,
      category,
      scheduledDate,
      scheduledTime,
      orderIndex,
      cost
    });

    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:tripId/stops/:stopId/activities/:activityId", async (req, res) => {
  try {
    const { tripId, stopId, activityId } = req.params;
    const allowedFields = ["scheduledDate", "scheduledTime", "cost"];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`stops.$[stop].activities.$[activity].${field}`] = req.body[field];
      }
    }

    const trip = await tripModel.findOneAndUpdate(
      { _id: tripId, userId: req.user.id },
      { $set: updates },
      {
        arrayFilters: [{ "stop._id": stopId }, { "activity._id": activityId }],
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:tripId/stops/:stopId/activities/:activityId", async (req, res) => {
  try {
    const { tripId, stopId, activityId } = req.params;

    const trip = await tripModel.findOneAndUpdate(
      { _id: tripId, userId: req.user.id },
      { $pull: { "stops.$[stop].activities": { _id: activityId } } },
      {
        arrayFilters: [{ "stop._id": stopId }],
        new: true
      }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:tripId/stops/:stopId/activities/reorder", async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const { orderedActivityIds } = req.body;

    if (!Array.isArray(orderedActivityIds)) {
      return res.status(400).json({ message: "orderedActivityIds must be an array" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const stop = trip.stops.id(stopId);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    orderedActivityIds.forEach((activityId, index) => {
      const activity = stop.activities.id(activityId);
      if (activity) activity.orderIndex = index;
    });

    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
export default router;
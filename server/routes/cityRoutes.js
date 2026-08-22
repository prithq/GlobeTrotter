import express from "express";
import mongoose from "mongoose";
import OpenAI from "openai";
import { cityModel } from "../models/city.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "placeholder",
});

function getCityImageUrl(cityName = "") {
  const c = (cityName || "").toLowerCase().trim();
  if (c.includes("manali") || c.includes("solang") || c.includes("rohtang")) return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800";
  if (c.includes("kasol") || c.includes("parvati")) return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800";
  if (c.includes("shimla") || c.includes("kullu")) return "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800";
  if (c.includes("goa")) return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800";
  if (c.includes("udaipur") || c.includes("jaipur")) return "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800";
  if (c.includes("mumbai")) return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800";
  if (c.includes("delhi") || c.includes("agra")) return "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800";
  if (c.includes("paris")) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800";
  if (c.includes("tokyo") || c.includes("japan") || c.includes("kyoto")) return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800";
  if (c.includes("york")) return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800";
  if (c.includes("london")) return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800";
  if (c.includes("rome") || c.includes("italy") || c.includes("venice")) return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800";
  if (c.includes("barcelona") || c.includes("spain")) return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800";
  if (c.includes("dubai")) return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800";
  if (c.includes("bali")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800";
  if (c.includes("singapore")) return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800";
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800";
}

// Fetch city information dynamically using OpenAI
async function fetchCitiesFromOpenAI(searchQuery) {
  try {
    const prompt = `
You are a travel database assistant. The user is searching for a destination or city named "${searchQuery.trim()}".
Generate accurate, real-world details for "${searchQuery.trim()}" and 2 nearby popular travel destinations or cities.

Respond ONLY with a valid JSON array of objects (no markdown, no code fence, no extra text):
[
  {
    "name": "City Name",
    "country": "Country Name",
    "region": "Asia",
    "costIndex": 50,
    "popularityScore": 95,
    "description": "Concise 1-sentence description of key highlights and attractions."
  }
]

Allowed region values: "Asia", "Europe", "North America", "South America", "Africa", "Oceania".
costIndex should be an integer between 30 and 100.
popularityScore should be an integer between 75 and 99.
`;

    let response;
    try {
      response = await openai.responses.create({
        model: "gpt-5-mini",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
      });
    } catch (e) {
      response = await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });
    }

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
    if (!match) return [];

    const aiCities = JSON.parse(match[0]);
    if (!Array.isArray(aiCities)) return [];

    const processed = [];
    for (const c of aiCities) {
      if (!c.name) continue;
      const cityObj = {
        name: c.name.trim(),
        country: c.country ? c.country.trim() : "Unknown",
        region: c.region || "Asia",
        costIndex: Number(c.costIndex) || 50,
        popularityScore: Number(c.popularityScore) || 90,
        imageUrl: getCityImageUrl(c.name),
        description: c.description || `Popular travel destination in ${c.country || 'the region'}.`
      };

      // Upsert into MongoDB
      await cityModel.updateOne(
        { name: cityObj.name },
        { $setOnInsert: cityObj },
        { upsert: true }
      );
      processed.push(cityObj);
    }
    return processed;
  } catch (err) {
    console.error("OpenAI city fetch error:", err.message);
    return [];
  }
}

// GET /api/cities - Live city search backed by OpenAI
router.get("/", async (req, res) => {
  try {
    const { search, country, region, sort } = req.query;

    const filter = {};
    if (search && search.trim()) filter.name = { $regex: search.trim(), $options: "i" };
    if (country && country.trim()) filter.country = { $regex: country.trim(), $options: "i" };
    if (region && region.trim()) filter.region = { $regex: region.trim(), $options: "i" };

    let dbCount = await cityModel.countDocuments(filter);

    // If searching and fewer than 1 match in DB, dynamically fetch from OpenAI!
    if (search && search.trim() && dbCount < 1) {
      await fetchCitiesFromOpenAI(search.trim());
    }

    const sortOption = sort === "costIndex"
      ? { costIndex: 1 }
      : { popularityScore: -1 };

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
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

// GET /api/cities/:id
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

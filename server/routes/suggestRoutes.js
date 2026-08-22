import express from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "placeholder",
});

router.post("/optimize-route", async (req, res) => {
  try {
    const { origin, destinations } = req.body;
    let citiesList = [];
    if (origin && Array.isArray(destinations)) {
      citiesList = [origin.trim(), ...destinations.map((d) => d.trim())];
    } else if (Array.isArray(destinations)) {
      citiesList = destinations.map((d) => d.trim());
    } else {
      return res.status(400).json({ message: "An array of 'destinations' is required." });
    }

    if (citiesList.length < 2) {
      return res.json({
        optimizedSequence: citiesList,
        reasoning: "Route has fewer than 2 stops.",
        estimatedTransitCostUsd: 50,
      });
    }

    const prompt = `
You are a geographical route optimization assistant.
The user wants to travel between these locations: ${citiesList.join(", ")}.

Starting from "${citiesList[0]}", rearrange all locations in the optimal geographical sequence so that total travel distance and travel cost are kept as LOW as possible (avoid unnecessary back-and-forth travel, e.g., Gujarat -> Mumbai -> Bangalore instead of Gujarat -> Bangalore -> Mumbai).

Respond ONLY with a valid JSON object in this exact shape, no markdown:
{
  "optimizedSequence": ["Location 1", "Location 2", "Location 3"],
  "reasoning": "One concise sentence explaining why this sequence lowers travel distance and cost.",
  "estimatedTransitCostUsd": number
}
`;

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

    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const result = JSON.parse(match[0]);
        return res.json(result);
      } catch (e) {}
    }

    res.json({
      optimizedSequence: citiesList,
      reasoning: "Route preserved in geographic layout.",
      estimatedTransitCostUsd: citiesList.length * 75,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stops", async (req, res) => {
  try {
    const { from, to, route } = req.query;
    let routeQuery = "";
    if (from && to) {
      routeQuery = `${from.trim()} to ${to.trim()}`;
    } else if (route) {
      routeQuery = route.trim();
    } else {
      return res.status(400).json({ message: "Query params 'from' and 'to' (or 'route') are required" });
    }

    const prompt = `
You are an expert travel routing guide. Given a travel itinerary route from "${routeQuery}", suggest 4 top intermediate cities/stops that lie logically along or near this travel route.

For each suggested stop respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "name": "City Name",
    "country": "Country Name",
    "why": "One short sentence why this is a perfect stop along this route.",
    "suggestedDays": 2
  }
]

Keep explanations under 15 words per item. Return exactly 4 items.
`;

    let response;
    try {
      response = await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });
    } catch (apiErr) {
      return res.status(500).json({ message: "AI route suggestion failed: " + apiErr.message });
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

    let stops = [];
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        stops = JSON.parse(match[0]);
      } catch (e) {}
    }

    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(500).json({ message: "Could not parse route stops from AI response" });
    }

    res.json({
      route: routeQuery,
      suggestedStops: stops.slice(0, 4),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/budget", async (req, res) => {
  try {
    const { stops } = req.body;
    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ message: "Array of 'stops' is required in request body" });
    }

    const stopsSummary = stops.map(s => `${s.cityName || s.city} (${s.days || 2} days)`).join(", ");
    const totalDays = stops.reduce((sum, s) => sum + (Number(s.days) || 2), 0);

    const prompt = `
You are a travel budget estimation assistant. Given the following proposed trip stops: ${stopsSummary} (total duration ~${totalDays} days), estimate realistic travel costs in USD.

Respond ONLY with a valid JSON object in this exact shape, no markdown, no extra text:
{
  "stops": [
    {
      "city": "City Name",
      "days": number,
      "transportation_usd": number,
      "accommodation_usd": number,
      "food_usd": number,
      "activities_usd": number,
      "stop_total_usd": number
    }
  ],
  "summary": {
    "total_transportation_usd": number,
    "total_accommodation_usd": number,
    "total_food_usd": number,
    "total_activities_usd": number,
    "grand_total_usd": number,
    "average_per_day_usd": number
  }
}
`;

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

    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const estimate = JSON.parse(match[0]);
        return res.json({ aiEstimate: estimate });
      } catch (e) {}
    }

    res.status(500).json({ message: "Could not parse budget estimate from AI response" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { place } = req.query;

    if (!place || place.trim().length === 0) {
      return res.status(400).json({ message: "Query param 'place' is required" });
    }

    const prompt = `
You are a travel guide assistant. Using web search, find the top 6 must-visit places in "${place.trim()}".

For each place respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "name": "Place name",
    "what": "One short sentence — what this place is.",
    "why": "One short sentence — why a traveler should visit."
  }
]

Keep each sentence under 15 words. Return exactly 6 items.
`;

    let response;
    try {
      response = await openai.responses.create({
        model: "gpt-5-mini",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
      });
    } catch (apiErr) {
      console.warn("Web search preview failed, retrying without web search:", apiErr.message);
      response = await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });
    }

    let raw = "";
    for (const item of response.output) {
      if (item.type === "message") {
        for (const block of item.content) {
          if (block.type === "output_text") {
            raw += block.text;
          }
        }
      }
    }
    raw = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

    let suggestions = [];
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        suggestions = JSON.parse(match[0]);
      } catch (e) {
        console.error("JSON parse failed for AI suggestions:", e.message);
      }
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      let currentPlace = null;
      for (const line of lines) {
        const cleaned = line.replace(/^[\s\-*\d.]+\s*/, "").trim();
        if (!cleaned) continue;
        if (cleaned.includes("—") || cleaned.includes(" - ")) {
          const parts = cleaned.split(/—|-/);
          currentPlace = {
            name: parts[0].replace(/[*_]/g, "").trim(),
            what: parts.slice(1).join(" ").replace(/[*_]/g, "").trim(),
            why: `Must visit destination in ${place.trim()}`,
          };
          suggestions.push(currentPlace);
        } else if (currentPlace && /why/i.test(cleaned)) {
          currentPlace.why = cleaned.replace(/^Why( visit)?:?\s*/i, "").replace(/[*_]/g, "").trim();
        }
      }
    }

    if (!suggestions || suggestions.length === 0) {
      return res.status(500).json({ message: "Could not parse suggestions from AI response" });
    }

    res.json({
      place: place.trim(),
      suggestions: suggestions.slice(0, 6),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

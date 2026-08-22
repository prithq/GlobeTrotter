import express from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

/**
 * GET /api/suggest?place=Goa
 * Returns top 6 places to visit in the given city/place.
 * Uses gpt-5-mini with web_search_preview.
 *
 * Response shape:
 * {
 *   place: "Goa",
 *   suggestions: [
 *     {
 *       name: "Baga Beach",
 *       what: "A lively beach famous for golden sand and watersports.",
 *       why: "Best for jet-sports, beach shacks and Goa's party scene."
 *     },
 *     ...
 *   ]
 * }
 */
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

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [{ type: "web_search_preview" }],
      input: prompt,
    });

    // Extract text from response
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

    // Strip markdown fences if present
    raw = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

    // Extract JSON array from response (GPT sometimes adds extra text)
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ message: "Could not parse suggestions from AI response" });
    }

    const suggestions = JSON.parse(match[0]);

    res.json({
      place: place.trim(),
      suggestions: suggestions.slice(0, 6),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

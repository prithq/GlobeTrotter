import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const MODEL = "gpt-5-mini";

/**
 * Given trip data, asks GPT to estimate costs per city stop for:
 * - transportation (flights/trains to reach the city)
 * - accommodation (per night)
 * - food (per day)
 * - user's activities (already in the trip)
 *
 * Returns structured JSON with per-stop breakdown + grand total.
 */
export async function estimateTripBudget(trip) {
  // Build a compact trip summary to send to GPT
  const stopsSummary = trip.stops.map((stop) => {
    const days = Math.max(
      1,
      Math.round(
        (new Date(stop.endDate) - new Date(stop.startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );

    const activities = stop.activities.map((a) => ({
      name: a.name,
      category: a.category,
      userCost: a.cost,
    }));

    return {
      city: stop.cityName,
      days,
      activities,
    };
  });

  const totalDays = Math.max(
    1,
    Math.round(
      (new Date(trip.endDate) - new Date(trip.startDate)) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  const prompt = `
You are a travel budget estimation assistant. Given the following multi-city trip plan, estimate realistic costs in USD.

Trip: "${trip.name}"
Total duration: ${totalDays} days
Stops: ${JSON.stringify(stopsSummary, null, 2)}

For EACH city stop estimate:
1. transportation_usd — cost to travel TO this city (flight or train from previous stop, or origin for first stop)
2. accommodation_usd — total accommodation cost for the stay (based on mid-range hotel)
3. food_usd — total food cost for the stay (3 meals/day, mid-range)
4. activities_usd — total estimated cost for the listed activities (use userCost if provided, otherwise estimate)

Also provide a grand_total_usd across all stops.

Respond ONLY with a valid JSON object in this exact shape, no markdown, no explanation:
{
  "stops": [
    {
      "city": "string",
      "days": number,
      "transportation_usd": number,
      "accommodation_usd": number,
      "food_usd": number,
      "activities_usd": number,
      "stop_total_usd": number,
      "activities": [
        { "name": "string", "estimated_cost_usd": number }
      ]
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
    model: MODEL,
    input: prompt,
  });

  // Extract text output
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

  // Strip markdown code fences if GPT wraps with them
  raw = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (err) {
      console.error("JSON parse failed for budget estimate match:", err.message);
    }
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("GPT returned invalid JSON: " + raw.slice(0, 200));
  }
}

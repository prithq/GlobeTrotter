import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://Earlycustomers-new.services.ai.azure.com/openai/v1",
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

async function main() {
  console.log("Testing web_search with gpt-4o-mini...\n");

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    tools: [{ type: "web_search_preview" }],
    input: "Top 6 places to visit in Goa. For each: name, one line what it is, one line why visit.",
  });

  for (const item of response.output) {
    if (item.type === "message") {
      for (const block of item.content) {
        if (block.type === "output_text") {
          console.log(block.text);
        }
      }
    }
  }
}

main().catch(console.error);

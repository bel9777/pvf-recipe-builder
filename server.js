require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("\nWARNING: ANTHROPIC_API_KEY is not set.");
  console.warn("Copy .env.example to .env and add your API key.\n");
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

app.post("/api/recipes", async (req, res) => {
  const { selectedProducts, seasonalProduce, month, occasion, cuisine, servings } = req.body;

  if (!selectedProducts || selectedProducts.length === 0) {
    return res.status(400).json({ error: "Select at least one Park View Farm product to get started." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured. Add ANTHROPIC_API_KEY to your .env file." });
  }

  const prompt = buildPrompt({ selectedProducts, seasonalProduce, month, occasion, cuisine, servings });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }]
    });

    const text = message.content[0].text;
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array in Claude response:", text.slice(0, 300));
      return res.status(500).json({ error: "Recipe generation failed. Please try again." });
    }

    const recipes = JSON.parse(match[0]);
    res.json({ recipes });
  } catch (err) {
    console.error("Claude API error:", err.message);
    if (err.status === 401) {
      return res.status(500).json({ error: "Invalid API key. Check your .env file." });
    }
    res.status(500).json({ error: "Recipe generation failed. Please try again." });
  }
});

function buildPrompt({ selectedProducts, seasonalProduce, month, occasion, cuisine, servings }) {
  const monthName = MONTH_NAMES[month] ?? "the current month";

  const productLines = selectedProducts
    .map(p => `- ${p.name}: ${p.description}`)
    .join("\n");

  const produceLines = seasonalProduce
    .map(p => `- ${p}`)
    .join("\n");

  const occasionText = occasion === "any" ? "any occasion" : occasion;
  const cuisineText = cuisine === "any" ? "no particular cuisine preference" : cuisine;

  return `You are a culinary assistant for Park View Farm, a family farm in Leicester, NY (Western New York, near Letchworth State Park). Park View Farm raises chicken, pork (Idaho Pasture Pigs), eggs, duck, turkey, and rabbit using pasture-based systems with corn-free and soy-free feed. This is a meaningful, verifiable distinction — most farms that claim "pasture-raised" still feed corn and soy. Park View Farm does not.

The customer has selected these Park View Farm products they want to cook with:
${productLines}

In ${monthName}, these items are typically available at farmers markets and farm stands in the Western New York / Finger Lakes region:
${produceLines}

What the customer wants:
- Occasion: ${occasionText}
- Cuisine preference: ${cuisineText}
- Servings: ${servings} people

Generate exactly 4 distinct recipe ideas. Make them genuinely good and achievable — the kind of meals a Western New York family would actually cook after a Saturday trip to the Brighton Farmers Market. Not food magazine precious. Not overly complex. Just real, satisfying food that makes the most of excellent ingredients.

Each recipe MUST feature at least one of the selected Park View Farm products as a main component, and should incorporate produce that is seasonally available in the region.

Return a JSON array of exactly 4 recipe objects, each with this exact structure:

{
  "name": "Recipe name",
  "tagline": "One vivid, appetizing sentence that makes you want to cook this",
  "occasion": "Quick weeknight | Weekend dinner | Sunday roast | Backyard cookout | Brunch | Special occasion",
  "cuisine": "American farmhouse | Italian | Mexican | Asian-inspired | Mediterranean | Other",
  "prep_time": "15 min",
  "cook_time": "30 min",
  "total_time": "45 min",
  "servings": 4,
  "difficulty": "Easy | Medium | Advanced",
  "farm_products": ["product names exactly as listed above"],
  "market_produce": ["seasonal items used from local markets"],
  "pantry_staples": ["salt", "olive oil", "etc"],
  "ingredients": [
    { "amount": "2 lbs", "item": "chicken thighs, bone-in", "source": "pvf" },
    { "amount": "3 cups", "item": "cherry tomatoes", "source": "market" },
    { "amount": "2 tbsp", "item": "olive oil", "source": "pantry" }
  ],
  "instructions": [
    "Preheat the oven to 425°F.",
    "Season the chicken thighs generously on both sides with salt and pepper.",
    "Continue with remaining steps..."
  ],
  "market_tip": "Practical advice for buying the seasonal produce at the farmers market — what to look for, how to pick the best, storage tips.",
  "pvf_note": "A short, honest note on why Park View Farm's corn/soy-free, pasture-raised products make this recipe taste noticeably better — be specific, not generic.",
  "tags": ["one-pan", "gluten-free", "kid-friendly", "etc"]
}

Source values for ingredients: "pvf" = Park View Farm product, "market" = local seasonal produce, "pantry" = staple ingredient.

Return ONLY the raw JSON array. No markdown, no explanation, no code fences. Start with [ and end with ].`;
}

app.listen(PORT, () => {
  console.log(`\nPark View Farm Recipe Builder`);
  console.log(`Running at: http://localhost:${PORT}\n`);
});

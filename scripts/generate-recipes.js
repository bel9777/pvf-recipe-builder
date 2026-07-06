#!/usr/bin/env node
/* Grow the recipe library with Claude.
   Usage:
     node scripts/generate-recipes.js --count 4 --meal weeknight --cuisine italian --months 7,8,9 --products pork-chops,chicken-thighs

   All flags optional. New recipes are validated (schema + product slugs
   against the live catalog) and appended to docs/recipes.json. Review the
   diff before committing — every recipe ships in the farm's voice.
   Needs ANTHROPIC_API_KEY in .env or the environment. */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const DOCS = path.join(__dirname, "..", "docs");
const INVENTORY_URL = "https://bel9777.github.io/pvf-order-planner/inventory.json";

const MEALS = ["breakfast", "weeknight", "sunday-dinner", "cookout", "soup-stew", "special"];
const CUISINES = ["farmhouse", "italian", "mexican", "asian", "mediterranean"];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Set ANTHROPIC_API_KEY in .env first.");
    process.exit(1);
  }

  const count = Number(arg("count", "4"));
  const meal = arg("meal", "");
  const cuisine = arg("cuisine", "");
  const months = arg("months", "");
  const products = arg("products", "");

  const library = JSON.parse(fs.readFileSync(path.join(DOCS, "recipes.json"), "utf8"));
  const inventory = await (await fetch(INVENTORY_URL)).json();
  const catalog = inventory.products.filter(
    (p) => !["freezer-bundles", "farm-supporter-program"].includes(p.category) && !/deposit/i.test(p.name));
  const seasonal = fs.readFileSync(path.join(DOCS, "seasonal.js"), "utf8");
  const existing = library.recipes.map((r) => `- ${r.name} (${r.mealType}, ${r.cuisine}, products: ${r.farmProducts.join(", ")})`).join("\n");

  const sample = JSON.stringify(library.recipes[0], null, 2);

  const prompt = `You are writing recipes for Park View Farm, a family farm in Leicester, NY (Genesee Valley, at the north entrance of Letchworth State Park). Brian, Sarah, and George raise Cornish Cross chickens, Idaho Pasture Pigs, Katahdin/White Dorper lambs, laying hens, and seasonal turkeys — pasture-raised on a corn-and-soy-free ration from County Line Feeds. Poultry is processed at HLW Acres; pork and lamb at Timberline Meats.

VOICE RULES (non-negotiable):
- The farmer talks, not the brand: "our pigs", "we", never "Park View Farm believes".
- "Pasture-raised" NEVER appears without "corn-and-soy-free" in the same breath.
- Specifics beat slogans: breeds, towns (Leicester, Brighton, Letchworth, Genesee Valley), processors, numbers.
- Banned words: artisan, journey, passionate, dedicated, hand-crafted, premium, all-natural, lovingly, wholesome, our promise, discover the difference.
- Recipes are real food a Western New York family would actually cook. Not food-magazine precious.
- At most one em dash per recipe's prose fields. Plain warm sentences.

THE STORE CATALOG (use these exact slugs in farmProducts and pvf ingredient slugs — no other slugs exist):
${catalog.map((p) => `- ${p.slug}: ${p.name} ($${p.price}/${p.price_unit})`).join("\n")}

WESTERN NY SEASONAL PRODUCE CALENDAR (ground every market ingredient and month tag in this):
${seasonal}

RECIPES ALREADY IN THE LIBRARY (do not duplicate these dishes or lean on the same combinations):
${existing}

TASK: Write exactly ${count} new recipes.${meal ? ` Meal type: ${meal}.` : ""}${cuisine ? ` Cuisine: ${cuisine}.` : ""}${months ? ` They must be in season in month(s) ${months}.` : ""}${products ? ` Each must feature at least one of: ${products}.` : ""}

Each recipe must match this exact JSON structure (this is a real example from the library — match its field names, style, and depth):
${sample}

Field constraints:
- mealType: one of ${MEALS.join(" | ")}
- cuisine: one of ${CUISINES.join(" | ")}
- months: array of integers 1-12 when the dish is at its seasonal best
- ingredients[].source: "pvf" | "market" | "pantry"; every pvf ingredient needs a valid slug
- farmProducts: the pvf slugs used
- id: unique kebab-case, not already in the library

Return ONLY a raw JSON array of ${count} recipe objects. No markdown, no code fences.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log(`Asking Claude for ${count} recipe(s)...`);
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array in response:\n" + text.slice(0, 400));
  const candidates = JSON.parse(match[0]);

  // Validate before anything touches the library.
  const validSlugs = new Set(catalog.map((p) => p.slug));
  const existingIds = new Set(library.recipes.map((r) => r.id));
  const required = ["id", "name", "tagline", "mealType", "cuisine", "months", "totalTime",
    "totalMinutes", "servings", "difficulty", "farmProducts", "ingredients", "instructions",
    "marketTip", "pvfNote", "tags"];
  const errors = [];
  for (const r of candidates) {
    for (const f of required) if (!(f in r)) errors.push(`${r.id || "?"}: missing ${f}`);
    if (existingIds.has(r.id)) errors.push(`${r.id}: duplicate id`);
    if (!MEALS.includes(r.mealType)) errors.push(`${r.id}: bad mealType ${r.mealType}`);
    if (!CUISINES.includes(r.cuisine)) errors.push(`${r.id}: bad cuisine ${r.cuisine}`);
    for (const s of r.farmProducts || [])
      if (!validSlugs.has(s)) errors.push(`${r.id}: unknown product slug ${s}`);
    for (const i of r.ingredients || [])
      if (i.source === "pvf" && !validSlugs.has(i.slug)) errors.push(`${r.id}: pvf ingredient without valid slug (${i.item})`);
    for (const m of r.months || [])
      if (m < 1 || m > 12) errors.push(`${r.id}: bad month ${m}`);
  }
  if (errors.length) {
    console.error("Validation failed — nothing written:\n" + errors.join("\n"));
    process.exit(1);
  }

  library.recipes.push(...candidates);
  fs.writeFileSync(path.join(DOCS, "recipes.json"), JSON.stringify(library, null, 2) + "\n");
  console.log(`Added ${candidates.length} recipe(s):`);
  for (const r of candidates) console.log(`  - ${r.name} (${r.mealType}, ${r.cuisine})`);
  console.log("\nReview the diff (voice check!) before committing.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });

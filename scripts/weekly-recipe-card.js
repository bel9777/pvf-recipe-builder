#!/usr/bin/env node
/* Weekly recipe card for the Tuesday PVF email.
   Picks the most seasonal, in-stock, least-recently-featured recipe and
   prints a Drip-ready card skeleton (plain <p>/<strong>/<br>/<a> HTML,
   matching the weekly-email paste conventions). The drafting session
   polishes the wording to fit that week's email; this script owns the
   PICK and the FACTS.

   Usage:
     node scripts/weekly-recipe-card.js            # pick + card + runners-up
     node scripts/weekly-recipe-card.js --list     # all current candidates, scored
     node scripts/weekly-recipe-card.js --pick <id># force a specific recipe
     node scripts/weekly-recipe-card.js --log <id> # record a feature in featured-log.json

   No API key, no dependencies. Selection is season-first:
   in season this month > narrow season window (more distinctly seasonal)
   > "last call" bonus when the window closes after this month
   > never/least featured. */

const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "docs");
const LOG_PATH = path.join(__dirname, "featured-log.json");
const INVENTORY_URL = "https://bel9777.github.io/pvf-order-planner/inventory.json";
const PAGE = "https://parkviewfamilyfarm.com/farm-recipes";

function loadLog() {
  try { return JSON.parse(fs.readFileSync(LOG_PATH, "utf8")); }
  catch (e) { return { featured: [] }; }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] || true) : null;
}

async function main() {
  const { recipes } = JSON.parse(fs.readFileSync(path.join(DOCS, "recipes.json"), "utf8"));
  const log = loadLog();
  const month = new Date().getMonth() + 1;

  // --log <id>: record and exit
  const logId = arg("log");
  if (logId && logId !== true) {
    if (!recipes.some((r) => r.id === logId)) { console.error(`Unknown recipe id: ${logId}`); process.exit(1); }
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    log.featured.push({ id: logId, date: localDate });
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
    console.log(`Logged: ${logId} featured ${log.featured.at(-1).date} (${log.featured.length} total features on record)`);
    return;
  }

  // Live stock — nice to have; selection still works without it.
  let inventory = null;
  try {
    const data = await (await fetch(INVENTORY_URL)).json();
    inventory = Object.fromEntries(data.products.map((p) => [p.slug, p]));
  } catch (e) {
    console.error("(inventory fetch failed — skipping stock check)");
  }

  const timesFeatured = (id) => log.featured.filter((f) => f.id === id).length;
  const lastFeatured = (id) => log.featured.filter((f) => f.id === id).map((f) => f.date).sort().at(-1) || "never";

  const nextMonth = (month % 12) + 1;
  const scored = recipes
    .filter((r) => r.months.includes(month))
    .filter((r) => !inventory || r.farmProducts.every((s) => inventory[s]?.in_stock))
    .map((r) => {
      let score = 13 - r.months.length;              // narrow window = more seasonal
      if (!r.months.includes(nextMonth)) score += 6; // last call this month
      score -= timesFeatured(r.id) * 10;             // strongly prefer fresh picks
      return { r, score };
    })
    .sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id));

  if (!scored.length) {
    console.log("No in-season, in-stock, unfeatured candidates this month — relax the stock filter or pick by hand with --pick <id>.");
    return;
  }

  if (arg("list")) {
    for (const { r, score } of scored)
      console.log(`${String(score).padStart(3)}  ${r.id.padEnd(36)} months:${r.months.join(",")}  featured:${lastFeatured(r.id)}`);
    return;
  }

  const pickId = arg("pick");
  const pick = pickId && pickId !== true
    ? recipes.find((r) => r.id === pickId)
    : scored[0].r;
  if (!pick) { console.error(`Unknown recipe id: ${pickId}`); process.exit(1); }

  // Season lead: the recipe's market ingredients are its seasonal hook.
  const marketItems = pick.ingredients.filter((i) => i.source === "market").map((i) => i.item.split(",")[0].trim());
  const farmItems = pick.farmProducts.map((s) => inventory?.[s]?.name || s);
  const url = `${PAGE}?recipe=${encodeURIComponent(pick.id)}`;
  const lastCall = !pick.months.includes(nextMonth);

  const card = [
    `<p><strong>This week's recipe: ${pick.name}</strong><br>`,
    `${pick.tagline}<br>`,
    `At the market right now: ${marketItems.slice(0, 3).join(", ")}.${lastCall ? " The window on this one closes soon." : ""}<br>`,
    `&rarr; <a href="${url}">Get the full recipe (the farm ingredients add to your cart in one click)</a></p>`,
  ].join("\n");

  console.log("=== PICK ===");
  console.log(`${pick.name}  [${pick.id}]`);
  console.log(`why: in season (months ${pick.months.join(",")})${lastCall ? ", LAST CALL after this month" : ""}; featured: ${lastFeatured(pick.id)}`);
  console.log(`farm items (verify stock at draft time): ${farmItems.join(", ")}`);
  console.log(`deep link: ${url}`);
  console.log("\n=== CARD SKELETON (Drip-ready; polish wording in the draft session) ===\n");
  console.log(card);
  console.log("\n=== RUNNERS-UP ===");
  for (const { r } of scored.filter((s) => s.r.id !== pick.id).slice(0, 3))
    console.log(`- ${r.name} [${r.id}]  months:${r.months.join(",")}`);
  console.log(`\nAfter the email ships with this recipe: node scripts/weekly-recipe-card.js --log ${pick.id}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });

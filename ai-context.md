# PVF Recipe Builder — AI Context

> Read this before touching any file in this repo.

## What this is

A customer-facing web app for Park View Farm (parkviewfamilyfarm.com) that generates recipe ideas using PVF products + what's seasonally available at Western NY farmers markets. Built with Node.js + Express on the backend and vanilla HTML/CSS/JS on the frontend. Claude (Anthropic) generates recipes on demand.

## Business context

- **Farm:** Park View Farm, Leicester, NY (Genesee Valley / Finger Lakes region)
- **Owner:** Brian Lenhard
- **E-commerce:** GrazeCart at parkviewfamilyfarm.com
- **Primary market:** Greater Rochester metro, Brighton Farmers Market
- **Core products:** Pasture-raised chicken, Idaho Pasture Pig pork, corn/soy-free eggs, duck, turkey, rabbit, and value-added (bacon, sausage, ham)
- **Key differentiator:** Corn-free and soy-free feed — verifiable and rare. This must be reflected in recipe notes and product descriptions throughout the app.

## App concept

Customers pick PVF products they have or want to order. The app shows what's in season in Western NY for the selected month, then generates recipes using Claude that combine those farm products with local seasonal produce. Recipe cards distinguish three ingredient sources: PVF (green), farmers market (amber), pantry staples (gray).

Classic use case: customer selects Smoked Bacon in August → app shows tomatoes, corn, basil in season → Claude generates a BLT recipe with notes on picking peak-season tomatoes at the Brighton market.

## Tech stack

| Layer | Tech |
|---|---|
| Server | Node.js + Express (server.js) |
| AI | Anthropic Claude (claude-haiku-4-5-20251001) |
| Frontend | Vanilla HTML/CSS/JS — no build step |
| Product data | Static (products.js) — ready for GrazeCart API replacement |
| Seasonal data | Static (seasonal.js) — Western NY calendar, hardcoded |

## Running locally

```
cp .env.example .env          # add ANTHROPIC_API_KEY
npm install
npm start                     # http://localhost:3000
```

## Key files

| File | Purpose |
|---|---|
| server.js | Express server + Claude API proxy endpoint (POST /api/recipes) |
| products.js | PVF product catalog — 36 products across 6 categories |
| seasonal.js | Western NY produce calendar by month + colorForProduce() |
| index.html | App shell — static structure only |
| styles.css | All visual styling |
| app.js | All frontend logic — state, rendering, API calls |

## Product catalog (products.js)

36 products across 6 categories: Chicken (7), Pork (9), Sausage & Bacon (8), Eggs (2), Duck & Turkey (6), Rabbit (2). Each product has: `id`, `name`, `category`, `description`, `url`, `available`, optional `seasonal: true`.

Product URLs are currently set to `https://parkviewfamilyfarm.com/products/[slug]` — these need to be verified against live GrazeCart URLs when the GrazeCart integration is built.

## Seasonal data (seasonal.js)

Western NY / Genesee Valley produce calendar tuned for Leicester, NY (zone 5b-6a). 12 months (0–11). Each month has `label`, `produce[]` array, and `notes` string. Includes `colorForProduce(name)` helper using partial string matching.

## Claude prompt (server.js → buildPrompt)

Prompt grounds Claude in PVF's specific story (corn/soy-free, Idaho Pasture Pigs, Leicester NY). Returns structured JSON with: name, tagline, occasion, cuisine, prep/cook/total time, difficulty, farm_products, market_produce, pantry_staples, ingredients (with source: pvf|market|pantry), instructions, market_tip, pvf_note, tags.

Model: claude-haiku-4-5-20251001. Can upgrade to claude-sonnet for better recipe quality.

## What's NOT done yet

1. **GrazeCart API integration** — products.js is a static list. When ready: add GRAZECART_API_KEY + GRAZECART_STORE_ID to .env, add GET /api/products endpoint in server.js that fetches live inventory, update app.js to call it on load.
2. **Deployment** — not yet deployed. Target: Render.com (connect GitHub repo, set ANTHROPIC_API_KEY env var, deploy). Then link from GrazeCart site.
3. **Recipe detail page** — currently all content is in the card expand. Could become a dedicated /recipe/[id] route.
4. **Saved recipes** — no persistence yet. Recipes are generated fresh each session.
5. **Real GrazeCart product URLs** — need to verify slugs against live site.

## Working style (Brian's preferences)

- Direct answers, no flattery
- "Build it now" over "plan it more"
- Preserve working behavior — don't rebuild what works
- Keep prose tight, use tables/lists for technical content
- Written deliverables go in .docx format (not .md) — but technical/code files like this are fine as .md

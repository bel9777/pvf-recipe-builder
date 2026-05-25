# Current State — May 25, 2026

## Status: Working locally, needs API key to generate recipes

The app runs. The UI is complete. Recipe generation is wired up. The only thing between here and a fully functional demo is adding the Anthropic API key to a .env file.

## What was built this session

Started from a static HTML/CSS/JS prototype (no backend, sample data, generic products). Rebuilt as a real Node.js app with:

**Backend (server.js)**
- Express server serving static files + one API endpoint: POST /api/recipes
- Claude API proxy — frontend never touches the API key
- Structured prompt grounded in PVF's story (Leicester NY, corn/soy-free, Idaho Pasture Pigs)
- Returns JSON: name, tagline, occasion, cuisine, timing, difficulty, ingredients (source-tagged), instructions, market tip, PVF note

**Product catalog (products.js)**
- 36 real PVF products across 6 categories (Chicken, Pork, Sausage & Bacon, Eggs, Duck & Turkey, Rabbit)
- Each product has name, description, category, URL, availability flag
- Structured for easy replacement with a live GrazeCart API call

**Seasonal data (seasonal.js)**
- 12-month Western NY produce calendar tuned to Leicester, NY (zone 5b-6a)
- Each month: produce list, farmers market notes, color mapping
- Much more specific than the generic regional calendar in the prototype

**UI (index.html / styles.css / app.js)**
- PVF-branded header linking to parkviewfamilyfarm.com
- 6-tab product selector with all 36 products
- 4 quick-start presets (Summer BLT setup, Breakfast spread, Backyard cookout, Sunday roast)
- Season strip showing current month's WNY produce with farmers market notes
- Occasion, cuisine, and servings filters
- Loading state, error state, empty state
- Recipe cards with color-coded ingredients: green = PVF, amber = market, gray = pantry
- Expand toggle for full instructions + farmers market tip + PVF product note
- "Order" links on each card → PVF product pages

**Repo**
- Created: bel9777/pvf-recipe-builder (private)
- All files committed and pushed

## To run

```
cd "C:\Users\blenhard\Documents\Codex\2026-05-17\place-holder-for-new-project-app"
# Make sure .env exists with ANTHROPIC_API_KEY set
npm start
# Open http://localhost:3000
```

## Immediate next step

Add the Claude API key:
1. Copy `.env.example` to `.env` in the project folder
2. Set `ANTHROPIC_API_KEY=your_key`
3. Restart the server
4. Try the "Summer BLT setup" preset + August + any occasion → Find Recipes

## Open questions for Brian

- Do you want to test recipe quality before deploying, or deploy first and test live?
- Are the product names in products.js accurate, or are there products on the site that should be added/removed?
- What GrazeCart URL slugs are the actual product pages? (e.g., is it /products/smoked-bacon or /products/bacon?)
- Ready to deploy to Render.com? Takes about 20 minutes end-to-end.

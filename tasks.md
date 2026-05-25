# PVF Recipe Builder — Tasks

## Now (unblocked)

- [ ] Add ANTHROPIC_API_KEY to .env and test recipe generation end-to-end
- [ ] Review Claude output quality — do recipes feel right for PVF customers?
- [ ] Verify product URLs match live GrazeCart slugs at parkviewfamilyfarm.com
- [ ] Tune the Claude prompt if recipe output needs adjustment (server.js → buildPrompt)

## Next (needs decisions or credentials)

- [ ] GrazeCart API integration — fetch live product inventory instead of static products.js
  - Need: GrazeCart API key + store ID
  - Add GET /api/products endpoint to server.js
  - Update app.js to call it on load
- [ ] Deploy to Render.com
  - Push repo to GitHub (done)
  - Create Render Web Service, connect repo, set ANTHROPIC_API_KEY
  - Get the public URL
- [ ] Add "Recipe Builder" link to parkviewfamilyfarm.com (GrazeCart nav or footer)

## Backlog

- [ ] Upgrade Claude model from Haiku to Sonnet for better recipe quality (one-line change in server.js)
- [ ] Add a dietary filter (gluten-free, dairy-free, low-carb) to the UI and prompt
- [ ] Add recipe persistence — save favorites to localStorage
- [ ] Add a shareable recipe URL (GET /recipe/:id route)
- [ ] Add admin product toggle — mark products as currently available/unavailable without touching code
- [ ] Consider adding ZIP-code-based local market finder (link to LocalHarvest or similar)
- [ ] Test on mobile — the two-column layout collapses to single column at 900px

## Completed

- [x] Initial prototype built (May 17, 2026) — static app, sample data
- [x] Full rebuild (May 25, 2026) — Node.js server, Claude API, PVF products, WNY seasonal calendar, new UI with category tabs and color-coded ingredients
- [x] GitHub repo created: bel9777/pvf-recipe-builder

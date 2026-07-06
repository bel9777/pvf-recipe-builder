# Current state — PVF Recipes

Updated: 2026-07-06 (v2 rebuild session, Claude Fable)

## Status: BUILT + TESTED LOCALLY — not yet deployed

Complete rebuild. v1 (Node/Express + per-request Claude generation, never
deployed) replaced with a static app on the Order Planner's proven rails:
GitHub Pages + GrazeCart-page embed + same-origin one-click add-to-cart.

## What was built this session

- **23-recipe seed library** (`docs/recipes.json`), hand-written in the
  farm voice. Tagged by meal type (6), cuisine (5), season months, and
  live store product slugs — all validated against the real catalog.
  Every month of the year has recipes. Includes currently-sold-out lamb
  recipes on purpose (they show the "sold out right now" badge and keep
  lamb desire warm between batches).
- **Three entry modes**: Browse (meal type × cuisine chips), Start from
  your items (product picker grouped by category, with per-product recipe
  counts and honest "nothing yet for X" gaps), What's in season (month →
  WNY produce chips + notes + month-matched recipes).
- **Live catalog integration**: fetches the Order Planner's daily-scraped
  inventory.json at runtime — real product names, URLs, stock badges.
  Graceful degradation if the fetch fails.
- **One-click add-to-cart per recipe** (embedded on parkviewfamilyfarm.com
  only): ports the Order Planner's verified Livewire mechanism, adds one
  of each in-stock farm item, link fallback everywhere else. NOT yet
  tested on the live site (needs the page embed first).
- **Library growth pipeline**: `scripts/generate-recipes.js` — Claude
  writes new recipes constrained by catalog slugs, seasonal calendar,
  existing library (no dupes), and the brand voice; schema-validated
  before writing. Needs ANTHROPIC_API_KEY in .env.
- **embed.js**: same two-line GrazeCart paste pattern as the planner
  (`<div id="pvf-recipes"></div>` + script tag).

## Verified locally (preview, 2026-07-06)

Browse filters (single + combined + empty state), items mode (selection,
ranking, zero-match message), season mode (month switch, produce strip,
recipe filtering), card expand (source-grouped ingredients, steps, tips),
in-season-first sort, sold-out badges from live inventory, cart button
correctly hidden off-site, mobile 375px layout. Add-to-cart NOT yet
exercised against the live store.

## Deploy plan (pending Brian's go)

1. Flip repo public (GitHub Pages needs it on this plan) — check history
   for secrets first (clean: only .env.example ever committed).
2. Enable Pages: master branch, /docs folder.
3. GrazeCart: new custom page (e.g. /recipes-new or replace /recipes) with
   the two-line embed; verify add-to-cart signed in, then swap nav link
   from the old 2-recipe GrazeCart recipes page.
4. Verify live: stock badges, cart fill, mobile.
5. Optional launch: July delivery email + link from Order Planner.

## Open items

- Old GrazeCart /recipes page (2 recipes) to be retired/redirected at swap.
- Serving sizes/times are Claude's informed estimates; Brian should spot-
  check a couple of recipes he's actually cooked.
- Live "generate me a custom recipe" endpoint (v1's feature) deliberately
  deferred: needs always-on hosting + API key + abuse control. The library
  + pipeline covers the need for now; revisit if customers ask.
- Consider a monthly GitHub Action: generate 3-4 recipes for next month's
  produce, open a PR for Brian's voice review.
- No recipe images yet — cards are text-first by design; product photos
  exist in inventory.json if we ever want thumbnails on the farm-item line.

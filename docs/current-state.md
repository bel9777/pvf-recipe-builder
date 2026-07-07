# Current state — PVF Recipes

Updated: 2026-07-06 (v2 rebuild + same-day ship, Claude Fable)

## Status: SHIPPED — LIVE at parkviewfamilyfarm.com/farm-recipes

Complete rebuild of v1 (Node/Express per-request generator, never deployed)
as a static app on the Order Planner's rails, deployed the same day.

- **Live page**: https://parkviewfamilyfarm.com/farm-recipes — GrazeCart
  page id 10, HTML widget with the two-line embed. Also serves at the
  grazecart.com mirror domain.
- **Nav**: main menu item labeled "Recipes" (position 4, after Where We
  Deliver) → /farm-recipes. The old built-in Recipes nav link was removed.
- **Pages**: repo public, GitHub Pages serves docs/ at
  https://bel9777.github.io/pvf-recipe-builder/
- **Add-to-cart VERIFIED live** (2026-07-06, Brian's signed-in session on
  the grazecart domain): expanded the August BLT, one click → bacon in
  cart → verified at /cart → removed to leave the cart clean. Same
  Livewire mechanism as the Order Planner.

## What shipped

- 23-recipe hand-written seed library (docs/recipes.json), tagged by meal
  type / cuisine / months / live product slugs, brand voice throughout.
- Three entry modes: Browse (meal × cuisine), Start from your items
  (live-catalog picker with per-product recipe counts), What's in season
  (WNY produce calendar by month).
- Live inventory from the Order Planner's daily scrape (stock badges,
  names, URLs; graceful degradation).
- Per-recipe one-click add-to-cart when embedded (adds one of each
  in-stock farm item); order-link fallback on github.io / signed out.
- scripts/generate-recipes.js — Claude pipeline to grow the library
  (validates slugs + schema; human voice review required before commit).

## Deploy details (for future reference)

- GrazeCart page-builder REST API (discovered this session, bypasses the
  fragile drag-drop UI + Ace editor): GET/POST
  `/admin/pages/<id>/widgets` with `X-XSRF-TOKEN` from the XSRF cookie.
  Widget payload: {page_id, title:"HTML", template:"HTML", content,
  settings:{layout_width:"full-width"}, enabled:1, visible:1, sort:0}.
- Menu items are edited via a modal (.gc-modal-container) with title +
  path inputs — the nav item is label "Recipes", path "/farm-recipes".
- Page slugs are FIXED at creation from the page name; renaming a page
  does NOT change its slug. /recipes is owned by GrazeCart's built-in
  recipes feature and can't be claimed by a custom page.

## Leftovers / open items

- **Stray page id 9** ("Farm Recipes", slug /recipes, shadowed by the
  built-in route so customers never see it): delete via Admin → My Site →
  Pages trash icon. API DELETE returned 500; UI delete needs a human
  click (native confirm dialog fights automation).
- Old built-in /recipes page (2 recipes) still exists, now unlinked from
  nav. Fine to leave; delete the 2 built-in recipes whenever.
- Brian to spot-check a few recipes he's cooked (times/servings are
  Claude estimates) and skim pvfNote lines for voice.
- Launch pushes: July delivery email section, link from Order Planner
  page, QR at Brighton booth.
- Consider a monthly Action: generate 3-4 next-month recipes → PR for
  Brian's voice review.
- github.io assets cache ~10 min after a push (Pages max-age=600); the
  embedded page self-heals.

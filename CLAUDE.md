# PVF Recipes — agent guide

Read `docs/current-state.md` first for where things stand.

## What this is

Static recipe library for Park View Farm (parkviewfamilyfarm.com). Customers
find recipes three ways — browse by meal type/cuisine, start from the farm
products they own, or by what's in season in Western NY — and add the farm
ingredients to their GrazeCart cart in one click. Replaces the old 2-recipe
GrazeCart /recipes page. Serves the farm goal: show customers what to cook
so they order more cuts, and more kinds of cuts.

This is v2. v1 (a Node/Express app that generated recipes per-request with
the Claude API) lives in git history before the v2 commit — the per-visitor
API cost, hosting need, and stale hardcoded catalog are why it was replaced.

## Architecture

- `docs/` is the deployed site (GitHub Pages). No build step, no framework.
  Keep it that way unless Brian asks.
- `docs/recipes.json` is THE product — a curated, tagged recipe library.
  Every recipe: mealType, cuisine, months (1-12), farmProducts (live store
  slugs), source-tagged ingredients (pvf/market/pantry), marketTip, pvfNote.
- Live catalog comes at runtime from the Order Planner's daily scrape:
  https://bel9777.github.io/pvf-order-planner/inventory.json (stock badges,
  product names, URLs). If that fetch fails the app degrades gracefully.
- `scripts/generate-recipes.js` grows the library with Claude (needs
  ANTHROPIC_API_KEY in .env). It validates slugs/schema before writing.
  ALWAYS grade generated recipes against `RECIPE-QUALITY-BAR.md` (repo root)
  before committing — it defines reject/fix criteria and the whole-animal
  batch balance rule.
- One-click add-to-cart works only when embedded on parkviewfamilyfarm.com
  (same-origin GrazeCart Livewire mechanism, identical to the Order
  Planner's — see that repo's docs). On github.io it falls back to links.

## Rules

- Product slugs in recipes.json MUST exist in the live store catalog.
  Validate after any edit:
  `python -c "import json;rs=json.load(open('docs/recipes.json'))['recipes'];import urllib.request;inv={p['slug'] for p in json.load(urllib.request.urlopen('https://bel9777.github.io/pvf-order-planner/inventory.json'))['products']};bad=[(r['id'],s) for r in rs for s in r['farmProducts'] if s not in inv];print(bad or 'ok')"`
- Voice for all customer-facing copy: PVF brand voice (farmer talks, not
  the brand; "pasture-raised" always paired with "corn-and-soy-free";
  specifics — breeds, Leicester/Brighton/Letchworth, processors; no AI
  tells, max ~1 em dash per prose field). pvfNote and marketTip are copy.
- The seasonal calendar (`docs/seasonal.js`) is shared WNY data — months
  are 0-indexed there, 1-indexed in recipes.json. Don't "fix" either.
- Publishing changes to the live site = pushing to main (Pages serves
  docs/). That is customer-facing; confirm with Brian before pushing copy
  or logic changes.
- `git push` must run from PowerShell on Brian's machine (the Bash tool
  can't drive the credential helper).

## Local dev

`npm run serve` (or the pvf-recipe-builder entry in ~/.claude/launch.json),
then http://localhost:8644.

## End of session

Update `docs/current-state.md` and Brian's memory/shared brain per his
handoff discipline.

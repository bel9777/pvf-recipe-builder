# PVF Recipes

Recipe library for [Park View Farm](https://parkviewfamilyfarm.com) —
pasture-raised, corn-and-soy-free chicken, pork, lamb, turkey, and eggs
from Leicester, NY.

Customers find recipes three ways:

1. **Browse** — by meal type and cuisine
2. **Start from your items** — pick the cuts in your freezer or your order
3. **What's in season** — Western NY produce calendar, month by month

Every recipe tags its ingredients by source (farm / farmers market /
pantry), shows live stock from the store, and — when embedded on
parkviewfamilyfarm.com — adds the farm items to your cart in one click.

## Layout

- `docs/` — the deployed static site (GitHub Pages, no build step)
  - `recipes.json` — the recipe library (the actual product)
  - `seasonal.js` — WNY seasonal produce calendar (zone 5b-6a)
  - `embed.js` — two-line embed for a GrazeCart custom page
- `scripts/generate-recipes.js` — grow the library with Claude

## Develop

```
npm run serve   # http://localhost:8644
```

## Grow the library

```
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run generate -- --count 4 --months 8,9 --meal weeknight
```

Generated recipes are schema- and slug-validated automatically, but every
recipe gets a human voice review before it ships.

See `CLAUDE.md` for working rules and `docs/current-state.md` for status.

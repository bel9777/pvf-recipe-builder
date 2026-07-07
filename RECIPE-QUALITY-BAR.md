# Recipe Quality Bar

Written 2026-07-07. `scripts/generate-recipes.js` validates schema and slugs; it cannot judge
quality. This file is the judgment layer: grade every generated recipe against it BEFORE
committing to `docs/recipes.json`. CLAUDE.md's "review against brand voice" rule means this
checklist.

## REJECT the recipe (fix or drop — these reach customers as errors)

1. **Wrong cooking science.** Internal temps must be correct where stated: poultry 165°F,
   pork 145°F + rest, ground meats 160°F. Times must be plausible for the cut (a 3-hour
   pork-butt braise is wrong; so is a 20-minute one). A recipe that fails a customer's dinner
   damages trust in the meat itself — this is the highest-severity check.
2. **Fake seasonality.** Every month in `months` must match real Western NY availability of
   the produce in the recipe (cross-check `docs/seasonal.js`; remember it's 0-indexed there,
   1-indexed in recipes.json). Tomatoes in April = reject.
3. **Invented farm facts in `pvfNote`.** Breeds, feed, practices, and locations must come
   from the confirmed-facts list in the brand-voice memory / BRAND-VOICE.md (Cornish Cross,
   Idaho Pasture Pigs, Katahdin/White Dorper; County Line feed; HLW Acres poultry, Timberline
   pork/lamb; Leicester at the north entrance of Letchworth). Anything else is fabrication.
4. **Unpaired claim.** "Pasture-raised" without "corn-and-soy-free" in the same breath, in any
   copy field.
5. **No-words** in any copy field: artisan, story, journey, lovingly, passionate, premium,
   hand-crafted, all-natural, wholesome, sustainable, "discover the difference".
6. **Slug not in live inventory** (the validator catches this — never override it).
7. **Near-duplicate**: same protein + same primary technique + overlapping season as an
   existing recipe. The library's value is coverage, not volume.

## FIX before commit (quality, not correctness)

1. `pvfNote` and `marketTip` are Brian-voice COPY, not metadata: first person, one concrete
   specific (cut behavior, farm practice, market detail), max ~1 em dash, no AI tells. A
   pvfNote that could appear on any farm's website is a miss — it should only make sense
   coming from Park View.
2. `marketTip` names something real: Brighton market vendors/produce timing, an actual WNY
   substitution. Generic "check your local farmers market" = rewrite.
3. Servings stay conventional and conservative (the Order Planner's serving math is NOT
   Brian-verified — never let a recipe imply precise per-person meat math).
4. Ingredient source tags honest: pvf = in the live catalog; market = seasonal WNY produce;
   pantry = shelf staples. A pvf-taggable item tagged pantry loses a sale.
5. Title is search-shaped and concrete ("Braised Fresh Ham Hocks with Cabbage", not "Cozy
   Winter Comfort Bowl").

## LIBRARY-LEVEL rule (check per batch, not per recipe)

- **Whole-animal balance.** Each generation batch: at least a third of new recipes feature
  underdog cuts — hocks, shanks, organs, stock bags, ground, bone-in braising cuts — not just
  breasts, bacon, and chops. Moving the cuts that don't sell themselves is the reason this
  library exists; a batch of ten boneless-breast recipes grows traffic without growing orders.
- Keep meal-type and cuisine coverage spreading (the browse filters should never have an
  empty-feeling category).

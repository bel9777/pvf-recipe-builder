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

## Coverage rule (Brian, 2026-07-06)

Every cookable product in the store gets AT LEAST ONE recipe. As of
2026-07-06 all 44 cookable products are covered (bundles, Farm Supporter
Program, and the hog deposit are excluded by design). When the scraper
picks up a NEW product, write or generate a recipe for it — the "Start
from your items" picker shows a recipe count on every chip, and a chip
with no count is a dead end we promised not to have.

## What shipped

- 41-recipe hand-written library (23 seed + 18 added same day for full coverage) (docs/recipes.json), tagged by meal
  type / cuisine / months / live product slugs, brand voice throughout.
- Three entry modes: Browse (meal × cuisine), Start from your items
  (live-catalog picker with per-product recipe counts), What's in season
  (WNY produce calendar by month).
- Live inventory from the Order Planner's daily scrape (stock badges,
  names, URLs; graceful degradation).
- Per-recipe one-click add-to-cart when embedded (adds one of each
  in-stock farm item); order-link fallback on github.io / signed out.
- Per-recipe Print + Share (added 2026-07-06, Brian request): Print builds
  a clean print sheet (checkbox ingredients, no site chrome — sheet is a
  direct body child so the GrazeCart wrapper prints hidden; print dialog
  covers Save-as-PDF). Share uses navigator.share (mobile tray = text/
  email/anything) -> clipboard copy -> visible link, in that order. Deep
  links: ?recipe=<id> opens + jumps to that recipe (instant scroll on
  purpose — smooth never completes in background tabs).
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

## Servings + package math (Brian's feedback, built 2026-07-07)

Every pvf ingredient in recipes.json carries a structured quantity at the
recipe's base servings: `lb` (by-weight cuts), `count` (eggs; dozen packs),
or `packs: 1` + `fixed: true` (whole birds/roasts/stock bags). Package
sizes come LIVE from the order planner scrape's `avg_weight_lb` — no
hardcoded package table; if the store repacks, the app follows the scrape.
Open cards get a servings stepper (2–16): culinary amounts scale (leading-
number parser, nice fractions), and the "Your farm order for N" line
recomputes packages + estimated dollars. Add-to-cart sends the computed
package count per product (stacked Livewire calls, planner-verified
mechanism). Print sheet uses the scaled amounts + farm-order line.

STRETCH constants in app.js: another package is added only past a 15%
overshoot (35% for fixed whole items — a bird carves thinner before you
buy a second). Pack contents CONFIRMED by Brian 2026-07-07: ham steak 1/pack; Italian
sausage (mild+hot) + chorizo 3 links/pack; breakfast sausage 10/pack;
leg quarters 2/pack; thighs 4/pack; boneless breasts 2/pack; bone-in
breast 1 whole (one bird)/pack; drumsticks 6/pack; hot dogs 8/pack
(July 4 sale record); chops 2/pack (fresh + smoked); hocks usually
1/pack; lamb shanks 2/pack; turkey legs 2/pack — ALL pack contents now
Brian-confirmed (2026-07-07). Lamb loin/rib chops still assumed 4/pack,
but Brian doesn't expect to sell lamb chops anytime soon — recipes stay
(sold-out badges cover them); recheck if lamb chops return.
generate-recipes.js now requires the quantity fields on new recipes.

## Weekly email recipe card (built 2026-07-06, STARTS with the 2026-07-14 send)

`scripts/weekly-recipe-card.js` — no API key, no deps. Picks the most
seasonal (narrow month window > "last call" bonus), in-stock,
least-recently-featured recipe and prints a Drip-ready card skeleton +
deep link. `--list` / `--pick <id>` / `--log <id>` (repeat-avoidance
lives in scripts/featured-log.json — created on first --log). Wired into
the pvf-weekly-email scheduled task as Phase 2 Step 2b, explicitly gated:
SKIP the 2026-07-07 send (that week: Rochester deadline, Buffalo rollout,
order planner, where-we-deliver). Social posting of the cooked recipe is
Brian's separate manual thing — deliberately NOT part of this process.

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

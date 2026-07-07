/* Park View Farm Recipes — app logic.
   Static app; recipe library in recipes.json, live catalog from the
   order planner's daily scrape. When embedded on parkviewfamilyfarm.com
   (via embed.js) the one-click add-to-cart uses the store's own
   Livewire mechanism, same as the Order Planner. */

const PAGES_BASE = "https://bel9777.github.io/pvf-recipe-builder/";
const INVENTORY_URL = "https://bel9777.github.io/pvf-order-planner/inventory.json";
const EMBEDDED = document.body.classList.contains("pvf-embedded");
const ASSET_BASE = EMBEDDED ? PAGES_BASE : "";

const MEALS = [
  { id: "all", label: "Everything" },
  { id: "breakfast", label: "Breakfast" },
  { id: "weeknight", label: "Weeknight" },
  { id: "sunday-dinner", label: "Sunday dinner" },
  { id: "cookout", label: "Cookout" },
  { id: "soup-stew", label: "Soups & stews" },
  { id: "special", label: "Special occasion" },
];
const CUISINES = [
  { id: "all", label: "Any cuisine" },
  { id: "farmhouse", label: "American farmhouse" },
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "asian", label: "Asian-inspired" },
  { id: "mediterranean", label: "Mediterranean" },
];
const PICKER_CATEGORIES = [
  { id: "chicken", label: "Chicken" },
  { id: "pork", label: "Pork" },
  { id: "turkey", label: "Turkey" },
  { id: "lamb", label: "Lamb" },
  { id: "eggs", label: "Eggs" },
];

const state = {
  mode: "browse",
  meal: "all",
  cuisine: "all",
  selectedSlugs: new Set(),
  month: new Date().getMonth() + 1, // 1-12
  openId: null,
  servingsFor: {}, // recipe id -> chosen servings (default: recipe.servings)
};

let recipes = [];
let inventory = null; // slug -> product, or null while loading / if fetch failed

const $ = (sel) => document.querySelector(sel);

/* ── boot ─────────────────────────────────────────── */

async function init() {
  bindModeTabs();
  renderChipRow($("#mealChips"), MEALS, () => state.meal, (id) => { state.meal = id; renderList(); });
  renderChipRow($("#cuisineChips"), CUISINES, () => state.cuisine, (id) => { state.cuisine = id; renderList(); });
  $("#monthSelect").value = String(state.month);
  $("#monthSelect").addEventListener("change", (e) => {
    state.month = Number(e.target.value);
    renderSeason();
    renderList();
  });
  $("#clearItems").addEventListener("click", () => {
    state.selectedSlugs.clear();
    renderProductGroups();
    renderList();
  });
  renderSeason();

  try {
    const resp = await fetch(ASSET_BASE + "recipes.json", { cache: "no-cache" });
    recipes = (await resp.json()).recipes;
  } catch (e) {
    $("#recipeList").innerHTML = "";
    $("#countLine").textContent = "";
    const empty = $("#emptyState");
    empty.hidden = false;
    empty.innerHTML = `The recipes couldn't load. <a href="${PAGES_BASE}">Try opening the page here</a>.`;
    return;
  }
  // Deep link: ?recipe=<id> opens straight to that recipe (shared links).
  const wanted = new URLSearchParams(location.search).get("recipe");
  if (wanted && recipes.some((r) => r.id === wanted)) {
    state.openId = wanted;
  }
  renderList();

  // Live catalog — nice to have; everything still works if it fails.
  try {
    const resp = await fetch(INVENTORY_URL, { cache: "no-cache" });
    const data = await resp.json();
    inventory = {};
    for (const p of data.products) inventory[p.slug] = p;
  } catch (e) {
    inventory = null;
  }
  renderProductGroups();
  renderList(); // pick up stock badges

  // Deep-link scroll happens after the FINAL render — an earlier smooth
  // scroll would be cancelled when this re-render replaces the card.
  // Instant jump, not smooth: smooth scrolling is animation-driven and
  // never completes in a background tab (how shared links often open).
  if (wanted && state.openId === wanted) {
    setTimeout(() => {
      document.querySelector(`.recipe-card[data-id="${wanted}"]`)
        ?.scrollIntoView({ block: "start" });
    }, 150);
  }
}

/* ── modes ────────────────────────────────────────── */

function bindModeTabs() {
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      document.querySelectorAll(".mode-tab").forEach((t) =>
        t.setAttribute("aria-selected", String(t === tab)));
      document.querySelectorAll("[data-mode-panel]").forEach((p) =>
        p.hidden = p.dataset.modePanel !== state.mode);
      renderList();
    });
  });
}

/* ── controls rendering ───────────────────────────── */

function renderChipRow(container, options, getCurrent, onPick) {
  container.innerHTML = options.map((o) =>
    `<button type="button" class="chip" data-id="${o.id}" aria-pressed="${o.id === getCurrent()}">${o.label}</button>`
  ).join("");
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      onPick(chip.dataset.id);
      container.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c.dataset.id === chip.dataset.id)));
    });
  });
}

function recipeCountFor(slug) {
  return recipes.filter((r) => r.farmProducts.includes(slug)).length;
}

function renderProductGroups() {
  const mount = $("#productGroups");
  if (!inventory) {
    // Fall back to the products the recipes know about.
    const slugs = [...new Set(recipes.flatMap((r) => r.farmProducts))];
    mount.innerHTML = `<div class="chip-row">${slugs.map((slug) => {
      const name = recipes.flatMap((r) => r.ingredients).find((i) => i.slug === slug)?.item || slug;
      return productChip(slug, titleCase(name.split(",")[0]), true);
    }).join("")}</div>`;
    bindProductChips(mount);
    return;
  }

  mount.innerHTML = PICKER_CATEGORIES.map((cat) => {
    const prods = Object.values(inventory).filter((p) =>
      p.category === cat.id && !/deposit/i.test(p.name));
    if (!prods.length) return "";
    return `<div class="product-group">
      <div class="chip-row-label">${cat.label}</div>
      <div class="chip-row">${prods.map((p) => productChip(p.slug, p.name, p.in_stock)).join("")}</div>
    </div>`;
  }).join("");
  bindProductChips(mount);
  updateSelectedBar();
}

function productChip(slug, name, inStock) {
  const count = recipeCountFor(slug);
  const pressed = state.selectedSlugs.has(slug);
  return `<button type="button" class="chip" data-slug="${escapeHtml(slug)}" aria-pressed="${pressed}">
    ${escapeHtml(name)}${count ? `<span class="chip-count">${count} recipe${count === 1 ? "" : "s"}</span>` : ""}${inStock ? "" : `<span class="chip-out">sold out</span>`}
  </button>`;
}

function bindProductChips(mount) {
  mount.querySelectorAll(".chip[data-slug]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const slug = chip.dataset.slug;
      if (state.selectedSlugs.has(slug)) state.selectedSlugs.delete(slug);
      else state.selectedSlugs.add(slug);
      chip.setAttribute("aria-pressed", String(state.selectedSlugs.has(slug)));
      updateSelectedBar();
      renderList();
    });
  });
}

function updateSelectedBar() {
  const bar = $("#selectedBar");
  const n = state.selectedSlugs.size;
  bar.hidden = n === 0;
  $("#selectedText").textContent = `${n} item${n === 1 ? "" : "s"} selected`;
}

function renderSeason() {
  const data = WNY_SEASONAL[state.month - 1];
  if (!data) return;
  $("#seasonStrip").innerHTML = data.produce.map((item) =>
    `<span class="season-chip"><span class="season-dot" style="background:${colorForProduce(item)}"></span>${escapeHtml(titleCase(item))}</span>`
  ).join("");
  $("#seasonNotes").textContent = data.notes;
}

/* ── filtering ────────────────────────────────────── */

function visibleRecipes() {
  const now = new Date().getMonth() + 1;
  if (state.mode === "browse") {
    return recipes
      .filter((r) => state.meal === "all" || r.mealType === state.meal)
      .filter((r) => state.cuisine === "all" || r.cuisine === state.cuisine)
      .sort((a, b) =>
        (b.months.includes(now) - a.months.includes(now)) || a.name.localeCompare(b.name));
  }
  if (state.mode === "items") {
    if (state.selectedSlugs.size === 0) return [];
    const overlap = (r) => r.farmProducts.filter((s) => state.selectedSlugs.has(s)).length;
    return recipes
      .filter((r) => overlap(r) > 0)
      .sort((a, b) => (overlap(b) - overlap(a)) ||
        (b.months.includes(now) - a.months.includes(now)) || a.name.localeCompare(b.name));
  }
  // season mode
  return recipes
    .filter((r) => r.months.includes(state.month))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function countLineText(shown) {
  if (state.mode === "items" && state.selectedSlugs.size === 0)
    return "Pick a product or two above to see what to cook with it.";
  if (state.mode === "items") {
    const noMatch = [...state.selectedSlugs].filter((s) => recipeCountFor(s) === 0);
    let line = `${shown} recipe${shown === 1 ? "" : "s"} for what you picked.`;
    if (noMatch.length) {
      const names = noMatch.map((s) => inventory?.[s]?.name || s).join(", ");
      line += ` Nothing yet for ${names} — we add recipes every month.`;
    }
    return line;
  }
  if (state.mode === "season") {
    const label = WNY_SEASONAL[state.month - 1]?.label || "";
    return `${shown} recipe${shown === 1 ? "" : "s"} in season in ${label}.`;
  }
  return `${shown} recipe${shown === 1 ? "" : "s"}. In-season picks first.`;
}

/* ── servings scaling & package math ──────────────── */

const EGGS_PER_PACK = 12; // eggs sell by the dozen
// Stretch tolerance before another package is added: recipes flex, and a
// whole bird carves a lot thinner before you truly need a second one.
const STRETCH = 0.15;
const STRETCH_FIXED = 0.35;

function servingsOf(r) {
  return state.servingsFor[r.id] || r.servings;
}

const FRACTION_GLYPHS = [[0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];

function fmtQty(n) {
  const whole = Math.floor(n + 0.02);
  const frac = n - whole;
  let sym = "", best = 0.13;
  for (const [v, g] of FRACTION_GLYPHS) {
    if (Math.abs(frac - v) < best) { best = Math.abs(frac - v); sym = g; }
  }
  if (!sym && frac > 0.87) return String(whole + 1);
  if (!sym && frac > 0.13) return String(Math.round(n * 10) / 10);
  if (!whole) return sym || "0";
  return sym ? `${whole} ${sym}` : String(whole);
}

function parseLeadingQty(str) {
  let m = str.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (m) return { n: +m[1] + m[2] / m[3], len: m[0].length };
  m = str.match(/^(\d+)\/(\d+)/);
  if (m) return { n: m[1] / m[2], len: m[0].length };
  m = str.match(/^\d+(\.\d+)?/);
  if (m) return { n: parseFloat(m[0]), len: m[0].length };
  return null;
}

function scaleAmount(amount, factor) {
  if (!amount || factor === 1) return amount;
  const lead = parseLeadingQty(amount);
  if (!lead) return amount;
  let rest = amount.slice(lead.len);
  // range like "2-3 lbs" / "3–4 lbs": scale both ends
  const range = rest.match(/^\s*[–-]\s*(\d+(\.\d+)?)/);
  if (range) {
    rest = rest.slice(range[0].length);
    return `${fmtQty(lead.n * factor)}–${fmtQty(parseFloat(range[1]) * factor)}${rest}`;
  }
  return `${fmtQty(lead.n * factor)}${rest}`;
}

/* Shopping math: how many store packages each farm ingredient needs at
   the chosen servings. Package sizes come live from the store scrape
   (avg_weight_lb); structured needs (lb / count / packs) live on each
   pvf ingredient in recipes.json. */
function farmOrderLines(r) {
  const factor = servingsOf(r) / r.servings;
  return r.ingredients.filter((i) => i.source === "pvf" && i.slug).map((i) => {
    const p = inventory?.[i.slug];
    let packs = null;
    if (i.packs) {
      packs = Math.max(1, Math.ceil(i.packs * factor - STRETCH_FIXED));
    } else if (i.count) {
      packs = Math.max(1, Math.ceil((i.count * factor) / EGGS_PER_PACK - STRETCH));
    } else if (i.lb && p?.avg_weight_lb) {
      packs = Math.max(1, Math.ceil((i.lb * factor) / p.avg_weight_lb - STRETCH));
    }
    const price = p && packs != null
      ? packs * p.price * (p.price_unit === "lb" ? (p.avg_weight_lb || 1) : 1)
      : null;
    const rawName = p?.name || titleCase(i.slug.replace(/-/g, " "));
    return {
      slug: i.slug,
      // "...Eggs — Dozen" reads badly mid-sentence; the qty already says dozen.
      name: rawName.replace(/\s*[—–-]+\s*Dozen$/i, ""),
      inStock: p ? p.in_stock : true,
      known: !!p,
      url: p?.url || `https://parkviewfamilyfarm.com/store/product/${i.slug}`,
      packs, price,
      packNote: i.count ? "dozen" : (p?.avg_weight_lb ? `about ${p.avg_weight_lb} lb each` : null),
      fixed: !!i.fixed,
    };
  });
}

/* ── recipe rendering ─────────────────────────────── */

function renderList() {
  if (!recipes.length) return;
  const shown = visibleRecipes();
  $("#countLine").textContent = countLineText(shown.length);
  $("#emptyState").hidden = !(shown.length === 0 &&
    !(state.mode === "items" && state.selectedSlugs.size === 0));
  $("#recipeList").innerHTML = shown.map(renderCard).join("");
  bindCards();
}

function mealLabel(id) { return MEALS.find((m) => m.id === id)?.label || id; }
function cuisineLabel(id) { return CUISINES.find((c) => c.id === id)?.label || id; }

function farmProductInfo(r) {
  return r.farmProducts.map((slug) => {
    const p = inventory?.[slug];
    return {
      slug,
      name: p?.name || titleCase(slug.replace(/-/g, " ")),
      inStock: p ? p.in_stock : true,
      known: !!p,
      url: p?.url || `https://parkviewfamilyfarm.com/store/product/${slug}`,
    };
  });
}

function renderCard(r) {
  const now = new Date().getMonth() + 1;
  const open = state.openId === r.id;
  const farm = farmProductInfo(r);
  const soldOut = farm.filter((f) => f.known && !f.inStock);
  const servings = servingsOf(r);
  const factor = servings / r.servings;
  const hasFixed = r.ingredients.some((i) => i.source === "pvf" && i.fixed);

  const groups = [
    { key: "pvf", label: "From Park View Farm", dot: "source-dot-pvf" },
    { key: "market", label: "From the farmers market", dot: "source-dot-market" },
    { key: "pantry", label: "Pantry staples", dot: "source-dot-pantry" },
  ].map(({ key, label, dot }) => {
    const items = r.ingredients.filter((i) => i.source === key);
    if (!items.length) return "";
    return `<div class="ing-group-label"><span class="source-dot ${dot}"></span>${label}</div>
      <ul class="ing-list">${items.map((i) =>
        `<li><span class="ing-amount">${escapeHtml(scaleAmount(i.amount, factor))}</span><span>${escapeHtml(i.item)}</span></li>`).join("")}</ul>`;
  }).join("");

  return `<article class="card recipe-card" data-id="${r.id}">
    <button type="button" class="recipe-head" aria-expanded="${open}">
      <h3>${escapeHtml(r.name)}</h3>
      <p class="recipe-tagline">${escapeHtml(r.tagline)}</p>
      <div class="badges">
        <span class="badge">${mealLabel(r.mealType)}</span>
        <span class="badge">${cuisineLabel(r.cuisine)}</span>
        <span class="badge">${escapeHtml(r.totalTime)}</span>
        <span class="badge">${escapeHtml(r.difficulty)}</span>
        ${r.months.includes(now) ? `<span class="badge badge-season">In season now</span>` : ""}
        ${soldOut.length ? `<span class="badge badge-soldout">${escapeHtml(soldOut.map((f) => f.name).join(", "))} sold out right now</span>` : ""}
      </div>
    </button>
    <div class="farm-line">Farm items: <strong>${farm.map((f) => escapeHtml(f.name)).join(", ")}</strong> · serves ${r.servings}</div>
    ${open ? `<div class="recipe-body">
      <div class="serves-row">
        <span class="serves-label">Cooking for</span>
        <button type="button" class="serves-btn" data-serve="-1" aria-label="Fewer servings" ${servings <= 2 ? "disabled" : ""}>&minus;</button>
        <strong class="serves-count">${servings}</strong>
        <button type="button" class="serves-btn" data-serve="1" aria-label="More servings" ${servings >= 16 ? "disabled" : ""}>+</button>
        ${factor !== 1 ? `<span class="serves-note">amounts adjusted from the original ${r.servings}</span>`
          : (hasFixed ? `<span class="serves-note">built around a whole one — it stretches a long way before you need a second</span>` : "")}
      </div>
      ${groups}
      <div class="ing-group-label" style="margin-top:18px">How it goes</div>
      <ol class="recipe-steps">${r.instructions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      <div class="info-box market-tip"><span class="info-box-label">Farmers market tip</span>${escapeHtml(r.marketTip)}</div>
      <div class="info-box pvf-note"><span class="info-box-label">From the farm</span>${escapeHtml(r.pvfNote)}</div>
    </div>
    <div class="cart-row">
      ${cartControls(r)}
      <span class="action-links">
        <button type="button" class="action-btn" data-print="${r.id}">Print</button>
        <button type="button" class="action-btn" data-share="${r.id}">Share</button>
      </span>
      <p class="action-status" hidden></p>
    </div>` : ""}
  </article>`;
}

function cartControls(r) {
  const lines = farmOrderLines(r);
  const inStock = lines.filter((l) => l.inStock);
  const totalPacks = inStock.reduce((n, l) => n + (l.packs || 1), 0);
  const priced = inStock.filter((l) => l.price != null);
  const estTotal = priced.reduce((n, l) => n + l.price, 0);

  const summary = lines.some((l) => l.packs != null) ? `
    <p class="order-line">Your farm order for ${servingsOf(r)}:
      ${lines.map((l) => {
        const qty = l.packs == null ? ""
          : l.packNote === "dozen"
            ? `<strong>${l.packs} dozen</strong> `
            : l.fixed
              ? `<strong>${l.packs} &times;</strong> `
              : `<strong>${l.packs} pack${l.packs === 1 ? "" : "s"}</strong> `;
        const note = l.packNote && l.packNote !== "dozen" && l.packs != null ? ` (${l.packNote})` : "";
        const out = l.known && !l.inStock ? ` <em>— sold out</em>` : "";
        return `${qty}${escapeHtml(l.name)}${note}${out}`;
      }).join(" · ")}${priced.length && priced.length === inStock.length && estTotal ? ` — about $${Math.round(estTotal)} from the farm` : ""}</p>` : "";

  const links = `<span class="order-links">Order: ${lines.map((l) =>
    `<a href="${escapeHtml(l.url)}" ${EMBEDDED ? "" : `target="_blank" rel="noopener"`}>${escapeHtml(l.name)}</a>`).join("")}</span>`;

  // embed.js only runs on the GrazeCart site, so embedded means same-origin
  // with the store — on the custom domain or the grazecart.com mirror.
  if (EMBEDDED && inStock.length) {
    return `${summary}<button type="button" class="cart-btn" data-cart="${r.id}">
      Add ${totalPacks === 1 ? "it" : `all ${totalPacks} packages`} to my cart</button>
      ${links}<p class="cart-status" hidden></p>`;
  }
  return `${summary}${links}`;
}

function bindCards() {
  document.querySelectorAll(".recipe-head").forEach((head) => {
    head.addEventListener("click", () => {
      const id = head.closest(".recipe-card").dataset.id;
      state.openId = state.openId === id ? null : id;
      renderList();
      if (state.openId === id)
        document.querySelector(`.recipe-card[data-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
  document.querySelectorAll("[data-cart]").forEach((btn) => {
    btn.addEventListener("click", () => addRecipeToCart(btn));
  });
  document.querySelectorAll("[data-print]").forEach((btn) => {
    btn.addEventListener("click", () => printRecipe(btn.dataset.print));
  });
  document.querySelectorAll("[data-serve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".recipe-card");
      const r = recipes.find((x) => x.id === card.dataset.id);
      const next = Math.min(16, Math.max(2, servingsOf(r) + Number(btn.dataset.serve)));
      state.servingsFor[r.id] = next;
      const y = window.scrollY;
      renderList();
      window.scrollTo(0, y); // re-render must not move the page under the +/- buttons
    });
  });
  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", () => shareRecipe(btn.dataset.share, btn));
  });
}

/* ── print / share ────────────────────────────────── */

function recipeUrl(r) {
  const base = EMBEDDED
    ? "https://parkviewfamilyfarm.com/farm-recipes"
    : location.origin + location.pathname;
  return `${base}?recipe=${encodeURIComponent(r.id)}`;
}

function printRecipe(id) {
  const r = recipes.find((x) => x.id === id);
  if (!r) return;

  const servings = servingsOf(r);
  const factor = servings / r.servings;
  const groups = [
    { key: "pvf", label: "From Park View Farm" },
    { key: "market", label: "From the farmers market" },
    { key: "pantry", label: "Pantry staples" },
  ].map(({ key, label }) => {
    const items = r.ingredients.filter((i) => i.source === key);
    if (!items.length) return "";
    return `<h2>${label}</h2><ul>${items.map((i) =>
      `<li class="print-ing">${escapeHtml([scaleAmount(i.amount, factor), i.item].filter(Boolean).join(" "))}</li>`).join("")}</ul>`;
  }).join("");

  const orderLines = farmOrderLines(r).filter((l) => l.packs != null);
  const shopLine = orderLines.length
    ? `<p class="print-meta">Farm order for ${servings}: ${orderLines.map((l) =>
        `${l.packs} ${l.packNote === "dozen" ? "dozen" : l.fixed ? "x" : `pack${l.packs === 1 ? "" : "s"}`} ${escapeHtml(l.name)}`).join(" · ")}</p>`
    : "";

  document.getElementById("pvf-print-sheet")?.remove();
  const sheet = document.createElement("div");
  sheet.id = "pvf-print-sheet";
  sheet.innerHTML = `
    <div class="print-farm">Park View Farm &middot; Leicester, NY</div>
    <h1>${escapeHtml(r.name)}</h1>
    <p class="print-tagline">${escapeHtml(r.tagline)}</p>
    <p class="print-meta">Serves ${servings}${factor !== 1 ? ` (scaled from ${r.servings})` : ""} &middot; ${escapeHtml(r.totalTime)} &middot; ${escapeHtml(r.difficulty)} &middot; ${escapeHtml(cuisineLabel(r.cuisine))}</p>
    ${shopLine}
    ${groups}
    <h2>How it goes</h2>
    <ol>${r.instructions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <div class="print-note"><strong>Farmers market tip:</strong> ${escapeHtml(r.marketTip)}</div>
    <div class="print-note"><strong>From the farm:</strong> ${escapeHtml(r.pvfNote)}</div>
    <div class="print-footer">Pasture-raised, corn-and-soy-free &middot; order the farm ingredients at parkviewfamilyfarm.com &middot; more recipes: parkviewfamilyfarm.com/farm-recipes</div>`;
  document.body.appendChild(sheet);
  document.body.classList.add("pvf-printing");

  window.addEventListener("afterprint", () => {
    sheet.remove();
    document.body.classList.remove("pvf-printing");
  }, { once: true });
  window.print();
}

async function shareRecipe(id, btn) {
  const r = recipes.find((x) => x.id === id);
  if (!r) return;
  const url = recipeUrl(r);
  const status = btn.closest(".cart-row").querySelector(".action-status");

  if (navigator.share) {
    try {
      await navigator.share({ title: `${r.name} — Park View Farm`, text: r.tagline, url });
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // user closed the share tray
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = "Link copied — paste it into a text or email.";
  } catch (e) {
    status.innerHTML = `Copy this link: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`;
  }
  status.hidden = false;
}

/* ── one-click cart fill ──────────────────────────── *
 * Same-origin only, embedded on parkviewfamilyfarm.com. For each farm
 * product: fetch the product page, lift the add-to-cart Livewire
 * component's wire:snapshot, POST /livewire/update. Mirrors the store's
 * own Add to Cart button, using the customer's session. Same verified
 * mechanism as the Order Planner. */

function csrfToken() {
  return document.querySelector("#csrfToken")?.content
      || document.querySelector('meta[name="csrf-token"]')?.content || null;
}

function signedIn() {
  // GrazeCart shows a Sign In link in the auxiliary menu only when logged out.
  return !document.querySelector('.auxiliaryMenu a[href*="/login"]');
}

async function fetchAddSnapshot(slug) {
  const resp = await fetch(`/store/product/${slug}`);
  if (!resp.ok) throw new Error(`product page ${resp.status}`);
  const doc = new DOMParser().parseFromString(await resp.text(), "text/html");
  const el = [...doc.querySelectorAll("[wire\\:snapshot]")].find((e) =>
    e.getAttribute("wire:snapshot").includes("theme.add-product-button"));
  if (!el) throw new Error("no add-to-cart component");
  return el.getAttribute("wire:snapshot");
}

async function addSlugToCart(slug, token, qty = 1) {
  const snapshot = await fetchAddSnapshot(slug);
  const productId = JSON.parse(snapshot).data.product[1].key;
  // One POST carries the full quantity as stacked addToCart calls —
  // verified mechanism (Order Planner, 2026-07-06).
  const calls = Array.from({ length: qty }, () => ({ path: "", method: "addToCart", params: [productId] }));
  const resp = await fetch("/livewire/update", {
    method: "POST",
    headers: { "Content-type": "application/json", "X-Livewire": "" },
    body: JSON.stringify({ _token: token, components: [{ snapshot, updates: {}, calls }] }),
  });
  if (!resp.ok) throw new Error(`livewire ${resp.status}`);
  const data = await resp.json();
  if (!data?.components) throw new Error("unexpected response");
}

async function addRecipeToCart(btn) {
  const recipe = recipes.find((r) => r.id === btn.dataset.cart);
  const status = btn.closest(".cart-row").querySelector(".cart-status");
  if (btn.dataset.done) { location.href = "/cart"; return; }

  const token = csrfToken();
  if (!token || !signedIn()) {
    status.hidden = false;
    status.innerHTML = `You'll need to <a href="/login">sign in</a> first, then come right back.`;
    return;
  }

  btn.disabled = true;
  const lines = farmOrderLines(recipe).filter((l) => l.inStock);
  const failed = [];
  let done = 0;
  for (const l of lines) {
    btn.textContent = `Adding: ${++done} of ${lines.length}`;
    try {
      await addSlugToCart(l.slug, token, l.packs || 1);
    } catch (e) {
      failed.push(l.name);
    }
  }

  if (failed.length === lines.length) {
    btn.disabled = false;
    btn.textContent = "Add to my cart";
    status.hidden = false;
    status.textContent = "That didn't work — use the item links instead, or refresh and try again.";
  } else if (failed.length) {
    btn.disabled = false;
    btn.dataset.done = "1";
    btn.textContent = "Open my cart";
    status.hidden = false;
    status.textContent = `In your cart, except: ${failed.join(", ")}. Use the item links for those.`;
  } else {
    btn.dataset.done = "1";
    btn.disabled = false;
    btn.textContent = "In your cart — open it";
    status.hidden = false;
    status.textContent = `Added ${lines.reduce((n, l) => n + (l.packs || 1), 0)} package${lines.length === 1 && (lines[0].packs || 1) === 1 ? "" : "s"} for ${servingsOf(recipe)} servings. Adjust anything in your cart.`;
  }
}

/* ── utilities ────────────────────────────────────── */

function titleCase(text) {
  return text.replace(/\b\w/g, (l) => l.toUpperCase());
}

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();

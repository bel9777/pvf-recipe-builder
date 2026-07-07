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

  const groups = [
    { key: "pvf", label: "From Park View Farm", dot: "source-dot-pvf" },
    { key: "market", label: "From the farmers market", dot: "source-dot-market" },
    { key: "pantry", label: "Pantry staples", dot: "source-dot-pantry" },
  ].map(({ key, label, dot }) => {
    const items = r.ingredients.filter((i) => i.source === key);
    if (!items.length) return "";
    return `<div class="ing-group-label"><span class="source-dot ${dot}"></span>${label}</div>
      <ul class="ing-list">${items.map((i) =>
        `<li><span class="ing-amount">${escapeHtml(i.amount)}</span><span>${escapeHtml(i.item)}</span></li>`).join("")}</ul>`;
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
      ${groups}
      <div class="ing-group-label" style="margin-top:18px">How it goes</div>
      <ol class="recipe-steps">${r.instructions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      <div class="info-box market-tip"><span class="info-box-label">Farmers market tip</span>${escapeHtml(r.marketTip)}</div>
      <div class="info-box pvf-note"><span class="info-box-label">From the farm</span>${escapeHtml(r.pvfNote)}</div>
    </div>
    <div class="cart-row">
      ${cartControls(r, farm)}
    </div>` : ""}
  </article>`;
}

function cartControls(r, farm) {
  const inStock = farm.filter((f) => f.inStock);
  const links = `<span class="order-links">Order: ${farm.map((f) =>
    `<a href="${escapeHtml(f.url)}" ${EMBEDDED ? "" : `target="_blank" rel="noopener"`}>${escapeHtml(f.name)}</a>`).join("")}</span>`;
  // embed.js only runs on the GrazeCart site, so embedded means same-origin
  // with the store — on the custom domain or the grazecart.com mirror.
  if (EMBEDDED && inStock.length) {
    return `<button type="button" class="cart-btn" data-cart="${r.id}">
      Add farm item${inStock.length === 1 ? "" : "s"} to my cart</button>
      ${links}<p class="cart-status" hidden></p>`;
  }
  return links;
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

async function addSlugToCart(slug, token) {
  const snapshot = await fetchAddSnapshot(slug);
  const productId = JSON.parse(snapshot).data.product[1].key;
  const resp = await fetch("/livewire/update", {
    method: "POST",
    headers: { "Content-type": "application/json", "X-Livewire": "" },
    body: JSON.stringify({
      _token: token,
      components: [{ snapshot, updates: {}, calls: [{ path: "", method: "addToCart", params: [productId] }] }],
    }),
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
  const farm = farmProductInfo(recipe).filter((f) => f.inStock);
  const failed = [];
  let done = 0;
  for (const f of farm) {
    btn.textContent = `Adding: ${++done} of ${farm.length}`;
    try {
      await addSlugToCart(f.slug, token);
    } catch (e) {
      failed.push(f.name);
    }
  }

  if (failed.length === farm.length) {
    btn.disabled = false;
    btn.textContent = "Add farm items to my cart";
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
    status.textContent = "Added one of each. Adjust quantities in your cart.";
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

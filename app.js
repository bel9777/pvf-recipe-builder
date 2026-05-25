const state = {
  month: new Date().getMonth(),
  selectedProductIds: new Set(),
  occasion: "any",
  cuisine: "any",
  servings: 4,
  lastRecipes: [],
  loading: false
};

const els = {
  presetButtons:  document.getElementById("presetButtons"),
  categoryTabs:   document.getElementById("categoryTabs"),
  productPanels:  document.getElementById("productPanels"),
  selectedSummary: document.getElementById("selectedSummary"),
  selectedCount:  document.getElementById("selectedCount"),
  selectedPlural: document.getElementById("selectedPlural"),
  clearProducts:  document.getElementById("clearProducts"),
  monthSelect:    document.getElementById("monthSelect"),
  occasionSelect: document.getElementById("occasionSelect"),
  cuisineSelect:  document.getElementById("cuisineSelect"),
  servingsSelect: document.getElementById("servingsSelect"),
  generateBtn:    document.getElementById("generateBtn"),
  seasonEyebrow:  document.getElementById("seasonEyebrow"),
  seasonHeading:  document.getElementById("seasonHeading"),
  seasonStrip:    document.getElementById("seasonStrip"),
  seasonNotes:    document.getElementById("seasonNotes"),
  emptyState:     document.getElementById("emptyState"),
  loadingState:   document.getElementById("loadingState"),
  loadingMonth:   document.getElementById("loadingMonth"),
  errorState:     document.getElementById("errorState"),
  errorMessage:   document.getElementById("errorMessage"),
  retryBtn:       document.getElementById("retryBtn"),
  recipeGrid:     document.getElementById("recipeGrid")
};

function init() {
  els.monthSelect.value = String(state.month);
  renderPresets();
  renderCategoryTabs();
  renderProductPanels();
  renderSeasonStrip();
  bindControls();
  updateGenerateButton();
  showPanel("emptyState");
}

// ── Presets ────────────────────────────────────────────

function renderPresets() {
  els.presetButtons.innerHTML = PVF_PRESETS.map(preset => `
    <button class="preset-btn" type="button" data-preset="${preset.id}">${preset.label}</button>
  `).join("");

  els.presetButtons.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = PVF_PRESETS.find(p => p.id === btn.dataset.preset);
      if (!preset) return;
      preset.productIds.forEach(id => state.selectedProductIds.add(id));
      syncCheckboxesToState();
      updateSelectedSummary();
      updateGenerateButton();
    });
  });
}

// ── Category tabs & product panels ────────────────────

function renderCategoryTabs() {
  els.categoryTabs.innerHTML = PVF_CATEGORIES.map((cat, i) => `
    <button
      class="tab-btn"
      type="button"
      role="tab"
      aria-selected="${i === 0}"
      aria-controls="panel-${cat.id}"
      data-category="${cat.id}"
    >${cat.label}</button>
  `).join("");

  els.categoryTabs.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.category));
  });
}

function activateTab(categoryId) {
  els.categoryTabs.querySelectorAll(".tab-btn").forEach(btn => {
    btn.setAttribute("aria-selected", btn.dataset.category === categoryId);
  });
  els.productPanels.querySelectorAll(".product-panel").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.category === categoryId);
  });
}

function renderProductPanels() {
  els.productPanels.innerHTML = PVF_CATEGORIES.map((cat, i) => `
    <div
      class="product-panel ${i === 0 ? "active" : ""}"
      id="panel-${cat.id}"
      data-category="${cat.id}"
      role="tabpanel"
    >
      ${cat.products.map(product => `
        <label class="product-toggle ${state.selectedProductIds.has(product.id) ? "checked" : ""}" data-id="${product.id}">
          <input
            type="checkbox"
            value="${product.id}"
            ${state.selectedProductIds.has(product.id) ? "checked" : ""}
            aria-label="${product.name}"
          >
          <div class="product-info">
            <span class="product-name">${product.name}</span>
            <span class="product-desc">${product.description}</span>
          </div>
        </label>
      `).join("")}
    </div>
  `).join("");

  els.productPanels.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", () => {
      const label = input.closest(".product-toggle");
      if (input.checked) {
        state.selectedProductIds.add(input.value);
        label.classList.add("checked");
      } else {
        state.selectedProductIds.delete(input.value);
        label.classList.remove("checked");
      }
      updateSelectedSummary();
      updateGenerateButton();
    });
  });
}

function syncCheckboxesToState() {
  els.productPanels.querySelectorAll("input[type='checkbox']").forEach(input => {
    const checked = state.selectedProductIds.has(input.value);
    input.checked = checked;
    input.closest(".product-toggle").classList.toggle("checked", checked);
  });
}

function updateSelectedSummary() {
  const count = state.selectedProductIds.size;
  els.selectedSummary.hidden = count === 0;
  els.selectedCount.textContent = String(count);
  els.selectedPlural.textContent = count === 1 ? "" : "s";
}

// ── Season strip ──────────────────────────────────────

function renderSeasonStrip() {
  const data = WNY_SEASONAL[state.month];
  if (!data) return;

  els.seasonEyebrow.textContent = `${data.label} in Western NY`;
  els.seasonHeading.textContent = "What's at the farmers market";
  els.seasonNotes.textContent = data.notes;

  els.seasonStrip.innerHTML = data.produce.map(item => `
    <span class="season-chip">
      <span class="season-dot" style="background: ${colorForProduce(item)}"></span>
      ${capitalize(item)}
    </span>
  `).join("");
}

// ── Controls ──────────────────────────────────────────

function bindControls() {
  els.monthSelect.addEventListener("change", e => {
    state.month = Number(e.target.value);
    renderSeasonStrip();
  });

  els.occasionSelect.addEventListener("change", e => {
    state.occasion = e.target.value;
  });

  els.cuisineSelect.addEventListener("change", e => {
    state.cuisine = e.target.value;
  });

  els.servingsSelect.addEventListener("change", e => {
    state.servings = Number(e.target.value);
  });

  els.clearProducts.addEventListener("click", () => {
    state.selectedProductIds.clear();
    syncCheckboxesToState();
    updateSelectedSummary();
    updateGenerateButton();
  });

  els.generateBtn.addEventListener("click", generateRecipes);
  els.retryBtn.addEventListener("click", generateRecipes);
}

function updateGenerateButton() {
  els.generateBtn.disabled = state.selectedProductIds.size === 0;
}

// ── Recipe generation ──────────────────────────────────

async function generateRecipes() {
  if (state.loading || state.selectedProductIds.size === 0) return;
  state.loading = true;

  const selectedProducts = PVF_PRODUCTS.filter(p => state.selectedProductIds.has(p.id));
  const seasonData = WNY_SEASONAL[state.month];
  const seasonalProduce = seasonData ? seasonData.produce : [];

  els.loadingMonth.textContent = seasonData ? seasonData.label : "current month";

  showPanel("loadingState");

  try {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedProducts: selectedProducts.map(p => ({ name: p.name, category: p.category, description: p.description })),
        seasonalProduce,
        month: state.month,
        occasion: state.occasion,
        cuisine: state.cuisine,
        servings: state.servings
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Recipe generation failed.");
    }

    state.lastRecipes = data.recipes;
    renderRecipes(data.recipes, selectedProducts);
    showPanel("recipeGrid");
  } catch (err) {
    els.errorMessage.textContent = err.message || "Something went wrong. Please try again.";
    showPanel("errorState");
  } finally {
    state.loading = false;
  }
}

// ── Render recipes ─────────────────────────────────────

function renderRecipes(recipes, selectedProducts) {
  els.recipeGrid.innerHTML = recipes.map((recipe, index) => {
    const pvfIngredients = (recipe.ingredients || []).filter(i => i.source === "pvf");
    const marketIngredients = (recipe.ingredients || []).filter(i => i.source === "market");
    const pantryIngredients = (recipe.ingredients || []).filter(i => i.source === "pantry");

    const shopLinks = (recipe.farm_products || []).map(productName => {
      const match = PVF_PRODUCTS.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase()) ||
        productName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (!match) return "";
      return `<a href="${match.url}" target="_blank" rel="noopener" class="shop-link">${match.name}</a>`;
    }).filter(Boolean).join("");

    const instructionItems = (recipe.instructions || [])
      .map(step => `<li>${escapeHtml(step)}</li>`)
      .join("");

    const badgeDifficulty = recipe.difficulty ? `<span class="badge badge-difficulty">${escapeHtml(recipe.difficulty)}</span>` : "";

    return `
      <article class="recipe-card" aria-label="${escapeHtml(recipe.name)}">

        <div class="recipe-card-header">
          <h3>${escapeHtml(recipe.name)}</h3>
          <p class="recipe-tagline">${escapeHtml(recipe.tagline || "")}</p>
          <div class="recipe-badges">
            ${recipe.occasion ? `<span class="badge badge-occasion">${escapeHtml(recipe.occasion)}</span>` : ""}
            ${recipe.cuisine ? `<span class="badge badge-cuisine">${escapeHtml(recipe.cuisine)}</span>` : ""}
            ${recipe.total_time ? `<span class="badge badge-time">${escapeHtml(recipe.total_time)}</span>` : ""}
            ${badgeDifficulty}
          </div>
        </div>

        <div class="recipe-card-body">
          <div class="ingredient-groups">

            ${pvfIngredients.length ? `
              <div>
                <div class="ingredient-group-label">
                  <span class="source-dot source-dot-pvf"></span>
                  From Park View Farm
                </div>
                <ul class="ingredient-list">
                  ${pvfIngredients.map(i => `
                    <li class="ingredient-item source-pvf">
                      <span class="ing-amount">${escapeHtml(i.amount || "")}</span>
                      <span>${escapeHtml(i.item)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            ` : ""}

            ${marketIngredients.length ? `
              <div>
                <div class="ingredient-group-label">
                  <span class="source-dot source-dot-market"></span>
                  From the farmers market
                </div>
                <ul class="ingredient-list">
                  ${marketIngredients.map(i => `
                    <li class="ingredient-item source-market">
                      <span class="ing-amount">${escapeHtml(i.amount || "")}</span>
                      <span>${escapeHtml(i.item)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            ` : ""}

            ${pantryIngredients.length ? `
              <div>
                <div class="ingredient-group-label">
                  <span class="source-dot source-dot-pantry"></span>
                  Pantry staples
                </div>
                <ul class="ingredient-list">
                  ${pantryIngredients.map(i => `
                    <li class="ingredient-item source-pantry">
                      <span class="ing-amount">${escapeHtml(i.amount || "")}</span>
                      <span>${escapeHtml(i.item)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            ` : ""}

          </div>
        </div>

        <button
          class="expand-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="expanded-${index}"
        >
          Full recipe + tips
          <span class="expand-icon" aria-hidden="true">&#9660;</span>
        </button>

        <div class="expanded-content" id="expanded-${index}">

          ${instructionItems ? `
            <ol class="recipe-instructions" aria-label="Instructions">
              ${instructionItems}
            </ol>
          ` : ""}

          ${recipe.market_tip ? `
            <div class="info-box market-tip-box">
              <span class="info-box-label">Farmers market tip</span>
              ${escapeHtml(recipe.market_tip)}
            </div>
          ` : ""}

          ${recipe.pvf_note ? `
            <div class="info-box pvf-note-box">
              <span class="info-box-label">Why Park View Farm makes this better</span>
              ${escapeHtml(recipe.pvf_note)}
            </div>
          ` : ""}

        </div>

        ${shopLinks ? `
          <div class="shop-row">
            <span class="shop-label">Order:</span>
            ${shopLinks}
          </div>
        ` : ""}

      </article>
    `;
  }).join("");

  // Bind expand toggles
  els.recipeGrid.querySelectorAll(".expand-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      const contentId = toggle.getAttribute("aria-controls");
      const content = document.getElementById(contentId);
      toggle.setAttribute("aria-expanded", String(!expanded));
      content.classList.toggle("open", !expanded);
      toggle.querySelector(".expand-icon").innerHTML = !expanded ? "&#9650;" : "&#9660;";
    });
  });
}

// ── Panel visibility ───────────────────────────────────

function showPanel(which) {
  els.emptyState.hidden   = which !== "emptyState";
  els.loadingState.hidden = which !== "loadingState";
  els.errorState.hidden   = which !== "errorState";
  els.recipeGrid.hidden   = which !== "recipeGrid";
}

// ── Utilities ──────────────────────────────────────────

function capitalize(text) {
  return text.replace(/\b\w/g, l => l.toUpperCase());
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

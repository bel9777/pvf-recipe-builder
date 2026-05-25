# Park View Farm — Recipe Builder

A customer-facing tool that generates recipe ideas using Park View Farm products alongside what's seasonally available at Western NY farmers markets.

## How it works

1. Customer picks Park View Farm products they have or want to order
2. App shows what's in season in Western NY for the selected month
3. Customer sets occasion and cuisine preferences
4. Click "Find Recipes" — Claude generates 4 tailored recipes
5. Each recipe clearly shows: what to order from PVF, what to find at the farmers market, and pantry staples
6. Direct links to PVF product pages for each recipe

## Running locally

**Requirements:** Node.js 18+, a Claude API key from console.anthropic.com

```
# 1. Copy the env template and add your API key
copy .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your_key_here

# 2. Install dependencies (first time only)
npm install

# 3. Start the app
npm start

# 4. Open in browser
http://localhost:3000
```

## File structure

```
├── server.js          Express server + Claude API proxy
├── products.js        Park View Farm product catalog (browser script)
├── seasonal.js        Western NY produce calendar by month (browser script)
├── index.html         App UI
├── styles.css         Styles
├── app.js             Frontend logic
├── package.json
├── .env.example       API key template — copy to .env
└── README.md
```

## Connecting to live GrazeCart inventory

Currently, `products.js` is a hardcoded product list. When ready to connect to live inventory:

1. Get your GrazeCart API credentials
2. Add `GRAZECART_API_KEY` and `GRAZECART_STORE_ID` to `.env`
3. Add a `/api/products` endpoint in `server.js` that fetches from GrazeCart
4. Update `app.js` to call `/api/products` on load instead of reading `PVF_PRODUCTS` directly

The product objects need: `id`, `name`, `category`, `description`, `url`, `available`.

## Deploying to the web

The easiest path is **Render.com** (free tier):

1. Push this folder to a GitHub repo
2. Create a new Web Service on render.com, connect the repo
3. Set environment variable: `ANTHROPIC_API_KEY`
4. Deploy — Render runs `npm start`
5. Add a "Recipe Builder" link to your GrazeCart site pointing to the Render URL

## Adding recipes to the GrazeCart Recipes page

Once customers find recipes they love, those can be manually added to the GrazeCart `/recipes` page with product CTAs linking directly to product pages.

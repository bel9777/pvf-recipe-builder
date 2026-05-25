// Western New York seasonal produce calendar
// Tuned for the Genesee Valley / Finger Lakes area — Leicester, NY and surrounding region.
// Zone 5b-6a. Last frost ~mid-May, first frost ~mid-October.
// Data reflects what's realistically available at regional farmers markets.

const WNY_SEASONAL = {
  0: {
    label: "January",
    produce: [
      "storage apples",
      "carrots",
      "beets",
      "winter squash",
      "potatoes",
      "cabbage",
      "kale",
      "parsnips",
      "turnips",
      "rutabaga",
      "celeriac",
      "onions",
      "garlic"
    ],
    notes: "Storage season. Root vegetables and storage crops from local farms. Kale is sweetened by frost and still excellent."
  },
  1: {
    label: "February",
    produce: [
      "storage apples",
      "carrots",
      "beets",
      "winter squash",
      "potatoes",
      "cabbage",
      "kale",
      "parsnips",
      "turnips",
      "celeriac",
      "onions",
      "garlic",
      "greenhouse microgreens",
      "greenhouse spinach"
    ],
    notes: "Storage crops holding strong. Some greenhouse greens appear at farmers markets. Maple syrup season begins late February."
  },
  2: {
    label: "March",
    produce: [
      "maple syrup",
      "storage apples",
      "carrots",
      "beets",
      "winter squash",
      "cabbage",
      "kale",
      "parsnips",
      "turnips",
      "greenhouse lettuce",
      "greenhouse spinach",
      "greenhouse microgreens"
    ],
    notes: "Maple sugaring season — WNY maple syrup is excellent. Storage crops finishing strong. Greenhouse greens filling the gap."
  },
  3: {
    label: "April",
    produce: [
      "maple syrup",
      "ramps",
      "fiddleheads",
      "dandelion greens",
      "greenhouse lettuce",
      "greenhouse spinach",
      "radishes",
      "spring onions",
      "chives",
      "storage carrots",
      "storage beets"
    ],
    notes: "First wild foraged greens appear — ramps from local woodlands, fiddleheads from creek banks. Farmers market picks back up."
  },
  4: {
    label: "May",
    produce: [
      "asparagus",
      "rhubarb",
      "ramps",
      "radishes",
      "spring onions",
      "spinach",
      "lettuce",
      "snap peas",
      "herbs",
      "dandelion greens",
      "early strawberries"
    ],
    notes: "Asparagus is the star of May in WNY. Look for thin, bright green spears at the market. Rhubarb for pies and compotes."
  },
  5: {
    label: "June",
    produce: [
      "strawberries",
      "asparagus",
      "rhubarb",
      "snap peas",
      "lettuce",
      "spinach",
      "arugula",
      "garlic scapes",
      "summer squash",
      "zucchini",
      "baby beets",
      "Swiss chard",
      "spring onions",
      "basil",
      "dill",
      "cilantro",
      "kohlrabi",
      "radishes"
    ],
    notes: "Strawberry season peaks in June — WNY strawberries are exceptional. Garlic scapes appear and are gone in two weeks. Get them."
  },
  6: {
    label: "July",
    produce: [
      "sweet corn",
      "tomatoes",
      "green beans",
      "cucumbers",
      "summer squash",
      "zucchini",
      "blueberries",
      "blackberries",
      "basil",
      "beets",
      "carrots",
      "Swiss chard",
      "garlic",
      "herbs",
      "peppers",
      "new potatoes"
    ],
    notes: "Sweet corn starts arriving mid-July — WNY field corn is legendary. First real tomatoes of summer. Blueberries hit peak late July."
  },
  7: {
    label: "August",
    produce: [
      "tomatoes",
      "sweet corn",
      "peppers",
      "eggplant",
      "cucumbers",
      "summer squash",
      "zucchini",
      "green beans",
      "peaches",
      "plums",
      "melons",
      "watermelon",
      "blueberries",
      "blackberries",
      "basil",
      "garlic",
      "beets",
      "carrots"
    ],
    notes: "August is the peak of everything. Tomatoes in every variety — this is BLT season, caprese season, sauce season. Peaches from the Lake Erie shore are outstanding."
  },
  8: {
    label: "September",
    produce: [
      "apples",
      "tomatoes",
      "peppers",
      "winter squash",
      "broccoli",
      "cauliflower",
      "cabbage",
      "kale",
      "Brussels sprouts",
      "grapes",
      "pears",
      "sweet potatoes",
      "leeks",
      "fennel",
      "beets",
      "carrots",
      "eggplant"
    ],
    notes: "Apple harvest begins — WNY and Finger Lakes are prime apple country. Concord grapes from Finger Lakes vineyards. First winter squash at markets."
  },
  9: {
    label: "October",
    produce: [
      "apples",
      "pumpkins",
      "winter squash",
      "Brussels sprouts",
      "cabbage",
      "broccoli",
      "cauliflower",
      "kale",
      "carrots",
      "beets",
      "sweet potatoes",
      "turnips",
      "parsnips",
      "leeks",
      "late peppers",
      "celeriac"
    ],
    notes: "Frost sweetens the kale, carrots, and parsnips dramatically. Butternut squash, acorn, delicata — all excellent. Apple varieties peak through the month."
  },
  10: {
    label: "November",
    produce: [
      "storage apples",
      "winter squash",
      "kale",
      "Brussels sprouts",
      "cabbage",
      "carrots",
      "beets",
      "turnips",
      "rutabaga",
      "parsnips",
      "celeriac",
      "potatoes",
      "onions",
      "leeks",
      "sweet potatoes"
    ],
    notes: "Farmers markets wind down but root vegetables are in their best form after frost. Kale and Brussels sprouts hold until hard freeze."
  },
  11: {
    label: "December",
    produce: [
      "storage apples",
      "winter squash",
      "potatoes",
      "carrots",
      "beets",
      "parsnips",
      "turnips",
      "rutabaga",
      "celeriac",
      "onions",
      "garlic",
      "cabbage",
      "kale"
    ],
    notes: "Storage crops from the fall harvest. A few winter farmers markets in Rochester carry roots and storage squash through the month."
  }
};

// Colors for the season chips — keyed by partial produce name
const PRODUCE_COLORS = {
  apple: "#b94d3f",
  asparagus: "#5d875f",
  basil: "#3d6b45",
  beet: "#8c3060",
  blackberr: "#4a3d6a",
  blueberr: "#46527c",
  broccoli: "#44745c",
  brussels: "#5a7a50",
  cabbage: "#93a679",
  carrot: "#d88938",
  cauliflower: "#c8b890",
  celeri: "#a8956a",
  chard: "#8e475b",
  cherr: "#9f3037",
  chive: "#6f9b61",
  cilantro: "#5a8050",
  corn: "#e0b746",
  cucumber: "#577f5a",
  dandelion: "#d4c050",
  dill: "#7a9b61",
  eggplant: "#55436d",
  fennel: "#7a9b6a",
  fiddlehead: "#4a7040",
  garlic: "#c0a878",
  grape: "#59618d",
  green: "#4f7b55",
  herb: "#6f9b61",
  kale: "#416f4f",
  kohlrabi: "#8a9b6a",
  leek: "#7a9060",
  lettuce: "#86aa67",
  maple: "#c87830",
  melon: "#c8b060",
  microgreen: "#70a060",
  mushroom: "#a78969",
  onion: "#c8a875",
  parsnip: "#c0b090",
  peach: "#d58a52",
  pea: "#77a85c",
  pepper: "#c4563d",
  plum: "#7a4060",
  potato: "#a87f56",
  pumpkin: "#c97134",
  radish: "#c3455f",
  ramp: "#597f59",
  rhubarb: "#c54e56",
  rutabaga: "#b09050",
  spinach: "#3f7955",
  squash: "#d89b3d",
  strawberr: "#c9484b",
  sweet: "#d87a40",
  tomato: "#c84b3f",
  turnip: "#bba68b",
  watermelon: "#c84060",
  zucchini: "#4f7750"
};

function colorForProduce(name) {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(PRODUCE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "#44745c";
}

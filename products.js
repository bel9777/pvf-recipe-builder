// Park View Farm product catalog
// Update the `available` flag to match live GrazeCart inventory.
// Future: replace this file with a live GrazeCart API fetch.

const PVF_PRODUCTS = [
  // CHICKEN — pasture-raised, corn/soy-free
  {
    id: "whole-chicken",
    name: "Whole Chicken",
    category: "chicken",
    description: "Pasture-raised, corn/soy-free. Best for roasting or spatchcocking.",
    url: "https://parkviewfamilyfarm.com/products/whole-chicken",
    available: true
  },
  {
    id: "chicken-thighs",
    name: "Chicken Thighs",
    category: "chicken",
    description: "Bone-in, skin-on. The most forgiving, flavorful cut.",
    url: "https://parkviewfamilyfarm.com/products/chicken-thighs",
    available: true
  },
  {
    id: "chicken-breasts",
    name: "Chicken Breasts",
    category: "chicken",
    description: "Boneless skinless. Leaner, quick-cooking, versatile.",
    url: "https://parkviewfamilyfarm.com/products/chicken-breasts",
    available: true
  },
  {
    id: "chicken-legs",
    name: "Chicken Legs",
    category: "chicken",
    description: "Drumsticks. Kid-friendly, great grilled or roasted.",
    url: "https://parkviewfamilyfarm.com/products/chicken-legs",
    available: true
  },
  {
    id: "chicken-wings",
    name: "Chicken Wings",
    category: "chicken",
    description: "Pasture-raised flavor in every bite. Game day or weeknight.",
    url: "https://parkviewfamilyfarm.com/products/chicken-wings",
    available: true
  },
  {
    id: "ground-chicken",
    name: "Ground Chicken",
    category: "chicken",
    description: "Mild, lean. Burgers, meatballs, stuffed peppers.",
    url: "https://parkviewfamilyfarm.com/products/ground-chicken",
    available: true
  },
  {
    id: "chicken-livers",
    name: "Chicken Livers",
    category: "chicken",
    description: "Nutrient-dense, rich. Pate, dirty rice, crostini.",
    url: "https://parkviewfamilyfarm.com/products/chicken-livers",
    available: true
  },

  // PORK — Idaho Pasture Pigs, corn/soy-free
  {
    id: "ground-pork",
    name: "Ground Pork",
    category: "pork",
    description: "Idaho Pasture Pig, corn/soy-free. Remarkable fat ratio — oleic acid comparable to olive oil.",
    url: "https://parkviewfamilyfarm.com/products/ground-pork",
    available: true
  },
  {
    id: "pork-chops",
    name: "Pork Chops",
    category: "pork",
    description: "Bone-in. Pan-sear or grill. Rich, old-fashioned pork flavor.",
    url: "https://parkviewfamilyfarm.com/products/pork-chops",
    available: true
  },
  {
    id: "pork-tenderloin",
    name: "Pork Tenderloin",
    category: "pork",
    description: "Lean, quick-cooking. Elegant weeknight or dinner party option.",
    url: "https://parkviewfamilyfarm.com/products/pork-tenderloin",
    available: true
  },
  {
    id: "pork-shoulder",
    name: "Pork Shoulder",
    category: "pork",
    description: "Boston butt. The king of low-and-slow. Pulled pork, carnitas.",
    url: "https://parkviewfamilyfarm.com/products/pork-shoulder",
    available: true
  },
  {
    id: "pork-ribs",
    name: "Pork Ribs",
    category: "pork",
    description: "Spare ribs or baby backs. Backyard cookout essential.",
    url: "https://parkviewfamilyfarm.com/products/pork-ribs",
    available: true
  },
  {
    id: "pork-belly",
    name: "Pork Belly",
    category: "pork",
    description: "Uncured slab. Make your own bacon, braise for ramen or tacos.",
    url: "https://parkviewfamilyfarm.com/products/pork-belly",
    available: true
  },
  {
    id: "pork-loin",
    name: "Pork Loin Roast",
    category: "pork",
    description: "Sunday dinner centerpiece. Slices beautifully, mild and lean.",
    url: "https://parkviewfamilyfarm.com/products/pork-loin",
    available: true
  },
  {
    id: "pork-stew-meat",
    name: "Pork Stew Meat",
    category: "pork",
    description: "Cubed shoulder. Stews, braises, chili, and tagines.",
    url: "https://parkviewfamilyfarm.com/products/pork-stew-meat",
    available: true
  },
  {
    id: "ham-roast",
    name: "Ham Roast",
    category: "pork",
    description: "Bone-in fresh ham. Roast it your way — herb-crusted, glazed.",
    url: "https://parkviewfamilyfarm.com/products/ham-roast",
    available: true
  },

  // SAUSAGE & BACON — value-added, corn/soy-free pork
  {
    id: "bacon",
    name: "Smoked Bacon",
    category: "value-added",
    description: "Uncured, naturally smoked. No nitrates, no shortcuts. Thicker cut.",
    url: "https://parkviewfamilyfarm.com/products/smoked-bacon",
    available: true
  },
  {
    id: "breakfast-sausage",
    name: "Breakfast Sausage",
    category: "value-added",
    description: "Links and patties. Maple and sage varieties — made from PVF pork.",
    url: "https://parkviewfamilyfarm.com/products/breakfast-sausage",
    available: true
  },
  {
    id: "italian-sausage",
    name: "Italian Sausage",
    category: "value-added",
    description: "Sweet or hot. Pasta, pizza, grilling, sandwiches.",
    url: "https://parkviewfamilyfarm.com/products/italian-sausage",
    available: true
  },
  {
    id: "bratwurst",
    name: "Bratwurst",
    category: "value-added",
    description: "Classic brat. Grilled with peppers and onions, or simmered in beer.",
    url: "https://parkviewfamilyfarm.com/products/bratwurst",
    available: true
  },
  {
    id: "kielbasa",
    name: "Kielbasa",
    category: "value-added",
    description: "Polish-style smoked sausage. Grills, soups, and one-pan dinners.",
    url: "https://parkviewfamilyfarm.com/products/kielbasa",
    available: true
  },
  {
    id: "hot-dogs",
    name: "Pork Hot Dogs",
    category: "value-added",
    description: "Uncured, corn/soy-free. Real backyard cookout flavor, no fillers.",
    url: "https://parkviewfamilyfarm.com/products/pork-hot-dogs",
    available: true
  },
  {
    id: "chorizo",
    name: "Chorizo",
    category: "value-added",
    description: "Mexican-style fresh chorizo. Tacos, eggs, rice dishes, shakshuka.",
    url: "https://parkviewfamilyfarm.com/products/chorizo",
    available: true
  },
  {
    id: "smoked-ham",
    name: "Smoked Ham",
    category: "value-added",
    description: "Whole or half. Holiday centerpiece or everyday sandwiches and soups.",
    url: "https://parkviewfamilyfarm.com/products/smoked-ham",
    available: true
  },

  // EGGS — corn/soy-free, pasture-raised
  {
    id: "eggs-dozen",
    name: "Eggs (Dozen)",
    category: "eggs",
    description: "Corn/soy-free pasture-raised. 6:1 omega ratio vs. 51:1 commercial. Rich yolks, dense whites.",
    url: "https://parkviewfamilyfarm.com/products/eggs",
    available: true
  },
  {
    id: "eggs-half",
    name: "Eggs (Half Dozen)",
    category: "eggs",
    description: "Corn/soy-free pasture-raised. Same quality, smaller quantity.",
    url: "https://parkviewfamilyfarm.com/products/eggs-half-dozen",
    available: true
  },

  // DUCK — pasture-raised
  {
    id: "whole-duck",
    name: "Whole Duck",
    category: "duck",
    description: "Pasture-raised. Richer than chicken, incredible fat for roasting.",
    url: "https://parkviewfamilyfarm.com/products/whole-duck",
    available: true,
    seasonal: true
  },
  {
    id: "duck-breasts",
    name: "Duck Breasts",
    category: "duck",
    description: "Pan-sear to medium-rare like a steak. Impressive, surprisingly quick.",
    url: "https://parkviewfamilyfarm.com/products/duck-breasts",
    available: true,
    seasonal: true
  },
  {
    id: "duck-legs",
    name: "Duck Legs",
    category: "duck",
    description: "Confit, braise, or roast low and slow until fall-off-the-bone.",
    url: "https://parkviewfamilyfarm.com/products/duck-legs",
    available: true,
    seasonal: true
  },
  {
    id: "duck-fat",
    name: "Duck Fat",
    category: "duck",
    description: "Rendered. The best roasted potatoes you will ever make.",
    url: "https://parkviewfamilyfarm.com/products/duck-fat",
    available: true,
    seasonal: true
  },

  // TURKEY — seasonal/holiday
  {
    id: "whole-turkey",
    name: "Whole Turkey",
    category: "turkey",
    description: "Pasture-raised. Holiday table centerpiece with real, full flavor.",
    url: "https://parkviewfamilyfarm.com/products/whole-turkey",
    available: true,
    seasonal: true
  },
  {
    id: "turkey-breast",
    name: "Turkey Breast",
    category: "turkey",
    description: "Bone-in. Roasts faster than a whole bird. Slices beautifully.",
    url: "https://parkviewfamilyfarm.com/products/turkey-breast",
    available: true,
    seasonal: true
  },

  // RABBIT
  {
    id: "whole-rabbit",
    name: "Whole Rabbit",
    category: "rabbit",
    description: "Pasture-raised. Mild, lean white meat. Braises and fricassee beautifully.",
    url: "https://parkviewfamilyfarm.com/products/whole-rabbit",
    available: true,
    seasonal: true
  },
  {
    id: "rabbit-pieces",
    name: "Rabbit Pieces",
    category: "rabbit",
    description: "Cut and ready to cook. Stews, pasta, Dijon cream sauce.",
    url: "https://parkviewfamilyfarm.com/products/rabbit-pieces",
    available: true,
    seasonal: true
  }
];

const PVF_CATEGORIES = [
  {
    id: "chicken",
    label: "Chicken",
    products: PVF_PRODUCTS.filter(p => p.category === "chicken")
  },
  {
    id: "pork",
    label: "Pork",
    products: PVF_PRODUCTS.filter(p => p.category === "pork")
  },
  {
    id: "value-added",
    label: "Sausage & Bacon",
    products: PVF_PRODUCTS.filter(p => p.category === "value-added")
  },
  {
    id: "eggs",
    label: "Eggs",
    products: PVF_PRODUCTS.filter(p => p.category === "eggs")
  },
  {
    id: "duck-turkey",
    label: "Duck & Turkey",
    products: PVF_PRODUCTS.filter(p => p.category === "duck" || p.category === "turkey")
  },
  {
    id: "rabbit",
    label: "Rabbit",
    products: PVF_PRODUCTS.filter(p => p.category === "rabbit")
  }
];

// Quick-select presets for common use cases
const PVF_PRESETS = [
  {
    id: "summer-blt",
    label: "Summer BLT setup",
    productIds: ["bacon", "eggs-dozen"]
  },
  {
    id: "breakfast",
    label: "Breakfast spread",
    productIds: ["eggs-dozen", "breakfast-sausage", "bacon"]
  },
  {
    id: "cookout",
    label: "Backyard cookout",
    productIds: ["hot-dogs", "bratwurst", "pork-ribs"]
  },
  {
    id: "sunday-roast",
    label: "Sunday roast",
    productIds: ["whole-chicken", "pork-loin"]
  }
];

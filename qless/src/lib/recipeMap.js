/**
 * recipeMap.js
 * Maps each menu item to the raw ingredients consumed per 1 portion.
 * Used by the inventory deduction logic and shortage prediction.
 * 
 * Units must match the ingredient's unit in the DB.
 * Quantities are per single serving/portion.
 */

const RECIPE_MAP = {
  // ── Breakfast ─────────────────────────────────────────────────────────────
  "Masala Dosa": [
    { name: "Rice",       qty: 0.1  },  // 100g batter
    { name: "Urad Dal",   qty: 0.03 },  // 30g
    { name: "Potato",     qty: 0.1  },  // filling
    { name: "Onion",      qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Poha": [
    { name: "Poha",       qty: 0.1  },
    { name: "Potato",     qty: 0.05 },
    { name: "Onion",      qty: 0.05 },
    { name: "Oil",        qty: 0.01 },
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Medu Vada": [
    { name: "Urad Dal",   qty: 0.08 },
    { name: "Onion",      qty: 0.03 },
    { name: "Oil",        qty: 0.03 },  // deep fry
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Uttappa": [
    { name: "Rice",       qty: 0.1  },
    { name: "Urad Dal",   qty: 0.03 },
    { name: "Onion",      qty: 0.05 },
    { name: "Tomato",     qty: 0.05 },
    { name: "Oil",        qty: 0.01 },
  ],
  "Dhokla": [
    { name: "Chana Dal",  qty: 0.1  },
    { name: "Curd",       qty: 0.05 },
    { name: "Oil",        qty: 0.01 },
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Sabudana Vada": [
    { name: "Sabudana",   qty: 0.08 },
    { name: "Potato",     qty: 0.06 },
    { name: "Oil",        qty: 0.03 },
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Aloo Paratha": [
    { name: "Wheat Flour", qty: 0.08 },
    { name: "Potato",      qty: 0.1  },
    { name: "Butter",      qty: 0.02 },
    { name: "Spice Mix",   qty: 0.005 },
  ],
  "Tea": [
    { name: "Tea Leaves",  qty: 0.005 },
    { name: "Milk",        qty: 0.1   },
    { name: "Sugar",       qty: 0.01  },
  ],

  // ── Lunch ─────────────────────────────────────────────────────────────────
  "Dal Khichdi": [
    { name: "Rice",       qty: 0.1  },
    { name: "Moong Dal",  qty: 0.06 },
    { name: "Butter",     qty: 0.01 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Matar Paneer": [
    { name: "Paneer",       qty: 0.1  },
    { name: "Matar (Peas)", qty: 0.08 },
    { name: "Tomato",       qty: 0.1  },
    { name: "Onion",        qty: 0.06 },
    { name: "Oil",          qty: 0.02 },
    { name: "Spice Mix",    qty: 0.01 },
  ],
  "Bhindi Masala": [
    { name: "Bhindi",     qty: 0.15 },
    { name: "Onion",      qty: 0.05 },
    { name: "Tomato",     qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Veg Biryani": [
    { name: "Rice",       qty: 0.15 },
    { name: "Mixed Veg",  qty: 0.1  },
    { name: "Onion",      qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.015 },
  ],
  "Paneer Biryani": [
    { name: "Rice",       qty: 0.15 },
    { name: "Paneer",     qty: 0.1  },
    { name: "Onion",      qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.015 },
  ],
  "Misal Pav": [
    { name: "Moth Beans", qty: 0.1  },
    { name: "Pav",        qty: 2    },  // 2 pieces
    { name: "Onion",      qty: 0.05 },
    { name: "Tomato",     qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.015 },
  ],
  "Pav Bhaji": [
    { name: "Potato",     qty: 0.15 },
    { name: "Mixed Veg",  qty: 0.1  },
    { name: "Pav",        qty: 2    },
    { name: "Butter",     qty: 0.02 },
    { name: "Tomato",     qty: 0.08 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Dal Tadka": [
    { name: "Toor Dal",   qty: 0.1  },
    { name: "Tomato",     qty: 0.05 },
    { name: "Onion",      qty: 0.04 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Veg Bhuna": [
    { name: "Mixed Veg",  qty: 0.15 },
    { name: "Tomato",     qty: 0.08 },
    { name: "Onion",      qty: 0.06 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Veg Pulav": [
    { name: "Rice",       qty: 0.15 },
    { name: "Mixed Veg",  qty: 0.1  },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],
  "Mushroom": [
    { name: "Mushroom",   qty: 0.15 },
    { name: "Onion",      qty: 0.05 },
    { name: "Tomato",     qty: 0.05 },
    { name: "Oil",        qty: 0.02 },
    { name: "Spice Mix",  qty: 0.01 },
  ],

  // ── Snacks ────────────────────────────────────────────────────────────────
  "Samosa": [
    { name: "Wheat Flour", qty: 0.06 },
    { name: "Potato",      qty: 0.08 },
    { name: "Oil",         qty: 0.03 },
    { name: "Spice Mix",   qty: 0.005 },
  ],
  "Samosa Chaat": [
    { name: "Wheat Flour", qty: 0.06 },
    { name: "Potato",      qty: 0.08 },
    { name: "Curd",        qty: 0.05 },
    { name: "Oil",         qty: 0.03 },
    { name: "Spice Mix",   qty: 0.01 },
  ],
  "Vada Pav": [
    { name: "Potato",     qty: 0.1  },
    { name: "Pav",        qty: 1    },
    { name: "Chana Dal",  qty: 0.03 },
    { name: "Oil",        qty: 0.03 },
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Sandwich": [
    { name: "Bread",      qty: 2    },
    { name: "Cheese",     qty: 0.03 },
    { name: "Mixed Veg",  qty: 0.08 },
    { name: "Butter",     qty: 0.01 },
    { name: "Spice Mix",  qty: 0.005 },
  ],
  "Schezwan Rice": [
    { name: "Rice",           qty: 0.15 },
    { name: "Mixed Veg",      qty: 0.08 },
    { name: "Schezwan Sauce", qty: 0.04 },
    { name: "Oil",            qty: 0.02 },
    { name: "Soy Sauce",      qty: 0.01 },
    { name: "Spring Onion",   qty: 0.03 },
  ],
  "Hakka Noodles": [
    { name: "Noodles",      qty: 0.1  },
    { name: "Cabbage",      qty: 0.06 },
    { name: "Capsicum",     qty: 0.05 },
    { name: "Spring Onion", qty: 0.03 },
    { name: "Soy Sauce",    qty: 0.02 },
    { name: "Oil",          qty: 0.02 },
  ],
  "Fried Rice": [
    { name: "Rice",         qty: 0.15 },
    { name: "Mixed Veg",    qty: 0.08 },
    { name: "Soy Sauce",    qty: 0.02 },
    { name: "Oil",          qty: 0.02 },
    { name: "Spring Onion", qty: 0.02 },
  ],
  "Manchurian Rice": [
    { name: "Rice",         qty: 0.15 },
    { name: "Mixed Veg",    qty: 0.1  },
    { name: "Soy Sauce",    qty: 0.02 },
    { name: "Schezwan Sauce", qty: 0.03 },
    { name: "Oil",          qty: 0.02 },
    { name: "Spring Onion", qty: 0.02 },
  ],
  "Manchurian Noodles": [
    { name: "Noodles",      qty: 0.1  },
    { name: "Mixed Veg",    qty: 0.08 },
    { name: "Soy Sauce",    qty: 0.02 },
    { name: "Schezwan Sauce", qty: 0.03 },
    { name: "Oil",          qty: 0.02 },
    { name: "Spring Onion", qty: 0.02 },
  ],
}

module.exports = { RECIPE_MAP }
/**
 * inventorySeed.js
 * Run once: node inventorySeed.js
 * Populates the ingredients collection with realistic starting stock
 */

const mongoose = require("mongoose")
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/qless"

// ── Schema (mirrors index.js) ─────────────────────────────────────────────────
const ingredientSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  unit:        { type: String, enum: ["kg", "g", "L", "ml", "pcs", "dozen"], required: true },
  stock:       { type: Number, required: true },   // current stock
  threshold:   { type: Number, required: true },   // reorder alert below this
  costPerUnit: { type: Number, default: 0 },       // ₹ per unit
  category:    { type: String, default: "General" },
}, { timestamps: true })

const Ingredient = mongoose.model("Ingredient", ingredientSchema)

// ── Ingredient master list ────────────────────────────────────────────────────
const INGREDIENTS = [
  // Grains & Rice
  { name: "Rice",           unit: "kg",  stock: 20,   threshold: 5,   costPerUnit: 60,  category: "Grains" },
  { name: "Wheat Flour",    unit: "kg",  stock: 15,   threshold: 4,   costPerUnit: 45,  category: "Grains" },
  { name: "Urad Dal",       unit: "kg",  stock: 8,    threshold: 2,   costPerUnit: 120, category: "Grains" },
  { name: "Chana Dal",      unit: "kg",  stock: 6,    threshold: 2,   costPerUnit: 100, category: "Grains" },
  { name: "Moong Dal",      unit: "kg",  stock: 5,    threshold: 2,   costPerUnit: 110, category: "Grains" },
  { name: "Sabudana",       unit: "kg",  stock: 4,    threshold: 1,   costPerUnit: 90,  category: "Grains" },
  { name: "Poha",           unit: "kg",  stock: 6,    threshold: 2,   costPerUnit: 55,  category: "Grains" },
  { name: "Bread",          unit: "pcs", stock: 40,   threshold: 10,  costPerUnit: 5,   category: "Grains" },
  { name: "Pav",            unit: "pcs", stock: 80,   threshold: 20,  costPerUnit: 4,   category: "Grains" },
  { name: "Noodles",        unit: "kg",  stock: 8,    threshold: 2,   costPerUnit: 80,  category: "Grains" },

  // Vegetables
  { name: "Potato",         unit: "kg",  stock: 15,   threshold: 4,   costPerUnit: 30,  category: "Vegetables" },
  { name: "Onion",          unit: "kg",  stock: 10,   threshold: 3,   costPerUnit: 40,  category: "Vegetables" },
  { name: "Tomato",         unit: "kg",  stock: 8,    threshold: 3,   costPerUnit: 50,  category: "Vegetables" },
  { name: "Bhindi",         unit: "kg",  stock: 4,    threshold: 1,   costPerUnit: 60,  category: "Vegetables" },
  { name: "Matar (Peas)",   unit: "kg",  stock: 5,    threshold: 1.5, costPerUnit: 80,  category: "Vegetables" },
  { name: "Mixed Veg",      unit: "kg",  stock: 8,    threshold: 2,   costPerUnit: 50,  category: "Vegetables" },
  { name: "Mushroom",       unit: "kg",  stock: 3,    threshold: 1,   costPerUnit: 150, category: "Vegetables" },
  { name: "Cabbage",        unit: "kg",  stock: 4,    threshold: 1,   costPerUnit: 30,  category: "Vegetables" },
  { name: "Capsicum",       unit: "kg",  stock: 3,    threshold: 1,   costPerUnit: 80,  category: "Vegetables" },
  { name: "Spring Onion",   unit: "kg",  stock: 2,    threshold: 0.5, costPerUnit: 60,  category: "Vegetables" },

  // Dairy & Protein
  { name: "Paneer",         unit: "kg",  stock: 5,    threshold: 1.5, costPerUnit: 320, category: "Dairy" },
  { name: "Milk",           unit: "L",   stock: 10,   threshold: 3,   costPerUnit: 60,  category: "Dairy" },
  { name: "Butter",         unit: "kg",  stock: 2,    threshold: 0.5, costPerUnit: 500, category: "Dairy" },
  { name: "Curd",           unit: "kg",  stock: 4,    threshold: 1,   costPerUnit: 80,  category: "Dairy" },
  { name: "Cheese",         unit: "kg",  stock: 2,    threshold: 0.5, costPerUnit: 400, category: "Dairy" },

  // Pulses
  { name: "Toor Dal",       unit: "kg",  stock: 6,    threshold: 2,   costPerUnit: 130, category: "Pulses" },
  { name: "Moth Beans",     unit: "kg",  stock: 4,    threshold: 1,   costPerUnit: 100, category: "Pulses" },

  // Spices & Condiments
  { name: "Oil",            unit: "L",   stock: 8,    threshold: 2,   costPerUnit: 130, category: "Condiments" },
  { name: "Schezwan Sauce", unit: "kg",  stock: 2,    threshold: 0.5, costPerUnit: 200, category: "Condiments" },
  { name: "Soy Sauce",      unit: "L",   stock: 2,    threshold: 0.5, costPerUnit: 120, category: "Condiments" },
  { name: "Spice Mix",      unit: "kg",  stock: 3,    threshold: 1,   costPerUnit: 150, category: "Condiments" },
  { name: "Tea Leaves",     unit: "kg",  stock: 2,    threshold: 0.5, costPerUnit: 400, category: "Condiments" },
  { name: "Sugar",          unit: "kg",  stock: 5,    threshold: 1,   costPerUnit: 45,  category: "Condiments" },
]

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log("Connected")
  await Ingredient.deleteMany({})
  await Ingredient.insertMany(INGREDIENTS)
  console.log(`✅ Inserted ${INGREDIENTS.length} ingredients`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
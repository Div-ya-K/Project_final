/**
 * seed.js — run once to populate MongoDB with the full menu
 *
 * Usage:
 *   node seed.js
 *
 * Make sure MongoDB is running and MONGO_URI is set (or defaults to localhost).
 */

const mongoose = require("mongoose")

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/qless"

const menuItemSchema = new mongoose.Schema({
  name:      String,
  cat:       String,
  price:     Number,
  cal:       Number,
  tags:      [String],
  desc:      String,
  available: { type: Boolean, default: true },
})
const MenuItem = mongoose.model("MenuItem", menuItemSchema)

const MENU_ITEMS = [
  { name:"Masala Dosa",   cat:"Breakfast", price:60,  cal:290, tags:["HIGH DEMAND","VEGAN"], desc:"Crispy rice crepe served with coconut chutney and piping hot sambar" },
  { name:"Poha",          cat:"Breakfast", price:40,  cal:210, tags:["LOW CALORIE","VEGAN"], desc:"Flattened rice with mustard seeds, onions, green chilli and fresh coriander" },
  { name:"Medu Vada",     cat:"Breakfast", price:50,  cal:260, tags:["HIGH DEMAND","VEGAN"], desc:"Crispy urad dal fritters served with coconut chutney and sambar" },
  { name:"Uttappa",       cat:"Breakfast", price:55,  cal:280, tags:["VEGAN"],               desc:"Thick rice pancake topped with onions, tomatoes and green chillies" },
  { name:"Dhokla",        cat:"Breakfast", price:45,  cal:190, tags:["LOW CALORIE","VEGAN"], desc:"Soft steamed chickpea flour cake tempered with mustard and curry leaves" },
  { name:"Sabudana Vada", cat:"Breakfast", price:50,  cal:300, tags:["VEGAN"],               desc:"Crispy tapioca pearl patties with peanuts, cumin and green chilli" },
  { name:"Dal Khichdi",   cat:"Lunch",     price:80,  cal:350, tags:["HIGH DEMAND","VEGAN"], desc:"Comforting rice and lentil one-pot meal with ghee and whole spices" },
  { name:"Matar Paneer",  cat:"Lunch",     price:100, cal:420, tags:["HIGH DEMAND"],         desc:"Cottage cheese and green peas in a rich, spiced tomato-onion gravy" },
  { name:"Bhindi Masala", cat:"Lunch",     price:90,  cal:310, tags:["VEGAN","LOW CALORIE"], desc:"Stir-fried okra with onions, tomatoes and aromatic Indian spices" },
  { name:"Veg Biryani",   cat:"Lunch",     price:120, cal:480, tags:["HIGH DEMAND","VEGAN"], desc:"Fragrant long-grain basmati rice layered with spiced seasonal vegetables" },
  { name:"Misal Pav",     cat:"Lunch",     price:70,  cal:390, tags:["HIGH DEMAND"],         desc:"Spicy sprouted moth bean curry topped with farsan, served with pav" },
  { name:"Pav Bhaji",     cat:"Lunch",     price:80,  cal:430, tags:["HIGH DEMAND","VEGAN"], desc:"Spiced mashed vegetable curry served with buttered toasted pav rolls" },
  { name:"Samosa",        cat:"Snacks",    price:30,  cal:180, tags:["HIGH DEMAND","VEGAN"], desc:"Golden pastry filled with spiced potatoes and peas, served with chutneys" },
  { name:"Samosa Chaat",  cat:"Snacks",    price:50,  cal:250, tags:["HIGH DEMAND"],         desc:"Crushed samosa topped with yoghurt, chutneys, onions and sev" },
  { name:"Vada Pav",      cat:"Snacks",    price:35,  cal:290, tags:["HIGH DEMAND","VEGAN"], desc:"Mumbai street-style spiced potato fritter in a soft pav bun with chutney" },
  { name:"Sandwich",      cat:"Snacks",    price:55,  cal:320, tags:["LOW CALORIE"],         desc:"Toasted bread layered with mint chutney, veggies and melted cheese" },
  { name:"Schezwan Rice", cat:"Snacks",    price:90,  cal:410, tags:["HIGH DEMAND"],         desc:"Indo-Chinese wok-tossed rice with vegetables in fiery schezwan sauce" },
  { name:"Hakka Noodles", cat:"Snacks",    price:85,  cal:380, tags:["HIGH DEMAND"],         desc:"Stir-fried noodles with crisp vegetables tossed in soy and chilli sauce" },
  { name:"Fried Rice",    cat:"Snacks",    price:80,  cal:370, tags:["VEGAN"],               desc:"Classic egg-less fried rice with colourful vegetables and soy seasoning" },
]

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log("Connected to MongoDB")

  await MenuItem.deleteMany({})
  console.log("Cleared existing menu items")

  await MenuItem.insertMany(MENU_ITEMS)
  console.log(`✅ Inserted ${MENU_ITEMS.length} menu items`)

  await mongoose.disconnect()
  console.log("Done.")
}

seed().catch(err => { console.error(err); process.exit(1) })

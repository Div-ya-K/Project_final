const express  = require("express")
const cors     = require("cors")
const mongoose = require("mongoose")
const bcrypt   = require("bcryptjs")
const jwt      = require("jsonwebtoken")

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || "qless_dev_secret_change_in_prod"
const MONGO_URI  = process.env.MONGO_URI  || "mongodb://localhost:27017/qless"
const PORT       = process.env.PORT       || 3000

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err))

// =========================
// SCHEMAS
// =========================

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["student", "admin", "server"], default: "student" },
}, { timestamps: true })
const User = mongoose.model("User", userSchema)

const menuItemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  cat:       { type: String, enum: ["Breakfast", "Lunch", "Snacks"], required: true },
  price:     { type: Number, required: true },
  cal:       { type: Number, default: 0 },
  tags:      [String],
  desc:      { type: String, default: "" },
  available: { type: Boolean, default: true },
}, { timestamps: true })
const MenuItem = mongoose.model("MenuItem", menuItemSchema)

const orderSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName:  { type: String, default: "Student" },
  studentEmail: { type: String, default: "" },
  items: [{
    id:    { type: String, default: "" },
    name:  { type: String, required: true },
    price: { type: Number, required: true },
    qty:   { type: Number, default: 1 },
    cat:   { type: String, default: "" },
  }],
  total:       { type: Number, required: true },
  status:      { type: String, enum: ["PREPARING", "READY", "COMPLETED", "CANCELLED"], default: "PREPARING" },
  prepStarted: { type: Date, default: null },   // when server hit Start Preparing
  readyAt:     { type: Date, default: null },
}, { timestamps: true })
const Order = mongoose.model("Order", orderSchema)

// ── Surplus schema ────────────────────────────────────────────────────────────
const surplusSchema = new mongoose.Schema({
  orderId:   { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  itemName:  { type: String, required: true },
  itemPrice: { type: Number, required: true },
  qty:       { type: Number, default: 1 },
  expiresAt: { type: Date, required: true },
  status:    { type: String, enum: ["AVAILABLE", "ASSIGNED", "DONATABLE", "EXPIRED"], default: "AVAILABLE" },
  assignedTo:{ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
}, { timestamps: true })
const Surplus = mongoose.model("Surplus", surplusSchema)

// ── Ingredient schema ─────────────────────────────────────────────────────────
const ingredientSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  unit:        { type: String, enum: ["kg","g","L","ml","pcs","dozen"], required: true },
  stock:       { type: Number, required: true },
  threshold:   { type: Number, required: true },
  costPerUnit: { type: Number, default: 0 },
  category:    { type: String, default: "General" },
}, { timestamps: true })
const Ingredient = mongoose.model("Ingredient", ingredientSchema)

// =========================
// MIDDLEWARE
// =========================

function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ message: "No token provided" })
  const token = header.split(" ")[1]
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ message: "Invalid or expired token" }) }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin access required" })
  next()
}

function serverOrAdmin(req, res, next) {
  if (req.user?.role !== "admin" && req.user?.role !== "server")
    return res.status(403).json({ message: "Server or admin access required" })
  next()
}

// =========================
// AUTH ROUTES
// =========================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" })
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(409).json({ message: "Email already registered" })
    const hash    = await bcrypt.hash(password, 10)
    const newUser = await User.create({ name, email, password: hash, role: role || "student" })
    const token   = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET, { expiresIn: "7d" }
    )
    res.status(201).json({
      message: "Signup successful", token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    })
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }) }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: "Email and password required" })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: "Invalid email or password" })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: "Invalid email or password" })
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET, { expiresIn: "7d" }
    )
    res.json({
      message: "Login successful", token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }) }
})

app.get("/api/auth/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json({ user })
  } catch { res.status(500).json({ message: "Server error" }) }
})

// =========================
// MENU ROUTES
// =========================

app.get("/api/menu", async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { available: true }
    const items  = await MenuItem.find(filter).sort({ cat: 1, name: 1 })
    res.json(items)
  } catch { res.status(500).json({ message: "Server error" }) }
})

app.post("/api/menu", authRequired, adminOnly, async (req, res) => {
  try { res.status(201).json(await MenuItem.create(req.body)) }
  catch (err) { res.status(400).json({ message: err.message }) }
})

app.patch("/api/menu/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: "Item not found" })
    res.json(item)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

app.patch("/api/menu/:id/availability", authRequired, adminOnly, async (req, res) => {
  try {
    const { available } = req.body
    if (typeof available !== "boolean")
      return res.status(400).json({ message: "Field 'available' must be a boolean" })
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { available }, { new: true })
    if (!item) return res.status(404).json({ message: "Item not found" })
    res.json({ message: `${item.name} marked as ${available ? "available" : "unavailable"}`, item })
  } catch { res.status(500).json({ message: "Server error" }) }
})

app.delete("/api/menu/:id", authRequired, adminOnly, async (req, res) => {
  try { await MenuItem.findByIdAndDelete(req.params.id); res.json({ message: "Item deleted" }) }
  catch { res.status(500).json({ message: "Server error" }) }
})

// =========================
// ORDER ROUTES
// =========================

app.get("/api/orders", authRequired, async (req, res) => {
  try {
    const filter = req.user.role === "admin" || req.user.role === "server"
      ? {}
      : { studentId: req.user.id }
    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders)
  } catch { res.status(500).json({ message: "Server error" }) }
})

app.post("/api/orders", authRequired, async (req, res) => {
  try {
    const { items, total } = req.body
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Items array is required" })

    const cleanItems = items.map(i => ({
      id: i.id || i._id || "", name: i.name,
      price: Number(i.price), qty: Number(i.qty) || 1, cat: i.cat || "",
    }))
    for (const item of cleanItems)
      if (!item.name) return res.status(400).json({ message: "All items must have a name" })

    // ── Check for available surplus for each item ────────────────────────────
    const surplusUsed = []
    for (const item of cleanItems) {
      const surplus = await Surplus.findOne({
        itemName: item.name,
        status:   "AVAILABLE",
        expiresAt: { $gt: new Date() }
      })
      if (surplus) {
        surplusUsed.push({ surplusId: surplus._id, itemName: item.name })
      }
    }

    const order = await Order.create({
      studentId: req.user.id, studentName: req.user.name, studentEmail: req.user.email,
      items: cleanItems, total: Number(total) || 0, status: "PREPARING",
    })

    // Mark surplus as assigned
    for (const { surplusId } of surplusUsed) {
      await Surplus.findByIdAndUpdate(surplusId, { status: "ASSIGNED", assignedTo: order._id })
    }

    res.status(201).json({
      message: "Order placed successfully", order,
      surplusUsed: surplusUsed.map(s => s.itemName)
    })
  } catch (err) { console.error("Order error:", err); res.status(400).json({ message: err.message }) }
})

// PATCH status — server or admin
app.patch("/api/orders/:id/status", authRequired, serverOrAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const update = { status }
    if (status === "PREPARING") update.prepStarted = new Date()
    if (status === "READY")     update.readyAt     = new Date()

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ message: "Order not found" })
    res.json(order)
  } catch { res.status(500).json({ message: "Server error" }) }
})

// PATCH mark not picked up → creates surplus
app.patch("/api/orders/:id/notpickedup", authRequired, serverOrAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: "CANCELLED" }, { new: true }
    )
    if (!order) return res.status(404).json({ message: "Order not found" })

    // Create a surplus entry for each item
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)  // 15 mins
    const surplusItems = []
    for (const item of order.items) {
      const s = await Surplus.create({
        orderId: order._id, itemName: item.name,
        itemPrice: item.price, qty: item.qty,
        expiresAt, status: "AVAILABLE",
      })
      surplusItems.push(s)
    }

    res.json({ message: "Order marked as not picked up, surplus created", order, surplus: surplusItems })
  } catch { res.status(500).json({ message: "Server error" }) }
})

// PATCH student cancels their own order
app.patch("/api/orders/:id/cancel", authRequired, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, studentId: req.user.id })
    if (!order) return res.status(404).json({ message: "Order not found" })
    if (order.status === "COMPLETED")
      return res.status(400).json({ message: "Cannot cancel a completed order" })

    const wasReady = order.status === "READY" || order.status === "PREPARING"
    await Order.findByIdAndUpdate(req.params.id, { status: "CANCELLED" })

    // If food was already being prepared → create surplus
    if (wasReady) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      for (const item of order.items) {
        await Surplus.create({
          orderId: order._id, itemName: item.name,
          itemPrice: item.price, qty: item.qty,
          expiresAt, status: "AVAILABLE",
        })
      }
    }

    res.json({ message: "Order cancelled", surplusCreated: wasReady })
  } catch { res.status(500).json({ message: "Server error" }) }
})

// =========================
// SURPLUS ROUTES
// =========================

// ⚠️ Specific routes MUST come before the general GET /api/surplus

// GET surplus summary for admin dashboard
app.get("/api/surplus/summary", authRequired, adminOnly, async (req, res) => {
  try {
    await Surplus.updateMany(
      { expiresAt: { $lt: new Date() }, status: "AVAILABLE" },
      { status: "EXPIRED" }
    )
    const available = await Surplus.countDocuments({ status: "AVAILABLE" })
    const donatable = await Surplus.countDocuments({ status: "DONATABLE" })
    const items     = await Surplus.find({ status: { $in: ["AVAILABLE","DONATABLE"] } })
    res.json({ available, donatable, items })
  } catch { res.status(500).json({ message: "Server error" }) }
})

// POST mark surplus as donatable (end of slot)
app.post("/api/surplus/donate", authRequired, serverOrAdmin, async (req, res) => {
  try {
    const result = await Surplus.updateMany(
      { status: "AVAILABLE", expiresAt: { $lt: new Date(Date.now() + 5 * 60 * 1000) } },
      { status: "DONATABLE" }
    )
    res.json({ message: "Marked as donatable", count: result.modifiedCount })
  } catch { res.status(500).json({ message: "Server error" }) }
})

// GET all active surplus  ← always last
app.get("/api/surplus", authRequired, serverOrAdmin, async (req, res) => {
  try {
    await Surplus.updateMany(
      { expiresAt: { $lt: new Date() }, status: "AVAILABLE" },
      { status: "EXPIRED" }
    )
    const surplus = await Surplus.find({ status: { $in: ["AVAILABLE", "DONATABLE"] } })
      .sort({ expiresAt: 1 })
    res.json(surplus)
  } catch { res.status(500).json({ message: "Server error" }) }
})
// =========================
// INVENTORY ROUTES
// =========================

app.get("/api/inventory", authRequired, adminOnly, async (req, res) => {
  try { res.json(await Ingredient.find().sort({ category: 1, name: 1 })) }
  catch { res.status(500).json({ message: "Server error" }) }
})

app.get("/api/inventory/alerts", authRequired, adminOnly, async (req, res) => {
  try {
    res.json(await Ingredient.find({ $expr: { $lte: ["$stock", "$threshold"] } }).sort({ stock: 1 }))
  } catch { res.status(500).json({ message: "Server error" }) }
})

app.patch("/api/inventory/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const item = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: "Ingredient not found" })
    res.json(item)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

app.post("/api/inventory/deduct", authRequired, async (req, res) => {
  try {
    const { items } = req.body
    const results = []
    for (const { name, qty } of items) {
      const ing = await Ingredient.findOneAndUpdate(
        { name }, { $inc: { stock: -Math.abs(qty) } }, { new: true }
      )
      if (ing) results.push(ing)
    }
    res.json({ message: "Stock deducted", updated: results })
  } catch (err) { res.status(400).json({ message: err.message }) }
})

// =========================
// START
// =========================
app.get("/", (req, res) => res.send("QLess Backend Running 🚀"))
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

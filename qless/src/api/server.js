import axios from "axios"

// =========================
// 🔗 BASE API INSTANCE
// =========================
const API = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 8000,
})

// =========================
// ⚙️ REQUEST INTERCEPTOR
// Attach JWT token automatically
// =========================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qless_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// =========================
// ⚙️ RESPONSE INTERCEPTOR
// Handle errors globally
// =========================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔐 Token expired / invalid
      localStorage.removeItem("qless_token")
      localStorage.removeItem("qless_user")
      window.location.href = "/login"
    }

    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// =========================
// 🔐 AUTH APIs
// =========================

export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password })

  // 🔥 store token + user
  localStorage.setItem("qless_token", res.data.token)
  localStorage.setItem("qless_user", JSON.stringify(res.data.user))

  return res.data
}

export const signupUser = async (name, email, password, role = "student") => {
  const res = await API.post("/auth/signup", { name, email, password, role })

  // 🔥 auto login after signup
  localStorage.setItem("qless_token", res.data.token)
  localStorage.setItem("qless_user", JSON.stringify(res.data.user))

  return res.data
}

export const logoutUser = () => {
  localStorage.removeItem("qless_token")
  localStorage.removeItem("qless_user")
  window.location.href = "/login"
}

// =========================
// 🍽️ MENU APIs
// =========================

export const fetchMenu = async ({ all = false } = {}) => {
  try {
    const res = await API.get("/menu", {
      params: all ? { all: "true" } : {}
    })
    return res.data
  } catch (err) {
    console.error("Fetch menu error:", err)
    return []
  }
}

export const updateMenuItemAvailability = async (id, available) => {
  const res = await API.patch(`/menu/${id}/availability`, { available })
  return res.data
}

export const updateMenuItem = async (id, fields) => {
  const res = await API.patch(`/menu/${id}`, fields)
  return res.data
}

export const createMenuItem = async (fields) => {
  const res = await API.post("/menu", fields)
  return res.data
}

export const deleteMenuItem = async (id) => {
  const res = await API.delete(`/menu/${id}`)
  return res.data
}

// =========================
// 🧾 ORDERS APIs
// =========================

export const placeOrder = async (items, total) => {
  const res = await API.post("/orders", { items, total })
  return res.data
}

export const fetchOrders = async () => {
  try {
    const res = await API.get("/orders")
    return res.data
  } catch (err) {
    console.error("Fetch orders error:", err)
    return []
  }
}

export const updateOrderStatus = async (id, status) => {
  const res = await API.patch(`/orders/${id}/status`, { status })
  return res.data
}

// =========================
// 📦 INVENTORY APIs
// (Protected → requires admin token)
// =========================

export const fetchInventory = async () => {
  const res = await API.get("/inventory")
  return res.data
}

export const updateInventoryItem = async (id, fields) => {
  const res = await API.patch(`/inventory/${id}`, fields)
  return res.data
}

export const fetchInventoryAlerts = async () => {
  const res = await API.get("/inventory/alerts")
  return res.data
}

// 🔥 Deduct stock after order (IMPORTANT FEATURE)
export const deductInventory = async (items) => {
  const res = await API.post("/inventory/deduct", { items })
  return res.data
}

// =========================
// 📤 EXPORT
// =========================
export default API
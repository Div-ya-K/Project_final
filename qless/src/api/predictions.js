// Prediction API helper
// Flask runs on port 5001 alongside your Node/Express server

const FLASK_BASE = 'http://localhost:5001/api'

// Fetch predictions for current time slot
export async function fetchCurrentPredictions() {
  try {
    const res = await fetch(`${FLASK_BASE}/predict/current`)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    // Return mock data if Flask isn't running yet
    return getMockCurrent()
  }
}

// Fetch predictions for next time slot
export async function fetchNextPredictions() {
  try {
    const res = await fetch(`${FLASK_BASE}/predict/next`)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return getMockNext()
  }
}

// Fetch full day predictions (all slots)
export async function fetchDayPredictions() {
  try {
    const res = await fetch(`${FLASK_BASE}/predict/day`)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return getMockDay()
  }
}

// Check if Flask backend is online
export async function checkHealth() {
  try {
    const res = await fetch(`${FLASK_BASE}/health`, { signal: AbortSignal.timeout(2000) })
    return await res.json()
  } catch {
    return { status: 'offline', mode: 'demo' }
  }
}

// ── Mock data (used when Flask isn't running) ─────────────────────────────────
const DISHES = [
  'Masala Dosa','Poha','Medu Vada','Uttappa','Dhokla',
  'Dal Khichdi','Matar Paneer','Veg Biryani','Misal Pav','Pav Bhaji',
  'Samosa','Vada Pav','Schezwan Rice','Hakka Noodles',
]

function mockPredictions(slotIndex) {
  // Simulate demand curve: peaks around slot 8 (12:00 PM) and slot 11 (1:30 PM)
  const peakFactor = Math.exp(-0.03 * Math.pow(slotIndex - 9, 2))
  return DISHES.map(name => ({
    dish: name,
    predicted_orders: Math.max(2, Math.round((10 + Math.random() * 25) * peakFactor)),
    confidence: Math.round(72 + Math.random() * 20),
    trend: Math.random() > 0.5 ? 'up' : 'stable',
  })).sort((a, b) => b.predicted_orders - a.predicted_orders)
}

function getMockCurrent() {
  const hour = new Date().getHours()
  const slot = Math.max(0, (hour - 8) * 2)
  const hh = String(hour).padStart(2, '0')
  const mm = new Date().getMinutes() >= 30 ? '30' : '00'
  return { slot: `${hh}:${mm}`, slot_index: slot, mode: 'demo', predictions: mockPredictions(slot) }
}

function getMockNext() {
  const hour = new Date().getHours()
  const slot = Math.max(0, (hour - 8) * 2) + 1
  const nextHour = 8 + Math.floor(slot / 2)
  const mm = slot % 2 === 0 ? '00' : '30'
  return { slot: `${String(nextHour).padStart(2,'0')}:${mm}`, slot_index: slot, mode: 'demo', predictions: mockPredictions(slot) }
}

function getMockDay() {
  const slots = []
  for (let i = 0; i < 26; i++) {
    const hour = 8 + Math.floor(i / 2)
    const mm = i % 2 === 0 ? '00' : '30'
    slots.push({
      slot: `${String(hour).padStart(2,'0')}:${mm}`,
      slot_index: i,
      predictions: mockPredictions(i),
    })
  }
  return { mode: 'demo', slots }
}

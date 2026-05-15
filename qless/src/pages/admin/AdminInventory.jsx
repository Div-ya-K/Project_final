import { useState, useEffect, useCallback } from 'react'
import styles from './AdminInventory.module.css'
import { fetchInventory } from "../../api/server"

const API  = "http://localhost:3000/api"
const PRED = "http://localhost:5001/api"

// ── Recipe map (mirrors backend recipeMap.js) ─────────────────────────────
const RECIPE_MAP = {
  "Masala Dosa":        [{ name:"Rice",qty:.1},{ name:"Urad Dal",qty:.03},{ name:"Potato",qty:.1},{ name:"Oil",qty:.02}],
  "Poha":               [{ name:"Poha",qty:.1},{ name:"Potato",qty:.05},{ name:"Onion",qty:.05},{ name:"Oil",qty:.01}],
  "Medu Vada":          [{ name:"Urad Dal",qty:.08},{ name:"Onion",qty:.03},{ name:"Oil",qty:.03}],
  "Uttappa":            [{ name:"Rice",qty:.1},{ name:"Urad Dal",qty:.03},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.01}],
  "Dhokla":             [{ name:"Chana Dal",qty:.1},{ name:"Curd",qty:.05},{ name:"Oil",qty:.01}],
  "Sabudana Vada":      [{ name:"Sabudana",qty:.08},{ name:"Potato",qty:.06},{ name:"Oil",qty:.03}],
  "Aloo Paratha":       [{ name:"Wheat Flour",qty:.08},{ name:"Potato",qty:.1},{ name:"Butter",qty:.02}],
  "Tea":                [{ name:"Tea Leaves",qty:.005},{ name:"Milk",qty:.1},{ name:"Sugar",qty:.01}],
  "Dal Khichdi":        [{ name:"Rice",qty:.1},{ name:"Moong Dal",qty:.06},{ name:"Butter",qty:.01}],
  "Matar Paneer":       [{ name:"Paneer",qty:.1},{ name:"Matar (Peas)",qty:.08},{ name:"Tomato",qty:.1},{ name:"Onion",qty:.06},{ name:"Oil",qty:.02}],
  "Bhindi Masala":      [{ name:"Bhindi",qty:.15},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.02}],
  "Veg Biryani":        [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Paneer Biryani":     [{ name:"Rice",qty:.15},{ name:"Paneer",qty:.1},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Misal Pav":          [{ name:"Moth Beans",qty:.1},{ name:"Pav",qty:2},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Pav Bhaji":          [{ name:"Potato",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Pav",qty:2},{ name:"Butter",qty:.02},{ name:"Tomato",qty:.08}],
  "Dal Tadka":          [{ name:"Toor Dal",qty:.1},{ name:"Tomato",qty:.05},{ name:"Onion",qty:.04},{ name:"Oil",qty:.02}],
  "Veg Bhuna":          [{ name:"Mixed Veg",qty:.15},{ name:"Tomato",qty:.08},{ name:"Onion",qty:.06},{ name:"Oil",qty:.02}],
  "Veg Pulav":          [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Oil",qty:.02}],
  "Mushroom":           [{ name:"Mushroom",qty:.15},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.02}],
  "Samosa":             [{ name:"Wheat Flour",qty:.06},{ name:"Potato",qty:.08},{ name:"Oil",qty:.03}],
  "Samosa Chaat":       [{ name:"Wheat Flour",qty:.06},{ name:"Potato",qty:.08},{ name:"Curd",qty:.05},{ name:"Oil",qty:.03}],
  "Vada Pav":           [{ name:"Potato",qty:.1},{ name:"Pav",qty:1},{ name:"Chana Dal",qty:.03},{ name:"Oil",qty:.03}],
  "Sandwich":           [{ name:"Bread",qty:2},{ name:"Cheese",qty:.03},{ name:"Mixed Veg",qty:.08},{ name:"Butter",qty:.01}],
  "Schezwan Rice":      [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.08},{ name:"Schezwan Sauce",qty:.04},{ name:"Oil",qty:.02},{ name:"Soy Sauce",qty:.01},{ name:"Spring Onion",qty:.03}],
  "Hakka Noodles":      [{ name:"Noodles",qty:.1},{ name:"Cabbage",qty:.06},{ name:"Capsicum",qty:.05},{ name:"Soy Sauce",qty:.02},{ name:"Oil",qty:.02}],
  "Fried Rice":         [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.08},{ name:"Soy Sauce",qty:.02},{ name:"Oil",qty:.02}],
  "Manchurian Rice":    [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Soy Sauce",qty:.02},{ name:"Schezwan Sauce",qty:.03},{ name:"Oil",qty:.02}],
  "Manchurian Noodles": [{ name:"Noodles",qty:.1},{ name:"Mixed Veg",qty:.08},{ name:"Soy Sauce",qty:.02},{ name:"Schezwan Sauce",qty:.03},{ name:"Oil",qty:.02}],
}

const CATEGORIES = ["All","Grains","Vegetables","Dairy","Pulses","Condiments"]

const STATUS = (item) => {
  const pct = item.stock / item.threshold
  if (item.stock <= 0)            return { label: "OUT",      color: "#ef4444", bg: "#fee2e2" }
  if (pct <= 1)                   return { label: "CRITICAL", color: "#ef4444", bg: "#fee2e2" }
  if (pct <= 2)                   return { label: "LOW",      color: "#f59e0b", bg: "#fef3c7" }
  if (pct <= 4)                   return { label: "OK",       color: "#3b82f6", bg: "#dbeafe" }
  return                                 { label: "GOOD",     color: "#10b981", bg: "#d1fae5" }
}

function authHeaders() {
  const token = localStorage.getItem("qless_token")
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export default function AdminInventory() {
  const [inventory,    setInventory]    = useState([])
  const [predictions,  setPredictions]  = useState([])   // from Flask /api/predict/day
  const [shortages,    setShortages]    = useState([])   // computed
  const [alerts,       setAlerts]       = useState([])
  const [tab,          setTab]          = useState("All")
  const [search,       setSearch]       = useState("")
  const [editing,      setEditing]      = useState(null)  // ingredient being edited
  const [editVal,      setEditVal]      = useState({})
  const [loading,      setLoading]      = useState(true)
  const [predLoading,  setPredLoading]  = useState(true)
  const [saving,       setSaving]       = useState(false)

  // ── Fetch inventory ─────────────────────────────────────────────────────────
  const loadInventory = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/inventory`, { headers: authHeaders() })
      const data = await res.json()
      setInventory(Array.isArray(data) ? data : [])

      const alertRes  = await fetch(`${API}/inventory/alerts`, { headers: authHeaders() })
      const alertData = await alertRes.json()
      setAlerts(Array.isArray(alertData) ? alertData : [])
    } catch (e) { console.error("Inventory fetch error:", e) }
    finally { setLoading(false) }
  }, [])

  // ── Fetch day predictions from Flask ────────────────────────────────────────
  const loadPredictions = useCallback(async () => {
    try {
      const res  = await fetch(`${PRED}/predict/day`)
      const data = await res.json()
      setPredictions(data.slots ?? [])
    } catch {
      // Flask may not be running — graceful fallback
      setPredictions([])
    } finally { setPredLoading(false) }
  }, [])

  useEffect(() => { loadInventory(); loadPredictions() }, [loadInventory, loadPredictions])

  // ── Compute shortage predictions ─────────────────────────────────────────────
  // For each ingredient, sum up how much will be needed based on predicted orders
  // then compare against current stock
  useEffect(() => {
    if (!predictions.length || !inventory.length) return

    // Sum predicted orders per dish across all future slots (from now)
    const now     = new Date()
    const curSlot = Math.max(0, Math.min(25, (now.getHours() - 8) * 2 + (now.getMinutes() >= 30 ? 1 : 0)))
    const future  = predictions.filter(s => s.slot_index >= curSlot)

    const dishDemand = {}
    future.forEach(slot => {
      ;(slot.predictions ?? []).forEach(p => {
        dishDemand[p.dish] = (dishDemand[p.dish] ?? 0) + (p.predicted_orders ?? 0)
      })
    })

    // For each ingredient, compute total needed
    const needed = {}
    Object.entries(dishDemand).forEach(([dish, orders]) => {
      const recipe = RECIPE_MAP[dish] ?? []
      recipe.forEach(({ name, qty }) => {
        needed[name] = (needed[name] ?? 0) + qty * orders
      })
    })

    // Compare against stock
    const result = []
    inventory.forEach(ing => {
      const req = needed[ing.name] ?? 0
      if (req === 0) return
      const remaining = ing.stock - req
      if (remaining < ing.threshold) {
        result.push({
          ...ing,
          neededToday: +req.toFixed(2),
          projectedRemaining: +remaining.toFixed(2),
          shortfall: remaining < 0 ? +(-remaining).toFixed(2) : 0,
          severity: remaining < 0 ? "critical" : "warning",
        })
      }
    })

    result.sort((a, b) => a.projectedRemaining - b.projectedRemaining)
    setShortages(result)
  }, [predictions, inventory])

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = inventory.filter(i =>
    (tab === "All" || i.category === tab) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Save edit ─────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/inventory/${editing._id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ stock: Number(editVal.stock), threshold: Number(editVal.threshold) })
      })
      const updated = await res.json()
      setInventory(prev => prev.map(i => i._id === updated._id ? updated : i))
      setEditing(null)
    } catch (e) { alert("Save failed") }
    finally { setSaving(false) }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const criticalCount = inventory.filter(i => STATUS(i).label === "CRITICAL" || STATUS(i).label === "OUT").length
  const lowCount      = inventory.filter(i => STATUS(i).label === "LOW").length
  const totalCost     = inventory.reduce((s, i) => s + i.stock * i.costPerUnit, 0)

  if (loading) return <div className={styles.page}><p className={styles.loadingText}>Loading inventory...</p></div>

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Management</h1>
          <p className={styles.sub}>Real-time stock levels, alerts, and demand-based shortage forecasts.</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => { setLoading(true); loadInventory(); loadPredictions() }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>TOTAL INGREDIENTS</p>
          <p className={styles.kpiVal}>{inventory.length}</p>
        </div>
        <div className={`${styles.kpi} ${criticalCount > 0 ? styles.kpiRed : ''}`}>
          <p className={styles.kpiLabel}>CRITICAL / OUT</p>
          <p className={styles.kpiVal} style={{ color: criticalCount > 0 ? "#ef4444" : "#10b981" }}>
            {criticalCount}
          </p>
        </div>
        <div className={`${styles.kpi} ${lowCount > 0 ? styles.kpiAmber : ''}`}>
          <p className={styles.kpiLabel}>LOW STOCK</p>
          <p className={styles.kpiVal} style={{ color: lowCount > 0 ? "#f59e0b" : "#10b981" }}>
            {lowCount}
          </p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>PREDICTED SHORTAGES</p>
          <p className={styles.kpiVal} style={{ color: shortages.length > 0 ? "#f59e0b" : "#10b981" }}>
            {predLoading ? "..." : shortages.length}
          </p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>INVENTORY VALUE</p>
          <p className={styles.kpiVal}>₹{Math.round(totalCost).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className={styles.mainGrid}>

        {/* ── LEFT: Stock table ──────────────────────────────────────── */}
        <div className={styles.tableSection}>

          {/* search + tabs */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ingredient..." />
            </div>
            <div className={styles.tabs}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setTab(c)}
                  className={tab === c ? styles.tabActive : styles.tab}>{c}</button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>INGREDIENT</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>THRESHOLD</th>
                  <th>STATUS</th>
                  <th>STOCK BAR</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const st  = STATUS(item)
                  const pct = Math.min(100, (item.stock / (item.threshold * 5)) * 100)
                  return (
                    <tr key={item._id} className={st.label === "CRITICAL" || st.label === "OUT" ? styles.rowAlert : ""}>
                      <td className={styles.ingName}>{item.name}</td>
                      <td className={styles.ingCat}>{item.category}</td>
                      <td className={styles.ingStock}>
                        {editing?._id === item._id
                          ? <input type="number" step="0.1" value={editVal.stock}
                              onChange={e => setEditVal(p => ({ ...p, stock: e.target.value }))}
                              className={styles.editInput} />
                          : <strong>{item.stock} {item.unit}</strong>
                        }
                      </td>
                      <td className={styles.ingThreshold}>
                        {editing?._id === item._id
                          ? <input type="number" step="0.1" value={editVal.threshold}
                              onChange={e => setEditVal(p => ({ ...p, threshold: e.target.value }))}
                              className={styles.editInput} />
                          : `${item.threshold} ${item.unit}`
                        }
                      </td>
                      <td>
                        <span className={styles.badge} style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ minWidth: 100 }}>
                        <div className={styles.barBg}>
                          <div className={styles.barFill}
                            style={{ width: `${pct}%`, background: st.color }} />
                        </div>
                      </td>
                      <td>
                        {editing?._id === item._id ? (
                          <div className={styles.editActions}>
                            <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                              {saving ? "..." : "Save"}
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setEditing(null)}>✕</button>
                          </div>
                        ) : (
                          <button className={styles.editBtn}
                            onClick={() => { setEditing(item); setEditVal({ stock: item.stock, threshold: item.threshold }) }}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT: Alerts + Shortage Predictions ───────────────────── */}
        <div className={styles.sideCol}>

          {/* Current alerts */}
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <h3 className={styles.sideTitle}>⚠️ Stock Alerts</h3>
              <span className={styles.alertCount}>{alerts.length}</span>
            </div>
            {alerts.length === 0
              ? <p className={styles.allGood}>✓ All ingredients above threshold</p>
              : alerts.map(a => (
                <div key={a._id} className={styles.alertRow}>
                  <div>
                    <p className={styles.alertName}>{a.name}</p>
                    <p className={styles.alertSub}>{a.stock} {a.unit} remaining · threshold {a.threshold} {a.unit}</p>
                  </div>
                  <span className={styles.alertBadge}
                    style={STATUS(a).label === "OUT" ? { background:"#fee2e2",color:"#ef4444" } : { background:"#fef3c7",color:"#d97706" }}>
                    {STATUS(a).label}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Shortage predictions */}
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <h3 className={styles.sideTitle}>🔮 Predicted Shortages</h3>
              <span className={styles.predBadge}>{predLoading ? "..." : `${shortages.length} at risk`}</span>
            </div>
            <p className={styles.predNote}>
              {predLoading
                ? "Fetching demand forecast..."
                : predictions.length === 0
                ? "⚠️ Prediction server offline — start Flask on port 5001"
                : "Based on today's demand forecast from your ML model."}
            </p>

            {!predLoading && shortages.length === 0 && predictions.length > 0 && (
              <p className={styles.allGood}>✓ No shortages predicted for today</p>
            )}

            {shortages.map(s => (
              <div key={s._id} className={styles.shortageRow}
                style={{ borderLeft: `3px solid ${s.severity === "critical" ? "#ef4444" : "#f59e0b"}` }}>
                <div className={styles.shortageTop}>
                  <span className={styles.shortageName}>{s.name}</span>
                  <span className={styles.shortageSev}
                    style={{ color: s.severity === "critical" ? "#ef4444" : "#f59e0b" }}>
                    {s.severity === "critical" ? "SHORTAGE" : "AT RISK"}
                  </span>
                </div>
                <div className={styles.shortageStats}>
                  <span>Current: <b>{s.stock} {s.unit}</b></span>
                  <span>Needed: <b>{s.neededToday} {s.unit}</b></span>
                  {s.shortfall > 0 && (
                    <span style={{ color: "#ef4444" }}>Shortfall: <b>{s.shortfall} {s.unit}</b></span>
                  )}
                </div>
                <p className={styles.shortageTip}>
                  {s.severity === "critical"
                    ? `Restock at least ${s.shortfall} ${s.unit} before the next rush.`
                    : `Will drop below threshold. Consider restocking soon.`}
                </p>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {shortages.length > 0 && (
            <div className={styles.sideCard} style={{ borderLeft: "3px solid #1a6b3a" }}>
              <h3 className={styles.sideTitle}>💡 Suggestions</h3>
              <ul className={styles.suggList}>
                {shortages.slice(0, 4).map(s => (
                  <li key={s._id} className={styles.suggItem}>
                    Order <b>{Math.ceil(s.shortfall > 0 ? s.shortfall + s.threshold : s.threshold)} {s.unit}</b> of <b>{s.name}</b>
                    {s.costPerUnit > 0 && (
                      <span className={styles.suggCost}>
                        {" "}≈ ₹{Math.ceil((s.shortfall > 0 ? s.shortfall + s.threshold : s.threshold) * s.costPerUnit)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* ── Edit modal backdrop ─────────────────────────────────────── */}
      {editing && (
        <div className={styles.backdrop} onClick={() => setEditing(null)} />
      )}
    </div>
  )
}
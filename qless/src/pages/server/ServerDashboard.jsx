import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './ServerDashboard.module.css'

const API = "http://localhost:3000/api"

function authHeaders() {
  const token = localStorage.getItem("qless_token")
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

// ── Timer component — counts up from a start time ───────────────────────────
function Timer({ startTime, warn = 900 }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!startTime) return
    const tick = () => setSecs(Math.floor((Date.now() - new Date(startTime)) / 1000))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [startTime])

  const m   = String(Math.floor(secs / 60)).padStart(2, "0")
  const s   = String(secs % 60).padStart(2, "0")
  const hot = secs >= warn

  return (
    <span className={`${styles.timer} ${hot ? styles.timerHot : ""}`}>
      ⏱ {m}:{s}
    </span>
  )
}

// ── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order, onAction, surplus }) {
  const surplusMatch = surplus.filter(s =>
    order.items.some(i => i.name === s.itemName) && s.status === "AVAILABLE"
  )

  return (
    <div className={`${styles.card} ${styles[`card_${order.status}`]}`}>
      <div className={styles.cardHead}>
        <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
        <div className={styles.cardHeadRight}>
          {order.prepStarted && order.status === "PREPARING" && (
            <Timer startTime={order.prepStarted} warn={900} />
          )}
          <span className={styles.timeAgo}>{timeAgo(order.createdAt)}</span>
        </div>
      </div>

      {/* Surplus badge */}
      {surplusMatch.length > 0 && (
        <div className={styles.surplusBanner}>
          ♻️ USE SURPLUS — {surplusMatch.map(s => s.itemName).join(", ")}
        </div>
      )}

      {/* Student name */}
      <p className={styles.studentName}>👤 {order.studentName || "Student"}</p>

      {/* Items */}
      <div className={styles.itemsList}>
        {order.items.map((item, i) => (
          <div key={i} className={styles.itemRow}>
            <span className={styles.itemQty}>{item.qty}×</span>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemPrice}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.totalAmt}>₹{order.total}</span>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        {order.status === "PREPARING" && (
          <>
            <button className={styles.btnReady} onClick={() => onAction(order._id, "READY")}>
              ✓ Mark Ready
            </button>
            <button className={styles.btnNotPickedUp}
              onClick={() => onAction(order._id, "NOTPICKEDUP")}>
              Not Picked Up
            </button>
          </>
        )}
        {order.status === "READY" && (
          <>
            <button className={styles.btnComplete} onClick={() => onAction(order._id, "COMPLETED")}>
              ✓ Mark Picked Up
            </button>
            <button className={styles.btnNotPickedUp}
              onClick={() => onAction(order._id, "NOTPICKEDUP")}>
              Not Picked Up
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function ServerDashboard() {
  const { user, logout } = useAuth()
  const [orders,   setOrders]   = useState([])
  const [surplus,  setSurplus]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [oRes, sRes] = await Promise.all([
        fetch(`${API}/orders`,  { headers: authHeaders() }),
        fetch(`${API}/surplus`, { headers: authHeaders() }),
      ])
      const [oData, sData] = await Promise.all([oRes.json(), sRes.json()])
      setOrders(Array.isArray(oData) ? oData : [])
      setSurplus(Array.isArray(sData) ? sData : [])
      setLastSync(new Date())
    } catch (e) { console.error("Fetch error:", e) }
    finally { setLoading(false) }
  }, [])

  // Poll every 10 seconds
  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 10000)
    return () => clearInterval(pollRef.current)
  }, [load])

  const handleAction = async (orderId, action) => {
    try {
      if (action === "NOTPICKEDUP") {
        await fetch(`${API}/orders/${orderId}/notpickedup`, {
          method: "PATCH", headers: authHeaders()
        })
      } else {
        await fetch(`${API}/orders/${orderId}/status`, {
          method: "PATCH", headers: authHeaders(),
          body: JSON.stringify({ status: action })
        })
      }
      await load()
    } catch (e) { console.error("Action error:", e) }
  }

  // Bucket orders
  const preparing  = orders.filter(o => o.status === "PREPARING")
  const ready      = orders.filter(o => o.status === "READY")
  const cancelled  = orders.filter(o => o.status === "CANCELLED").slice(0, 10)
  const donatable  = surplus.filter(s => s.status === "DONATABLE")
  const available  = surplus.filter(s => s.status === "AVAILABLE")

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingLogo}>Q</div>
      <p>Loading kitchen screen...</p>
    </div>
  )

  return (
    <div className={styles.page}>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>Q</div>
          <div>
            <span className={styles.brandName}>QLess</span>
            <span className={styles.brandRole}>Kitchen Screen</span>
          </div>
        </div>

        <div className={styles.topStats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{preparing.length}</span>
            <span className={styles.statLabel}>PREPARING</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal} style={{ color: "#10b981" }}>{ready.length}</span>
            <span className={styles.statLabel}>READY</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal} style={{ color: "#f59e0b" }}>{available.length}</span>
            <span className={styles.statLabel}>SURPLUS</span>
          </div>
        </div>

        <div className={styles.topRight}>
          <span className={styles.syncText}>
            {lastSync ? `Synced ${timeAgo(lastSync)}` : "Syncing..."}
          </span>
          <button className={styles.refreshBtn} onClick={load}>↻</button>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{user?.name?.[0] ?? "S"}</div>
            <span>{user?.name ?? "Server"}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
        </div>
      </header>

      {/* ── Surplus alert bar ──────────────────────────────────────────── */}
      {available.length > 0 && (
        <div className={styles.surplusBar}>
          <span>♻️ <b>{available.length}</b> surplus item{available.length !== 1 ? "s" : ""} available —</span>
          {available.map(s => (
            <span key={s._id} className={styles.surplusChip}>
              {s.itemName} · expires {new Date(s.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ))}
        </div>
      )}

      {/* ── Kanban columns ─────────────────────────────────────────────── */}
      <div className={styles.kanban}>

        {/* PREPARING */}
        <div className={styles.col}>
          <div className={`${styles.colHead} ${styles.colHeadYellow}`}>
            <span className={styles.colDot} style={{ background: "#f59e0b" }} />
            <span className={styles.colTitle}>Preparing</span>
            <span className={styles.colCount}>{preparing.length}</span>
          </div>
          <div className={styles.colBody}>
            {preparing.length === 0
              ? <div className={styles.empty}>No orders being prepared</div>
              : preparing.map(o => (
                <OrderCard key={o._id} order={o} onAction={handleAction} surplus={surplus} />
              ))
            }
          </div>
        </div>

        {/* READY */}
        <div className={styles.col}>
          <div className={`${styles.colHead} ${styles.colHeadGreen}`}>
            <span className={styles.colDot} style={{ background: "#10b981" }} />
            <span className={styles.colTitle}>Ready for Pickup</span>
            <span className={styles.colCount}>{ready.length}</span>
          </div>
          <div className={styles.colBody}>
            {ready.length === 0
              ? <div className={styles.empty}>No orders ready yet</div>
              : ready.map(o => (
                <OrderCard key={o._id} order={o} onAction={handleAction} surplus={surplus} />
              ))
            }
          </div>
        </div>

        {/* CANCELLED + DONATABLE */}
        <div className={styles.col}>
          <div className={`${styles.colHead} ${styles.colHeadGrey}`}>
            <span className={styles.colDot} style={{ background: "#9ca3af" }} />
            <span className={styles.colTitle}>Cancelled / Surplus</span>
            <span className={styles.colCount}>{cancelled.length + donatable.length}</span>
          </div>
          <div className={styles.colBody}>

            {/* Donatable items */}
            {donatable.map(s => (
              <div key={s._id} className={styles.donatableCard}>
                <div className={styles.donatableHead}>
                  <span className={styles.donatableBadge}>🤝 DONATABLE</span>
                  <span className={styles.donatableTime}>
                    Expired {timeAgo(s.expiresAt)}
                  </span>
                </div>
                <p className={styles.donatableName}>{s.itemName}</p>
                <p className={styles.donatableQty}>{s.qty} portion{s.qty !== 1 ? "s" : ""}</p>
              </div>
            ))}

            {/* Cancelled orders */}
            {cancelled.map(o => (
              <div key={o._id} className={styles.cancelledCard}>
                <div className={styles.cancelledHead}>
                  <span className={styles.cancelledId}>#{o._id.slice(-6).toUpperCase()}</span>
                  <span className={styles.cancelledTime}>{timeAgo(o.createdAt)}</span>
                </div>
                <p className={styles.cancelledStudent}>{o.studentName}</p>
                <p className={styles.cancelledItems}>
                  {o.items.map(i => `${i.qty}× ${i.name}`).join(", ")}
                </p>
              </div>
            ))}

            {cancelled.length === 0 && donatable.length === 0 && (
              <div className={styles.empty}>No cancelled orders</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

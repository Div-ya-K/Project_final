import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './ServerDashboard.module.css'

const API = "http://localhost:3000/api"

function authHeaders() {
  const token = localStorage.getItem("qless_token")
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

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

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function OrderCard({ order, onAction }) {
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

      <p className={styles.studentName}>👤 {order.studentName || "Student"}</p>

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

      <div className={styles.actions}>
        {order.status === "PREPARING" && (
          <button className={styles.btnReady} onClick={() => onAction(order._id, "READY")}>
            ✓ Mark Ready
          </button>
        )}
        {order.status === "READY" && (
          <button className={styles.btnComplete} onClick={() => onAction(order._id, "COMPLETED")}>
            ✓ Mark Picked Up
          </button>
        )}
      </div>
    </div>
  )
}

export default function ServerDashboard() {
  const { user, logout } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/orders`, { headers: authHeaders() })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      setLastSync(new Date())
    } catch (e) { console.error("Fetch error:", e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 10000)
    return () => clearInterval(pollRef.current)
  }, [load])

  const handleAction = async (orderId, action) => {
    try {
      await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: action }),
      })
      await load()
    } catch (e) { console.error("Action error:", e) }
  }

  const preparing = orders.filter(o => o.status === "PREPARING")
  const ready     = orders.filter(o => o.status === "READY")

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingLogo}>Q</div>
      <p>Loading kitchen screen...</p>
    </div>
  )

  return (
    <div className={styles.page}>

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

      <div className={styles.kanban}>

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
                <OrderCard key={o._id} order={o} onAction={handleAction} />
              ))
            }
          </div>
        </div>

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
                <OrderCard key={o._id} order={o} onAction={handleAction} />
              ))
            }
          </div>
        </div>

      </div>
    </div>
  )
}
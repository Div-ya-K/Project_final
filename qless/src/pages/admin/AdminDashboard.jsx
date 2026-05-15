import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, fetchMenu } from '../../api/server'
import styles from './AdminDashboard.module.css'

const STATUS_STYLE = {
  PENDING:   { bg: '#fef9c3', color: '#ca8a04' },
  PREPARING: { bg: '#fef3c7', color: '#d97706' },
  READY:     { bg: '#d1fae5', color: '#059669' },
  COMPLETED: { bg: '#f3f4f6', color: '#6b7280' },
  CANCELLED: { bg: '#fee2e2', color: '#ef4444' },
}

const COLOURS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#1a6b3a','#f97316']

function avatarProps(name = '') {
  const parts    = name.trim().split(' ')
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  const colour   = COLOURS[name.charCodeAt(0) % COLOURS.length]
  return { initials: initials.toUpperCase() || '?', colour }
}

function orderTotal(order) {
  const t = Number(order.total ?? order.totalAmount ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) => {
    return acc + Number(i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1)
  }, 0)
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr), now = new Date()
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth()    === now.getMonth()    &&
         d.getDate()     === now.getDate()
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [menu,    setMenu]    = useState([])
  const [loading, setLoading] = useState(true)
  const [insightDismissed, setInsightDismissed] = useState(false)

  const load = () => Promise.all([
    fetchOrders().catch(() => []),
    fetchMenu({ all: true }).catch(() => []),
  ]).then(([o, m]) => {
    setOrders(Array.isArray(o) ? o : [])
    setMenu(Array.isArray(m) ? m : [])
  })

  useEffect(() => {
    load().finally(() => setLoading(false))
    const iv = setInterval(() => fetchOrders().then(o => setOrders(Array.isArray(o) ? o : [])), 30000)
    return () => clearInterval(iv)
  }, [])

  const todayOrders  = orders.filter(o => isToday(o.createdAt))
  const totalOrders  = todayOrders.length
  const todayRevenue = todayOrders.reduce((s, o) => s + orderTotal(o), 0)

  const dishCount = {}
  todayOrders.forEach(o => {
    ;(o.items ?? []).forEach(i => {
      if (i.name) dishCount[i.name] = (dishCount[i.name] ?? 0) + Number(i.qty ?? i.quantity ?? 1)
    })
  })
  const topItem    = Object.entries(dishCount).sort((a, b) => b[1] - a[1])[0]
  const highDemand = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 2)
    .map(([name, count]) => ({ name, pct: Math.min(99, Math.round((count / (topItem?.[1] ?? 1)) * 100)) }))

  const unavailableItems = menu.filter(m => !m.available).slice(0, 3)
  const recentOrders     = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  if (loading) return <div className={styles.page}><p style={{padding:40,color:'#9ca3af'}}>Loading dashboard...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSub}>Welcome back, {user?.name ?? 'Chef Commander'}.</p>
        </div>
        <div className={styles.topRight}>
          <button className={styles.bellBtn}>🔔</button>
          <div className={styles.adminChip}>
            <div className={styles.adminAvatar}>{user?.name?.[0] ?? 'A'}</div>
            <span>{user?.name ?? 'Admin'}</span>
          </div>
        </div>
      </div>

      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiIcon} style={{background:'#e8f5e9'}}>🧺</span>
            <span className={styles.kpiDelta} style={{color:'#1a6b3a'}}>Today</span>
          </div>
          <p className={styles.kpiLabel}>TOTAL ORDERS TODAY</p>
          <p className={styles.kpiVal}>{totalOrders}</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiIcon} style={{background:'#e8f5e9'}}>💳</span>
            <span className={styles.kpiDelta} style={{color:'#1a6b3a'}}>Today</span>
          </div>
          <p className={styles.kpiLabel}>REVENUE TODAY</p>
          <p className={styles.kpiVal}>₹{todayRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiIcon} style={{background:'#fef9e7'}}>⭐</span>
            <span className={styles.kpiLabel2}>{topItem?.[1] ?? 0} portions</span>
          </div>
          <p className={styles.kpiLabel}>TOP SELLING ITEM</p>
          <p className={styles.kpiVal} style={{fontSize:18}}>{topItem?.[0] ?? '—'}</p>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiIcon} style={{background:'#fef2f2'}}>⚠️</span>
          </div>
          <p className={styles.kpiLabel}>UNAVAILABLE ITEMS</p>
          <p className={styles.kpiVal} style={{color: unavailableItems.length ? '#ef4444' : '#1a6b3a'}}>
            {unavailableItems.length} Items
          </p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>Recent Orders</h3>
            <Link to="/admin/orders" className={styles.viewAll}>View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{color:'#9ca3af',fontSize:13,padding:'20px 0'}}>No orders yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>ORDER ID</th><th>USER</th><th>ITEMS</th><th>PRICE</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => {
                  const { initials, colour } = avatarProps(o.user?.name ?? o.userName ?? '')
                  const itemSummary = (o.items ?? []).map(i => `${i.qty ?? i.quantity ?? 1}x ${i.name}`).join(', ')
                  const status = (o.status ?? 'PREPARING').toUpperCase()
                  const st = STATUS_STYLE[status] ?? STATUS_STYLE.PREPARING
                  return (
                    <tr key={o._id}>
                      <td className={styles.orderId}>#{o._id?.slice(-6).toUpperCase()}</td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={{background:colour}}>{initials}</div>
                          <span>{o.user?.name ?? o.userName ?? 'Student'}</span>
                        </div>
                      </td>
                      <td className={styles.items}>{itemSummary || '—'}</td>
                      <td className={styles.price}>₹{orderTotal(o)}</td>
                      <td>
                        <span className={styles.badge} style={{background:st.bg,color:st.color}}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>High Demand</h3>
            <div className={styles.demandList}>
              {highDemand.length === 0
                ? <p style={{color:'#9ca3af',fontSize:13}}>No order data yet.</p>
                : highDemand.map(d => (
                  <div key={d.name} className={styles.demandRow}>
                    <div className={styles.demandThumb} />
                    <div className={styles.demandInfo}>
                      <div className={styles.demandTop}>
                        <span className={styles.demandName}>{d.name}</span>
                        <span className={styles.demandPct}>{d.pct}% Popular</span>
                      </div>
                      <div className={styles.progressBg}>
                        <div className={styles.progressFill} style={{width:`${d.pct}%`}} />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            <Link to="/admin/menu">
              <button className={styles.manageBtn}>Manage Full Menu</button>
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Unavailable Items</h3>
              <span className={styles.alertIcon}>🗃️</span>
            </div>
            <div className={styles.stockList}>
              {unavailableItems.length === 0
                ? <p style={{color:'#9ca3af',fontSize:13}}>All items available ✓</p>
                : unavailableItems.map(s => (
                  <div key={s._id} className={styles.stockRow} style={{borderLeft:'3px solid #ef4444'}}>
                    <div>
                      <p className={styles.stockName}>{s.name}</p>
                      <p className={styles.stockSec}>{s.cat}</p>
                    </div>
                    <span className={styles.stockQty} style={{color:'#ef4444'}}>Off</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {!insightDismissed && (
        <div className={styles.insightBanner}>
          <span className={styles.insightTag}>PRO INSIGHT</span>
          <h3 className={styles.insightTitle}>
            {topItem ? `${topItem[0]} is your top seller today.` : 'Kitchen is running smoothly.'}
          </h3>
          <p className={styles.insightDesc}>
            {topItem
              ? `${topItem[0]} has been ordered ${topItem[1]} times today. Consider preparing extra stock for the lunch rush.`
              : 'No orders yet today. Make sure the menu is up to date and available items are marked correctly.'}
          </p>
          <div className={styles.insightBtns}>
            <button className={styles.launchBtn}>Launch Promotion</button>
            <button className={styles.dismissBtn} onClick={() => setInsightDismissed(true)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}
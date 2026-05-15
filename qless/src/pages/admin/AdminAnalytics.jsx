import { useState, useEffect } from 'react'
import { fetchOrders } from '../../api/server'
import styles from './AdminAnalytics.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────

function orderTotal(order) {
  const t = Number(order.total ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) =>
    acc + Number(i.price ?? 0) * Number(i.qty ?? 1), 0)
}

function getDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' })
}

function getHourLabel(dateStr) {
  const h = new Date(dateStr).getHours()
  if (h === 0)  return '12AM'
  if (h < 12)   return `${h}AM`
  if (h === 12) return '12PM'
  return `${h - 12}PM`
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-IN', { weekday: 'short' })
  })
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  // ── Weekly data (last 7 days) ──────────────────────────────────────────────
  const last7 = getLast7Days()

  const weekMap = {}
  last7.forEach(d => { weekMap[d] = { orders: 0, rev: 0 } })

  orders.forEach(o => {
    const day = getDayLabel(o.createdAt)
    if (weekMap[day]) {
      weekMap[day].orders += 1
      weekMap[day].rev    += orderTotal(o)
    }
  })

  const WEEK   = last7.map(d => ({ d, ...weekMap[d] }))
  const maxRev = Math.max(...WEEK.map(d => d.rev), 1)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const weekRevenue   = WEEK.reduce((s, d) => s + d.rev, 0)
  const weekOrders    = WEEK.reduce((s, d) => s + d.orders, 0)
  const avgDaily      = Math.round(weekOrders / 7)

  // return rate: students who ordered more than once
  const studentCounts = {}
  orders.forEach(o => {
    const id = o.studentId ?? o.studentName ?? 'unknown'
    studentCounts[id] = (studentCounts[id] ?? 0) + 1
  })
  const returning  = Object.values(studentCounts).filter(c => c > 1).length
  const total      = Object.keys(studentCounts).length
  const returnRate = total > 0 ? Math.round((returning / total) * 100) : 0

  // ── Category split ────────────────────────────────────────────────────────
  const catCount = { Breakfast: 0, Lunch: 0, Snacks: 0 }
  orders.forEach(o => {
    ;(o.items ?? []).forEach(i => {
      const cat = i.cat ?? i.category
      if (cat && catCount[cat] !== undefined)
        catCount[cat] += Number(i.qty ?? 1)
    })
  })
  const catTotal = Object.values(catCount).reduce((s, v) => s + v, 1)
  const CATS = [
    { label: 'Breakfast Items', pct: Math.round((catCount.Breakfast / catTotal) * 100), color: 'var(--green)' },
    { label: 'Lunch Dishes',    pct: Math.round((catCount.Lunch     / catTotal) * 100), color: 'var(--green-mid)' },
    { label: 'Snacks & Sides',  pct: Math.round((catCount.Snacks    / catTotal) * 100), color: '#86efac' },
  ]

  // ── Peak hours (today) ────────────────────────────────────────────────────
  const today = new Date()
  const hourMap = {}
  orders.forEach(o => {
    const d = new Date(o.createdAt)
    const isToday =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth()    === today.getMonth()    &&
      d.getDate()     === today.getDate()
    if (!isToday) return
    const label = getHourLabel(o.createdAt)
    hourMap[label] = (hourMap[label] ?? 0) + 1
  })

  // build ordered hour slots 7AM–8PM
  const HOUR_SLOTS = ['7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM']
  const PEAK = HOUR_SLOTS.map(t => ({ t, v: hourMap[t] ?? 0 }))
  const maxPeak = Math.max(...PEAK.map(p => p.v), 1)
  // scale to 0-100px height
  const PEAK_SCALED = PEAK.map(p => ({ ...p, h: Math.round((p.v / maxPeak) * 100) }))

  if (loading) return (
    <div className={styles.page}>
      <p style={{ color: '#9ca3af', padding: 40 }}>Loading analytics...</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>
      <p className={styles.sub}>Revenue, order trends, and campus dining insights — live from your data.</p>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        {[
          { l: 'THIS WEEK REVENUE', v: `₹${weekRevenue.toLocaleString('en-IN')}`, c: '#10b981' },
          { l: 'TOTAL ORDERS (7 DAYS)', v: weekOrders.toLocaleString(), c: '#3b82f6' },
          { l: 'AVG DAILY ORDERS', v: avgDaily.toString(), c: 'var(--green)' },
          { l: 'RETURN RATE', v: `${returnRate}%`, c: '#f59e0b' },
        ].map((k, i) => (
          <div key={i} className={styles.kpiCard}>
            <p className={styles.kpiLabel}>{k.l}</p>
            <div className={styles.kpiRow}>
              <span className={styles.kpiVal}>{k.v}</span>
              <span className={styles.kpiChip} style={{ color: k.c, background: k.c + '18' }}>
                Live
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.row}>

        {/* Weekly Revenue bar chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Weekly Revenue</h3>
          <div className={styles.bars}>
            {WEEK.map(d => (
              <div key={d.d} className={styles.barCol}>
                <span className={styles.barVal}>
                  {d.rev > 0 ? `₹${(d.rev / 1000).toFixed(1)}k` : '—'}
                </span>
                <div className={styles.bar}
                  style={{ height: `${Math.max((d.rev / maxRev) * 120, d.rev > 0 ? 8 : 0)}px` }} />
                <span className={styles.barDay}>{d.d}</span>
                <span className={styles.barOrders}>{d.orders} orders</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category split */}
        <div className={styles.breakCard}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 20 }}>Category Split</h3>
          {catTotal <= 1 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>No order data yet.</p>
          ) : CATS.map(c => (
            <div key={c.label} className={styles.catRow}>
              <div className={styles.catMeta}>
                <span>{c.label}</span>
                <span className={styles.catPct}>{c.pct}%</span>
              </div>
              <div className={styles.progressBg}>
                <div className={styles.progressFill}
                  style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak hours */}
      <div className={styles.peakCard}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 4 }}>Peak Hours — Today</h3>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
          {Object.keys(hourMap).length === 0
            ? 'No orders placed today yet.'
            : `${Object.values(hourMap).reduce((s, v) => s + v, 0)} orders placed today`}
        </p>
        <div className={styles.peakGrid}>
          {PEAK_SCALED.map(p => (
            <div key={p.t} className={styles.peakCol}>
              <div className={styles.peakBar}
                style={{
                  height: `${Math.max(p.h, p.v > 0 ? 6 : 0)}px`,
                  background: p.h > 80 ? '#ef4444' : p.h > 50 ? '#f59e0b' : p.v > 0 ? 'var(--green)' : '#e5e7eb'
                }} />
              <span className={styles.peakLabel}>{p.t}</span>
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <span className={styles.dot} style={{ background: '#ef4444' }} /> Peak
          <span className={styles.dot} style={{ background: '#f59e0b', marginLeft: 12 }} /> Busy
          <span className={styles.dot} style={{ background: 'var(--green)', marginLeft: 12 }} /> Normal
          <span className={styles.dot} style={{ background: '#e5e7eb', marginLeft: 12 }} /> No orders
        </div>
      </div>
    </div>
  )
}
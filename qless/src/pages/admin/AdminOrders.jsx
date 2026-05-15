import { useState, useEffect } from 'react'
import { fetchOrders, updateOrderStatus } from '../../api/server'
import styles from './AdminOrders.module.css'

const FILTERS = ['All Orders', 'Preparing', 'Ready', 'Completed']

const STATUS_STYLE = {
  PREPARING: { bg: '#fef3c7', color: '#d97706' },
  READY:     { bg: '#d1fae5', color: '#059669' },
  COMPLETED: { bg: '#f3f4f6', color: '#6b7280' },
}

const COLOURS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#1a6b3a','#f97316']

function getAvatar(name = '') {
  const parts    = name.trim().split(' ')
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  const colour   = COLOURS[name.charCodeAt(0) % COLOURS.length]
  return { initials: initials.toUpperCase() || '?', colour }
}

function orderTotal(order) {
  const t = Number(order.total ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) =>
    acc + Number(i.price ?? 0) * Number(i.qty ?? 1), 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d   = new Date(dateStr)
  const now = new Date()
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return isToday ? `Today, ${time}` : `${d.toLocaleDateString([], { month:'short', day:'numeric' })}, ${time}`
}

const PAGE_SIZE = 8

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [filter,  setFilter]  = useState('All Orders')
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)

  const load = () =>
    fetchOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  // advance status: PREPARING → READY → COMPLETED
  const advance = async (order) => {
    const next = { PREPARING: 'READY', READY: 'COMPLETED' }
    const newStatus = next[order.status]
    if (!newStatus) return
    // optimistic
    setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: newStatus } : o))
    try {
      await updateOrderStatus(order._id, newStatus)
    } catch {
      // revert
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: order.status } : o))
    }
  }

  // filter + search
  const filtered = orders
    .filter(o => filter === 'All Orders' || o.status === filter.toUpperCase())
    .filter(o => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        o._id?.toLowerCase().includes(s) ||
        o.studentName?.toLowerCase().includes(s) ||
        o.items?.some(i => i.name?.toLowerCase().includes(s))
      )
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // bottom bar stats — from today's orders
  const today        = new Date()
  const todayOrders  = orders.filter(o => {
    const d = new Date(o.createdAt)
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth()    &&
           d.getDate()     === today.getDate()
  })
  const todayRevenue = todayOrders.reduce((s, o) => s + orderTotal(o), 0)
  const queued       = orders.filter(o => o.status === 'PREPARING').length

  if (loading) return <div className={styles.page}><p style={{padding:40,color:'#9ca3af'}}>Loading orders...</p></div>

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Orders Management</h1>
        <div className={styles.topRight}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input
              placeholder="Search by order ID, student, or item..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button className={styles.iconBtn} onClick={load} title="Refresh">🔄</button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.tabs}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={filter === f ? styles.tabActive : styles.tab}>
              {f}
              {f !== 'All Orders' && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  ({orders.filter(o => o.status === f.toUpperCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className={styles.filterRight}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>STUDENT</th>
              <th>ITEMS ORDERED</th>
              <th>TOTAL</th>
              <th>DATE & TIME</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                  No orders found
                </td>
              </tr>
            ) : paginated.map(o => {
              const name       = o.studentName || 'Student'
              const { initials, colour } = getAvatar(name)
              const itemSummary = (o.items ?? [])
                .map(i => `${i.qty ?? 1}x ${i.name}`).join(', ')
              const status = (o.status ?? 'PREPARING').toUpperCase()
              const st     = STATUS_STYLE[status] ?? STATUS_STYLE.PREPARING

              return (
                <tr key={o._id}>
                  <td className={styles.orderId}>
                    #{o._id?.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ background: colour }}>
                        {initials}
                      </div>
                      <span className={styles.userName}>{name}</span>
                    </div>
                  </td>
                  <td className={styles.itemsTd}>{itemSummary || '—'}</td>
                  <td className={styles.price}>₹{orderTotal(o)}</td>
                  <td className={styles.date}>{formatDate(o.createdAt)}</td>
                  <td>
                    <span className={styles.badge}
                      style={{ background: st.bg, color: st.color }}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {status !== 'COMPLETED' && (
                        <button className={styles.updateBtn} onClick={() => advance(o)}>
                          {status === 'PREPARING' ? '→ Ready' : '→ Complete'}
                        </button>
                      )}
                      <button className={styles.detailBtn}>View</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </span>
          <div className={styles.pages}>
            <button className={styles.pageBtn} disabled={page === 1}
              onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n}
                className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button className={styles.pageBtn} disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.rushCard}>
          <h3 className={styles.rushTitle}>Live Kitchen Status</h3>
          <p className={styles.rushDesc}>
            {queued > 0
              ? `${queued} order${queued !== 1 ? 's' : ''} currently being prepared. Keep an eye on the queue.`
              : 'No orders in the queue right now. Kitchen is clear.'}
          </p>
          <div className={styles.rushStats}>
            <div className={styles.rushStat}>
              <p className={styles.rushStatVal}>{queued}</p>
              <p className={styles.rushStatLabel}>ORDERS QUEUED</p>
            </div>
            <div className={styles.rushStat}>
              <p className={styles.rushStatVal}>{todayOrders.length}</p>
              <p className={styles.rushStatLabel}>ORDERS TODAY</p>
            </div>
            <div className={styles.rushStat}>
              <p className={styles.rushStatVal}>
                {orders.filter(o => o.status === 'READY').length}
              </p>
              <p className={styles.rushStatLabel}>READY FOR PICKUP</p>
            </div>
          </div>
        </div>

        <div className={styles.revenueCard}>
          <div className={styles.revIcon}>📈</div>
          <p className={styles.revTitle}>Today's Revenue</p>
          <p className={styles.revSub}>
            {todayOrders.length} orders placed today across campus.
          </p>
          <p className={styles.revAmount}>
            ₹{todayRevenue.toLocaleString('en-IN')}
          </p>
          <p className={styles.revUpdate}>LIVE DATA</p>
        </div>
      </div>

    </div>
  )
}
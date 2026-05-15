import { useState, useEffect } from 'react'
import { fetchOrders } from '../../api/server'
import styles from './AdminStudents.module.css'

const COLOURS = ['#1a6b3a','#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#f97316']

function getColour(name = '') {
  return COLOURS[name.charCodeAt(0) % COLOURS.length]
}

function getInitials(name = '') {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

function orderTotal(order) {
  const t = Number(order.total ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) =>
    acc + Number(i.price ?? 0) * Number(i.qty ?? 1), 0)
}

function formatJoined(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetchOrders()
      .then(orders => {
        // Build a student map from all orders
        const map = {}
        orders.forEach(o => {
          const id    = o.studentId ?? o.studentName ?? 'unknown'
          const name  = o.studentName || 'Unknown Student'
          const email = o.studentEmail || `${name.split(' ')[0].toLowerCase()}@campus.edu`

          if (!map[id]) {
            map[id] = {
              id,
              name,
              email,
              orders:  0,
              spent:   0,
              joined:  o.createdAt,   // earliest order = joined proxy
              lastOrder: o.createdAt,
            }
          }

          map[id].orders += 1
          map[id].spent  += orderTotal(o)

          // track earliest order as "joined" and latest as last active
          if (new Date(o.createdAt) < new Date(map[id].joined))
            map[id].joined = o.createdAt
          if (new Date(o.createdAt) > new Date(map[id].lastOrder))
            map[id].lastOrder = o.createdAt
        })

        // active = ordered in last 30 days
        const now = Date.now()
        const result = Object.values(map).map(s => ({
          ...s,
          active: (now - new Date(s.lastOrder).getTime()) < 30 * 24 * 60 * 60 * 1000
        })).sort((a, b) => b.orders - a.orders)

        setStudents(result)
      })
      .catch(err => console.error('Students fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = students.filter(s => s.active).length

  if (loading) return (
    <div className={styles.page}>
      <p style={{ color: '#9ca3af', padding: 40 }}>Loading students...</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.sub}>Student accounts derived from order history.</p>
        </div>
        <div className={styles.statPills}>
          <div className={styles.pill}>
            <span className={styles.pillNum}>{activeCount}</span>
            <span className={styles.pillLabel}>Active</span>
          </div>
          <div className={styles.pill}>
            <span className={styles.pillNum}>{students.length}</span>
            <span className={styles.pillLabel}>Total</span>
          </div>
        </div>
      </div>

      <div className={styles.searchBox}>
        <span>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>EMAIL</th>
              <th>ORDERS</th>
              <th>TOTAL SPENT</th>
              <th>FIRST ORDER</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                  {students.length === 0 ? 'No orders placed yet — students will appear here once they order.' : 'No students match your search.'}
                </td>
              </tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className={styles.nameCell}>
                    <div className={styles.avatar} style={{ background: getColour(s.name) }}>
                      {getInitials(s.name)}
                    </div>
                    <span className={styles.name}>{s.name}</span>
                  </div>
                </td>
                <td className={styles.email}>{s.email}</td>
                <td className={styles.orders}>{s.orders}</td>
                <td className={styles.spent}>₹{s.spent.toLocaleString('en-IN')}</td>
                <td className={styles.joined}>{formatJoined(s.joined)}</td>
                <td>
                  <span className={styles.badge} style={{
                    background: s.active ? '#d1fae5' : '#f3f4f6',
                    color:      s.active ? '#059669' : '#9ca3af'
                  }}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td><button className={styles.viewBtn}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
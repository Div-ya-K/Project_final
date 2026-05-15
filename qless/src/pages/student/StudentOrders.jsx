import { useState, useEffect } from 'react'
import { fetchOrders } from '../../api/server'
import { MENU_IMAGES } from '../../lib/menuImages'
import styles from './StudentOrders.module.css'

const STATUS_COLOR = { PREPARING: '#f59e0b', READY: '#10b981', COMPLETED: '#9ca3af' }
const STATUS_BG    = { PREPARING: '#fef3c7', READY: '#d1fae5',  COMPLETED: '#f3f4f6' }

// Reliable fallback — a real hosted food image
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80'

// Get image for a dish name — fallback to Unsplash instead of placeholder.com
function getImage(name) {
  if (!name) return FALLBACK_IMG
  return MENU_IMAGES[name] ?? FALLBACK_IMG
}

// Safely calculate total — handles all common backend shapes
function calcTotal(order) {
  // Backend stored a valid total
  const t = Number(order.total ?? order.totalAmount ?? order.amount)
  if (!isNaN(t) && t > 0) return t

  // Calculate from items array
  if (Array.isArray(order.items) && order.items.length > 0) {
    const sum = order.items.reduce((acc, item) => {
      const price = Number(item.price ?? item.unitPrice ?? item.itemPrice ?? 0)
      const qty   = Number(item.qty   ?? item.quantity  ?? item.count    ?? 1)
      return acc + price * qty
    }, 0)
    if (!isNaN(sum) && sum > 0) return sum
  }

  return 0
}

export default function StudentOrders() {
  const [orders,  setOrders]  = useState([])
  const [filter,  setFilter]  = useState('All')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err  => { console.error('Fetch orders error:', err); setError('Failed to load orders.') })
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    filter === 'All'    ? orders :
    filter === 'Active' ? orders.filter(o => o.status !== 'COMPLETED') :
                          orders.filter(o => o.status === 'COMPLETED')

  const activeCount    = orders.filter(o => o.status !== 'COMPLETED').length
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p style={{ color: '#9ca3af', paddingTop: 60, textAlign: 'center' }}>Loading your orders...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p style={{ color: '#ef4444', paddingTop: 60, textAlign: 'center' }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Your Orders</h1>
        <p className={styles.sub}>Track and manage your recent orders across campus.</p>

        <div className={styles.layout}>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <p className={styles.sideLabel}>SUMMARY</p>
              <div className={styles.sideRow}>
                <span>Active Orders</span>
                <span className={styles.activeBadge}>{activeCount}</span>
              </div>
              <div className={styles.sideRow} style={{ borderBottom: 'none' }}>
                <span>Completed</span>
                <span className={styles.mutedNum}>{completedCount}</span>
              </div>
            </div>

            <div className={styles.sideCard}>
              <p className={styles.sideLabel}>QUICK FILTERS</p>
              <div className={styles.filterGroup}>
                {['All', 'Active', 'History'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={filter === f ? styles.filterActive : styles.filterBtn}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ORDER LIST */}
          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                No orders found
              </div>
            ) : (
              filtered.map(order => {
                const total     = calcTotal(order)
                const firstItem = order.items?.[0]
                const itemNames = order.items
                  ?.map(i => i.name)
                  .filter(Boolean)
                  .join(', ') || 'Order'
                const itemCount = order.items?.length ?? 0

                return (
                  <div key={order._id} className={styles.orderCard}>

                    {/* IMAGE */}
                    <img
                      src={getImage(firstItem?.name)}
                      alt={firstItem?.name || 'Order'}
                      className={styles.orderImg}
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
                    />

                    {/* INFO */}
                    <div className={styles.orderInfo}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderId}>
                          ORDER #{order._id?.slice(-6).toUpperCase()}
                        </span>
                        <span className={styles.statusBadge} style={{
                          background: STATUS_BG[order.status]   || STATUS_BG.PREPARING,
                          color:      STATUS_COLOR[order.status] || STATUS_COLOR.PREPARING,
                        }}>
                          {order.status || 'PREPARING'}
                        </span>
                      </div>

                      <p className={styles.orderName}>{itemNames}</p>
                      <p className={styles.orderDesc}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>

                      <div className={styles.orderActions}>
                        <button className={styles.reorderBtn}>Reorder</button>
                        <button className={styles.detailBtn}>View Details</button>
                      </div>
                    </div>

                    {/* PRICE + TIME */}
                    <div className={styles.orderRight}>
                      <p className={styles.orderPrice}>₹{total}</p>
                      <p className={styles.orderTime}>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </p>
                    </div>

                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
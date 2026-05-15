import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { fetchCurrentPredictions } from '../../api/predictions'
import { fetchMenu } from '../../api/server'
import { getMenuImage } from '../../lib/menuImages'
import Icon from '../../components/common/Icon'
import styles from './StudentMenu.module.css'

export default function StudentMenu() {
  const { cart, addToCart, cartCount, cartTotal } = useCart()
  const navigate = useNavigate()

  const [menu,      setMenu]      = useState([])
  const [search,    setSearch]    = useState('')
  const [demandMap, setDemandMap] = useState({})
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchMenu({ all: true })
      .then(data => setMenu(Array.isArray(data) ? data : []))
      .catch(err => console.error('Menu fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCurrentPredictions().then(data => {
      if (!data?.predictions) return
      const max = Math.max(...data.predictions.map(p => p.predicted_orders))
      const map = {}
      data.predictions.forEach(p => {
        map[p.dish] = {
          orders: p.predicted_orders,
          high:   p.predicted_orders > max * 0.6,
          low:    p.predicted_orders < max * 0.25,
        }
      })
      setDemandMap(map)
    })
  }, [])

  const items = menu
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.available === b.available) return 0
      return a.available ? -1 : 1
    })

  if (loading) return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <p style={{ color: 'var(--text-faint)', paddingTop: 60, textAlign: 'center' }}>
          Loading menu...
        </p>
      </div>
    </div>
  )

  return (
    <div className={styles.layout}>

      {/* MAIN */}
      <div className={styles.main}>
        <h1 className={styles.title}>Menu</h1>
        <p className={styles.sub}>
          Browse and order your favourite food from our curated campus kitchen.
        </p>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Icon name="search" size={16} color="var(--text-faint)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for food..."
            />
          </div>
        </div>

        <div className={styles.grid}>
          {items.map(item => {
            const demand      = demandMap[item.name]
            const unavailable = !item.available
            const itemId      = item._id || item.id

            return (
              <div
                key={itemId}
                className={`${styles.card} ${unavailable ? styles.cardUnavailable : ''}`}
              >
                <div className={styles.cardImg}>
                  <img
                    src={getMenuImage(item.name)}
                    alt={item.name}
                    style={{ opacity: unavailable ? 0.45 : 1 }}
                  />
                  {unavailable && (
                    <span className={styles.unavailBadge}>Currently Unavailable</span>
                  )}
                  {!unavailable && demand?.high && (
                    <span className={styles.demandBadge} style={{ background: '#ef4444' }}>
                      🔥 High Demand
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardName} style={{ opacity: unavailable ? 0.5 : 1 }}>
                    {item.name}
                  </p>
                  {unavailable && (
                    <p className={styles.unavailHint}>Check back later</p>
                  )}
                  <div className={styles.cardFoot}>
                    <span className={styles.price} style={{ opacity: unavailable ? 0.5 : 1 }}>
                      ₹{item.price}
                    </span>
                    <button
                      className={styles.addBtn}
                      disabled={unavailable}
                      title={unavailable ? 'Item not available' : 'Add to cart'}
                      onClick={() => !unavailable && addToCart(item)}
                    >
                      <Icon name="plus" size={14} color="#fff" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {items.length === 0 && (
            <div className={styles.empty}>No items found</div>
          )}
        </div>
      </div>

      {/* CART SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHead}>
          <h3>Your Cart</h3>
          <span className={styles.countBadge}>{cartCount}</span>
        </div>

        {cart.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', paddingTop: 40 }}>
            Your cart is empty
          </p>
        ) : (
          <>
            <div className={styles.cartItems}>
              {cart.map(item => {
                const itemId = item._id || item.id
                return (
                  <div key={itemId} className={styles.cartRow}>
                    <div className={styles.cartInfo}>
                      <p className={styles.cartName}>{item.name}</p>
                      <p className={styles.cartQty}>{item.qty}× ₹{item.price}</p>
                    </div>
                    <p className={styles.cartPrice}>₹{item.price * item.qty}</p>
                  </div>
                )
              })}
            </div>

            <div className={styles.cartTotalRow}>
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>

            <button
              className={styles.viewCartBtn}
              onClick={() => navigate('/student/cart')}
            >
              View Cart
            </button>
          </>
        )}
      </aside>

    </div>
  )
}
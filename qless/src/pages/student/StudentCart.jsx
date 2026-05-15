import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { placeOrder, deductInventory } from "../../api/server"
import { getMenuImage } from '../../lib/menuImages'
import Icon from '../../components/common/Icon'
import styles from './StudentCart.module.css'

export default function StudentCart() {
  const { cart, updateQty, removeItem, clearCart, cartTotal } = useCart()
  const navigate = useNavigate()

  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)

  const tax = Math.round(cartTotal * 0.05)
  const delivery = 0
  const total = cartTotal + tax + delivery

  // 🔥 PLACE ORDER HANDLER
  const handleOrder = async () => {
    if (cart.length === 0) return

    setLoading(true)

    try {
      // ✅ Clean items for backend
      const cleanItems = cart.map(item => ({
        id: item._id || item.id || '',
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty) || 1,
        cat: item.cat || '',
      }))

      // ✅ 1. Place order
      await placeOrder(cleanItems, total)

      // 🔥 2. Deduct inventory (NEW FEATURE)
      await deductInventory(cleanItems)

      // ✅ 3. Clear cart + success
      clearCart()
      setPlaced(true)

    } catch (err) {
      console.error("Order failed:", err.response?.data || err)
      alert("Order failed ❌")
    }

    setLoading(false)
  }

  // ✅ SUCCESS SCREEN
  if (placed) return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <Icon name="check" size={36} color="var(--green)" />
        </div>
        <h2 className={styles.successTitle}>Order Placed! 🎉</h2>
        <p className={styles.successSub}>
          Your order will be ready in 10–15 minutes. Head to the QLess Zone to pick it up.
        </p>
        <button
          className={styles.trackBtn}
          onClick={() => navigate('/student/orders')}
        >
          Track Order
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Your Cart 🛒</h1>
        <p className={styles.sub}>Review your order before placing</p>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty</p>
            <button
              className={styles.browseBtn}
              onClick={() => navigate('/student/menu')}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className={styles.layout}>

            {/* LEFT: CART ITEMS */}
            <div className={styles.items}>
              {cart.map(item => (
                <div key={item._id || item.id} className={styles.itemCard}>
                  
                  <img
                    src={getMenuImage(item.name)}
                    alt={item.name}
                    className={styles.itemImg}
                  />

                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemDesc}>{item.desc}</p>

                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item._id || item.id)}
                    >
                      REMOVE
                    </button>
                  </div>

                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQty(item._id || item.id, -1)}>
                      <Icon name="minus" size={12} color="var(--green)" />
                    </button>

                    <span>{item.qty}</span>

                    <button onClick={() => updateQty(item._id || item.id, 1)}>
                      <Icon name="plus" size={12} color="#fff" />
                    </button>
                  </div>

                  <span className={styles.itemPrice}>
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}

              {/* PERKS */}
              <div className={styles.perks}>
                <div className={styles.perk}>
                  <div className={styles.perkIcon}>✦</div>
                  <div>
                    <p className={styles.perkTitle}>Campus Points</p>
                    <p className={styles.perkSub}>
                      Earning {Math.floor(total / 10)} pts
                    </p>
                  </div>
                </div>

                <div className={styles.perk}>
                  <div className={styles.perkIcon}>🚚</div>
                  <div>
                    <p className={styles.perkTitle}>Free Pickup</p>
                    <p className={styles.perkSub}>
                      No delivery fee — pick up at QLess Zone
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY */}
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Delivery</span>
                  <span className={styles.free}>FREE</span>
                </div>
              </div>

              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>

              <div className={styles.promoRow}>
                <input placeholder="Promo code" className={styles.promoInput} />
                <button className={styles.promoBtn}>APPLY</button>
              </div>

              <button
                className={styles.placeBtn}
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? "Placing..." : "Place Order"}
                <Icon name="arrow" size={14} color="#fff" />
              </button>

              <div className={styles.badges}>
                <span>🔒 Secure</span>
                <span>🌿 Fresh Daily</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
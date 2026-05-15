import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { MENU_ITEMS } from '../../lib/data'
import Icon from '../../components/common/Icon'
import styles from './StudentHome.module.css'

export default function StudentHome() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const trending = MENU_ITEMS.filter(m => m.tags.includes('HIGH DEMAND')).slice(0, 3)
  const daily    = MENU_ITEMS.slice(4, 8)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Hi {user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
            <p className={styles.greetingSub}>Lunch Slot (12–2 PM)</p>
          </div>
          <span className={styles.badge}>
            <span className={`${styles.dot} pulse`} /> Inside Campus
          </span>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>TOTAL SPENDING</p>
            <p className={styles.statVal}>₹2,458</p>
            <p className={styles.statSub}>+2% this week</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>TOTAL ORDERS</p>
            <p className={styles.statVal}>42</p>
            <p className={styles.statSub}>Meals delivered</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>FAVOURITE ITEM</p>
            <div className={styles.favRow}>
              <img src={MENU_ITEMS[6].img} alt="fav" className={styles.favImg} />
              <div>
                <p className={styles.favName}>Dal Khichdi</p>
                <p className={styles.statSub}>Ordered 8 times</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Now */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              <Icon name="fire" size={18} color="#f97316" /> Trending Now
            </h2>
            <Link to="/student/menu" className={styles.viewAll}>View all →</Link>
          </div>
          <div className={styles.cardGrid3}>
            {trending.map(item => (
              <div key={item.id} className={styles.menuCard}>
                <div className={styles.cardImg}>
                  <img src={item.img} alt={item.name} />
                  <span className={styles.hotTag}>HOT</span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>{item.name}</p>
                  <p className={styles.cardDesc}>{item.desc}</p>
                  <div className={styles.cardFoot}>
                    <span className={styles.cardPrice}>₹{item.price}</span>
                    <button className={styles.addBtn} onClick={() => addToCart(item)}>
                      <Icon name="plus" size={14} color="#fff" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Curations */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Daily Curations</h2>
            <div className={styles.filters}>
              {['ALL', 'VEGAN', 'LOW CALORIE'].map(t => (
                <span key={t} className={t === 'ALL' ? styles.filterActive : styles.filter}>{t}</span>
              ))}
            </div>
          </div>
          <div className={styles.cardGrid4}>
            {daily.map(item => (
              <div key={item.id} className={styles.smallCard}>
                <div className={styles.smallImg}>
                  <img src={item.img} alt={item.name} />
                  <span className={styles.smallTag}>{item.tags[0]}</span>
                </div>
                <div className={styles.smallBody}>
                  <p className={styles.smallName}>{item.name}</p>
                  <div className={styles.cardFoot}>
                    <span className={styles.cardPrice}>₹{item.price}</span>
                    <button className={styles.addBtnSm} onClick={() => addToCart(item)}>+ Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
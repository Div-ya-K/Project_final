import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Icon from '../common/Icon'
import styles from './StudentNav.module.css'

const NAV_ITEMS = [
  { path: '/student',          label: 'Home',     icon: 'home' },
  { path: '/student/menu',     label: 'Menu',     icon: 'menu' },
  { path: '/student/orders',   label: 'Orders',   icon: 'orders' },
  { path: '/student/insights', label: 'Insights', icon: 'insights' },
]

export default function StudentNav() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/student" className={styles.logo}>
          <div className={styles.logoIcon}>Q</div>
          <span>QLess</span>
        </Link>

        <div className={styles.links}>
          {NAV_ITEMS.map(n => (
            <Link key={n.path} to={n.path}
              className={`${styles.link} ${location.pathname === n.path ? styles.active : ''}`}>
              <Icon name={n.icon} size={15} />
              {n.label}
            </Link>
          ))}
        </div>

        <div className={styles.right}>
          <Link to="/student/cart" className={styles.cartBtn}>
            <Icon name="cart" size={19} color="var(--green)" />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
          <button className={styles.iconBtn}><Icon name="bell" size={19} color="var(--text-muted)" /></button>
          <div className={styles.avatar} title={user?.name}>
            {user?.name?.[0] ?? 'D'}
          </div>
          <button className={styles.iconBtn} onClick={handleLogout} title="Logout">
            <Icon name="logout" size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </nav>
  )
}

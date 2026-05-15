import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminSidebar.module.css'

const NAV = [
  { path: '/admin',             label: 'Dashboard',  icon: '▦' },
  { path: '/admin/orders',      label: 'Orders',     icon: '🛒' },
  { path: '/admin/menu',        label: 'Menu',       icon: '✦' },
  { path: '/admin/inventory',   label: 'Inventory',  icon: '▤' },
  { path: '/admin/analytics',   label: 'Analytics',  icon: '▲' },
  { path: '/admin/predictions', label: 'Predictions',icon: '◈' },
  { path: '/admin/students',    label: 'Users',      icon: '◉' },
  { path: '/admin/settings',    label: 'Settings',   icon: '⚙' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <span>Q</span>
        </div>
        <div>
          <p className={styles.brandName}>QLess</p>
          <p className={styles.brandSub}>CAMPUS MANAGEMENT</p>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(n => (
          <Link key={n.path} to={n.path}
            className={`${styles.item} ${location.pathname === n.path ? styles.active : ''}`}>
            <span className={styles.itemIcon}>{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>

      {/* New Report CTA */}
      <button className={styles.reportBtn}>
        <span>+</span> Create New Report
      </button>

      {/* Bottom */}
      <div className={styles.bottom}>
        <button className={styles.bottomLink}>
          <span>⊙</span> Support
        </button>
        <button className={styles.bottomLink} onClick={() => { logout(); navigate('/') }}>
          <span>↩</span> Logout
        </button>
        <div className={styles.userRow}>
          <div className={styles.userAvatar}>{user?.name?.[0] ?? 'A'}</div>
          <div>
            <p className={styles.userName}>{user?.name ?? 'Campus Admin'}</p>
            <p className={styles.userRole}>SUPER USER</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

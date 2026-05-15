import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LandingNav.module.css'

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>Q</div>
          <span>QLess</span>
        </Link>

        {/* Links */}
        <div className={styles.links}>
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <Link to="/login" className={styles.loginLink}>Login</Link>
          <Link to="/signup" className={styles.ctaBtn}>Get Started</Link>
        </div>
      </div>
    </nav>
  )
}

import { Link } from 'react-router-dom'
import LandingNav from '../components/landing/LandingNav'
import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: '📍', title: 'Real-time Tracking', desc: 'Know exactly where your order is. Track your meal by the minute, from kitchen to your hands.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80' },
  { icon: '🔮', title: 'Demand Prediction', desc: 'Our smart system predicts peak hours to help you plan your order helping you avoid the campus rush.', img: null },
  { icon: '💳', title: 'Spending Insights', desc: 'Know exactly how your food habits, with monthly and weekly spending summaries and personalised tips.', img: null },
  { icon: '🥗', title: 'Nutrition Tracking', desc: 'Confident nutrition tracking to you can make decisions about your meals that meet your fitness goals.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
]

const HOW = [
  { icon: '🍽️', step: 'Browse', desc: 'Explore our curated campus menu, filter by diet, and find exactly what you crave.' },
  { icon: '📲', step: 'Order',  desc: 'Pay instantly with your student digital wallet. A click is all your time.' },
  { icon: '🎯', step: 'Pick up', desc: 'Head to the designated "QLess Zone", skip your order is ready, to pick up.' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>🌿 AI Powered</span>
          <h1 className={styles.heroTitle}>
            Skip the Queue,<br />
            <em>Enjoy the Food</em>
          </h1>
          <p className={styles.heroDesc}>
            QLess transforms your campus food experience with smart demand-forecasting and seamless mobile ordering. Save time, spend it savouring your body and soul.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/signup" className={styles.btnPrimary}>Get Started</Link>
            <a href="#how" className={styles.btnSecondary}>Learn More</a>
          </div>
        </div>
        <div className={styles.heroImages}>
          <div className={styles.imgCard1}>
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" alt="food" />
          </div>
          <div className={styles.imgCard2}>
            <img src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&q=80" alt="campus" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Smart Campus Integration</p>
          <p className={styles.sectionSub}>Leveraging data in more ways than you can even imagine.</p>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                {f.img && <img src={f.img} className={styles.featureImg} alt={f.title} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className={styles.how}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>How It Works</p>
          <div className={styles.howGrid}>
            {HOW.map((h, i) => (
              <div key={i} className={styles.howCard}>
                <div className={styles.howIcon}>{h.icon}</div>
                <h3 className={styles.howStep}>{h.step}</h3>
                <p className={styles.howDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Start ordering smarter today</h2>
          <p className={styles.ctaSub}>Join 40,000 students reclaiming their Lunch break with QLess.</p>
          <Link to="/signup" className={styles.ctaBtn}>Get Started</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p className={styles.footerLogo}>QLess</p>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} QLess. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  )
}

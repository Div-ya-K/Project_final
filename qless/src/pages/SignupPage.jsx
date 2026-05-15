import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/common/Icon'
import styles from './AuthPage.module.css'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    signup(form.name, form.email, form.password, 'student')
    setLoading(false)
    navigate('/student')
  }

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <button onClick={() => navigate('/')} className={styles.back}>
          <Icon name="arrow" size={16} color="var(--text-muted)" />
          Back
        </button>

        <div className={styles.formWrap}>
          <div className={styles.brandTop}>
            <div className={styles.logoIcon}>Q</div>
          </div>
          <h1 className={styles.brand}>QLess</h1>
          <p className={styles.formSub}>Create your student account.</p>

          <form onSubmit={submit} className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>FULL NAME</label>
                <input name="name" placeholder="Divya Sharma" value={form.name} onChange={handle} />
              </div>
              <div className={styles.field}>
                <label>EMAIL ADDRESS</label>
                <input name="email" type="email" placeholder="name@university.edu" value={form.email} onChange={handle} />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>PASSWORD</label>
                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
              </div>
              <div className={styles.field}>
                <label>CONFIRM PASSWORD</label>
                <input name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handle} />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <>Create Account <Icon name="arrow" size={15} color="#fff" /></>}
            </button>
          </form>

          <p className={styles.switchAuth}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <p className={styles.support}>© 2024 QLess. Built for the Digital Greenhouse.</p>
        <div className={styles.supportLinks}>
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Support</a>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.floatCard} style={{ height: 320 }}>
          <img src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&q=80"
            alt="plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  )
}

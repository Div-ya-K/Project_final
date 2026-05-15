import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/common/Icon'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      const role = await login(form.email, form.password)
      if      (role === 'admin')   navigate('/admin')
      else if (role === 'server')  navigate('/server')
      else                         navigate('/student')
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
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
          <h1 className={styles.formTitle}>Welcome back</h1>
          <p className={styles.formSub}>Sign in to your QLess account</p>

          <form onSubmit={submit} className={styles.form}>
            <div className={styles.field}>
              <label>EMAIL ADDRESS</label>
              <input name="email" type="email" placeholder="name@university.edu"
                value={form.email} onChange={handle} />
            </div>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label>PASSWORD</label>
                <a href="#" className={styles.forgot}>Forgot?</a>
              </div>
              <div className={styles.passWrap}>
                <input name="password" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={handle} />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPass(p => !p)}>
                  <Icon name={showPass ? 'eyeoff' : 'eye'} size={16} color="var(--text-faint)" />
                </button>
              </div>
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" /> Keep me signed in
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Sign In'}
            </button>

            <div className={styles.divider}><span>OR CONTINUE WITH</span></div>

            <div className={styles.socialRow}>
              <button type="button" className={styles.socialBtn}>
                <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" />
                Google
              </button>
              <button type="button" className={styles.socialBtn}>🏫 SSO</button>
            </div>
          </form>

          <p className={styles.switchAuth}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        <p className={styles.support}>SUPPORT &amp; TERMS</p>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.floatCard}>
          <img src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80" alt="food" />
          <div className={styles.floatCardBody}>
            <p className={styles.floatCardTitle}>Masala Dosa</p>
            <p className={styles.floatCardSub}>290 cal · ₹60</p>
          </div>
        </div>
      </div>
    </div>
  )
}
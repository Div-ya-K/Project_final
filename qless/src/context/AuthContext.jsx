import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, signupUser } from '../api/server'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // true while we check localStorage

  // ── Re-hydrate from localStorage on first load ──────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('qless_user')
    const token  = localStorage.getItem('qless_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { /* corrupt data */ }
    }
    setLoading(false)
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await loginUser(email, password)   // throws on error
    localStorage.setItem('qless_token', data.token)
    localStorage.setItem('qless_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user.role
  }

  // ── Signup ───────────────────────────────────────────────────────────────────
  const signup = async (name, email, password, role = 'student') => {
    const data = await signupUser(name, email, password, role)
    localStorage.setItem('qless_token', data.token)
    localStorage.setItem('qless_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user.role
  }

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('qless_token')
    localStorage.removeItem('qless_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

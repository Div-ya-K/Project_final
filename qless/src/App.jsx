import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import StudentNav    from './components/student/StudentNav'
import AdminSidebar  from './components/admin/AdminSidebar'

import LandingPage from './pages/LandingPage'
import LoginPage   from './pages/LoginPage'
import SignupPage  from './pages/SignupPage'

import StudentHome     from './pages/student/StudentHome'
import StudentMenu     from './pages/student/StudentMenu'
import StudentCart     from './pages/student/StudentCart'
import StudentOrders   from './pages/student/StudentOrders'
import StudentInsights from './pages/student/StudentInsights'

import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminOrders      from './pages/admin/AdminOrders'
import AdminMenu        from './pages/admin/AdminMenu'
import AdminInventory   from './pages/admin/AdminInventory'
import AdminStudents    from './pages/admin/AdminStudents'
import AdminAnalytics   from './pages/admin/AdminAnalytics'
import AdminPredictions from './pages/admin/AdminPredictions'

import ServerDashboard from './pages/server/ServerDashboard'

const Stub = ({ title }) => (
  <div style={{ padding: 40, background: '#faf8f4', minHeight: '100vh' }}>
    <h2 style={{ fontFamily: "'DM Serif Display',serif", color: '#1a2e1a', fontSize: 28 }}>{title}</h2>
    <p style={{ color: '#9ca3af', marginTop: 8 }}>Coming soon.</p>
  </div>
)

// ── Auth guard ────────────────────────────────────────────────────────────────
function RequireAuth({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    if (user.role === 'admin')   return <Navigate to="/admin"   replace />
    if (user.role === 'server')  return <Navigate to="/server"  replace />
    return <Navigate to="/student" replace />
  }
  return children
}

// ── Layouts ───────────────────────────────────────────────────────────────────
function StudentLayout({ children }) {
  return <><StudentNav /><main>{children}</main></>
}

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

// Server has no sidebar — full screen kitchen view
function ServerLayout({ children }) {
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Student routes */}
      {[
        { path: '/student',          el: <StudentHome /> },
        { path: '/student/menu',     el: <StudentMenu /> },
        { path: '/student/cart',     el: <StudentCart /> },
        { path: '/student/orders',   el: <StudentOrders /> },
        { path: '/student/insights', el: <StudentInsights /> },
      ].map(({ path, el }) => (
        <Route key={path} path={path} element={
          <RequireAuth role="student"><StudentLayout>{el}</StudentLayout></RequireAuth>
        }/>
      ))}

      {/* Admin routes */}
      {[
        { path: '/admin',             el: <AdminDashboard /> },
        { path: '/admin/orders',      el: <AdminOrders /> },
        { path: '/admin/menu',        el: <AdminMenu /> },
        { path: '/admin/students',    el: <AdminStudents /> },
        { path: '/admin/analytics',   el: <AdminAnalytics /> },
        { path: '/admin/predictions', el: <AdminPredictions /> },
        { path: '/admin/inventory',   el: <AdminInventory /> },
        { path: '/admin/settings',    el: <Stub title="Settings" /> },
      ].map(({ path, el }) => (
        <Route key={path} path={path} element={
          <RequireAuth role="admin"><AdminLayout>{el}</AdminLayout></RequireAuth>
        }/>
      ))}

      {/* Server routes — isolated, no sidebar */}
      <Route path="/server" element={
        <RequireAuth role="server"><ServerLayout><ServerDashboard /></ServerLayout></RequireAuth>
      }/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
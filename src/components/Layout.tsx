import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { KSPLogo } from './KSPLogo'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/classes', label: 'Classes', end: false },
  { to: '/techniques', label: 'Techniques', end: false },
  { to: '/gradings', label: 'Gradings', end: false },
]

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the drawer whenever the route changes (e.g. tapping a nav link).
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="drawer-toggle"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button>
            <KSPLogo />
          </div>
          <div className="header-right">
            <span className="muted email">{user?.email}</span>
            <button className="btn small" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </header>
        <nav className="app-nav">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <nav className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <KSPLogo />
              <button
                type="button"
                className="drawer-close"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="drawer-links">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="drawer-footer">
              <span className="muted email">{user?.email}</span>
              <button className="btn small" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

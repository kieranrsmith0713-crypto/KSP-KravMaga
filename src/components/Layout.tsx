import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { KSPLogo } from './KSPLogo'
import { KspLockup } from './KspMark'
import { CalendarIcon, ChevronRightIcon, HomeIcon, LogOutIcon, MenuIcon, TargetIcon, TrophyIcon, XIcon } from './icons'

// Sidebar (desktop, 960px and up) and drawer (mobile) navigation.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, Icon: HomeIcon },
  { to: '/classes', label: 'Classes', end: false, Icon: CalendarIcon },
  { to: '/techniques', label: 'Techniques', end: false, Icon: TargetIcon },
  { to: '/gradings', label: 'Gradings', end: false, Icon: TrophyIcon },
]

// Utility-bar breadcrumb labels — longest matching prefix wins.
const PAGE_LABELS: [string, string][] = [
  ['/', 'Dashboard'],
  ['/classes', 'Classes'],
  ['/techniques', 'Techniques'],
  ['/gradings', 'Gradings'],
]

function pageLabel(pathname: string): string {
  let best = ''
  let label = 'Dashboard'
  for (const [prefix, name] of PAGE_LABELS) {
    const matches = prefix === '/' ? pathname === '/' : pathname === prefix || pathname.startsWith(`${prefix}/`)
    if (matches && prefix.length > best.length) {
      best = prefix
      label = name
    }
  }
  return label
}

/** Today as YYYY-MM-DD in local time. */
function localIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function BrandMark() {
  return (
    <span className="sidebar-brand">
      <KspLockup variant="sidebar" />
    </span>
  )
}

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split('@')[0] ?? ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

  const navLink = ({ to, label, end, Icon }: (typeof NAV_ITEMS)[number]) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
      <Icon width={18} height={18} />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link to="/" className="logo-link" aria-label="Home">
          <BrandMark />
        </Link>

        <nav className="sidebar-nav" aria-label="Krav Maga">
          <span className="sidebar-section-label">TRAINING</span>
          {NAV_ITEMS.map(navLink)}
        </nav>

        <div className="sidebar-account">
          <div className="sidebar-divider" />
          <div className="sidebar-profile">
            <span className="sidebar-avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="sidebar-identity">
              <span className="sidebar-name">{displayName}</span>
              <button type="button" className="sidebar-signout" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
            <button type="button" className="sidebar-signout-icon" aria-label="Sign out" onClick={() => signOut()}>
              <LogOutIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-workspace">
        <div className="app-topbar">
          <header className="app-header">
            <div className="header-left">
              <button
                type="button"
                className="drawer-toggle"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </button>
              <Link to="/" className="logo-link" aria-label="Home">
                <KSPLogo />
              </Link>
            </div>
          </header>
        </div>

        <div className="utility-bar">
          <div className="utility-breadcrumb">
            <span>Krav Maga</span>
            <ChevronRightIcon width={12} height={12} />
            <span className="utility-breadcrumb-current">{pageLabel(location.pathname)}</span>
          </div>
          <div className="utility-meta">
            <span className="utility-email">{user?.email}</span>
            <span className="utility-separator" />
            <span className="utility-date">{localIsoDate()}</span>
          </div>
        </div>

        {drawerOpen && (
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
            <nav className="drawer-panel" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <BrandMark />
                <button
                  type="button"
                  className="drawer-close"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                >
                  <XIcon width={18} height={18} />
                </button>
              </div>

              <div className="drawer-links">
                <span className="sidebar-section-label">TRAINING</span>
                {NAV_ITEMS.map(navLink)}
              </div>

              <div className="drawer-footer">
                <span className="utility-email">{user?.email}</span>
                <button className="btn small btn-icon" onClick={() => signOut()}>
                  <LogOutIcon width={14} height={14} /> Sign out
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

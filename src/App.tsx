import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import { useAppAccess } from './auth/useAppAccess'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Classes } from './pages/Classes'
import { Techniques } from './pages/Techniques'
import { TechniqueDetail } from './pages/TechniqueDetail'
import { Gradings } from './pages/Gradings'
import { ConfirmProvider } from './components/confirm/ConfirmProvider'

// Auth is owned by KSP Hub. Krav Maga never signs anyone in itself — it just
// reads the shared session cookie, and sends you here when there isn't one.
const HUB_LOGIN_URL = 'https://hub.ksponline.co.uk/login?redirect=kravmaga.ksponline.co.uk'

export default function App() {
  const { session, loading } = useAuth()
  const access = useAppAccess(session?.user.id, 'krav-maga')

  useEffect(() => {
    if (!loading && !session) {
      window.location.href = HUB_LOGIN_URL
    }
  }, [loading, session])

  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="center-screen">
        <p className="muted">Redirecting to sign in…</p>
      </div>
    )
  }

  if (access.status === 'checking') {
    return (
      <div className="center-screen">
        <p className="muted">Checking access…</p>
      </div>
    )
  }

  // A failed check isn't a denial — say so, and show what actually went
  // wrong plus which account the session resolved to, since "denied" and
  // "the query broke" otherwise look identical from here.
  if (access.status === 'error') {
    return (
      <div className="center-screen">
        <p className="muted">
          Couldn't check your access to Krav Maga: {access.message}
          <br />
          Signed in as {session.user.email ?? 'unknown'}.{' '}
          <a href="https://hub.ksponline.co.uk/dashboard">Go back to the Hub</a>.
        </p>
      </div>
    )
  }

  if (access.status === 'denied') {
    return (
      <div className="center-screen">
        <p className="muted">
          You don't have access to Krav Maga. Ask your admin to grant it from the Hub, or{' '}
          <a href="https://hub.ksponline.co.uk/dashboard">go back to the Hub</a>.
          <br />
          Signed in as {session.user.email ?? 'unknown'}.
        </p>
      </div>
    )
  }

  return (
    <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/techniques/:id" element={<TechniqueDetail />} />
            <Route path="/gradings" element={<Gradings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  )
}

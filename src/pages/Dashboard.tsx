import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchClasses } from '../lib/classes'
import { fetchGradings, currentLevel, nextGrading } from '../lib/gradings'
import { fetchTechniques } from '../lib/techniques'
import { daysUntil, formatDate, formatMinutes, todayIso } from '../lib/date'
import type { Grading, KravClass, Technique } from '../types/database'

export function Dashboard() {
  const [classes, setClasses] = useState<KravClass[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [gradings, setGradings] = useState<Grading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchClasses(), fetchTechniques(), fetchGradings()]).then(([c, t, g]) => {
      setError(c.error ?? t.error ?? g.error)
      setClasses(c.data)
      setTechniques(t.data)
      setGradings(g.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="muted">Loading…</p>

  const monthPrefix = todayIso().slice(0, 7)
  const classesThisMonth = classes.filter((c) => c.class_date.startsWith(monthPrefix)).length
  const totalMinutes = classes.reduce((sum, c) => sum + c.duration_minutes, 0)
  const level = currentLevel(gradings)
  const upcoming = nextGrading(gradings)
  const confident = techniques.filter((t) => t.proficiency >= 4).length

  return (
    <section className="stack">
      <h1 className="greeting">Krav Maga</h1>
      {error && <p className="alert error">{error}</p>}

      <div className="stat-tiles">
        <div className="stat-tile">
          <p className="stat-value">{classesThisMonth}</p>
          <span className="stat-label muted">Classes this month</span>
        </div>
        <div className="stat-tile">
          <p className="stat-value">{formatMinutes(totalMinutes)}</p>
          <span className="stat-label muted">Total mat time</span>
        </div>
        <div className="stat-tile">
          <p className="stat-value">{level?.level ?? '—'}</p>
          <span className="stat-label muted">Current level</span>
        </div>
      </div>

      <div className="card">
        <h2>Next grading</h2>
        {upcoming ? (
          <p className="next-grading">
            <strong>{upcoming.level}</strong> on {formatDate(upcoming.grading_date)}
            <span className="badge">{countdown(daysUntil(upcoming.grading_date))}</span>
          </p>
        ) : (
          <p className="muted">
            Nothing booked. <Link to="/gradings">Add a grading date</Link>.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Techniques</h2>
        {techniques.length === 0 ? (
          <p className="muted">
            No techniques yet. <Link to="/techniques">Start your syllabus</Link>.
          </p>
        ) : (
          <>
            <p className="muted">
              Confident with {confident} of {techniques.length}
            </p>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(confident / techniques.length) * 100}%`,
                  background: 'var(--primary)',
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Recent classes</h2>
        {classes.length === 0 ? (
          <p className="muted">
            No classes logged yet. <Link to="/classes">Log your first class</Link>.
          </p>
        ) : (
          <ul className="item-list">
            {classes.slice(0, 5).map((c) => (
              <li key={c.id} className="item-row">
                <div className="item-main">
                  <span className="item-title">{c.class_type}</span>
                  <span className="item-meta muted">{formatDate(c.class_date)}</span>
                </div>
                <span className="item-value">{formatMinutes(c.duration_minutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function countdown(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

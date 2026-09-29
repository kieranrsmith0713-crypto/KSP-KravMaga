import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { useConfirm } from '../components/confirm/useConfirm'
import { createGrading, deleteGrading, fetchGradings, updateGrading } from '../lib/gradings'
import { formatDate } from '../lib/date'
import type { Grading } from '../types/database'

type Result = 'upcoming' | 'passed' | 'failed'

function toResult(passed: boolean | null): Result {
  if (passed === null) return 'upcoming'
  return passed ? 'passed' : 'failed'
}

function fromResult(result: Result): boolean | null {
  if (result === 'upcoming') return null
  return result === 'passed'
}

export function Gradings() {
  const { user } = useAuth()
  const confirmDialog = useConfirm()

  const [gradings, setGradings] = useState<Grading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState('')
  const [level, setLevel] = useState('')
  const [result, setResult] = useState<Result>('upcoming')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchGradings()
    if (error) setError(error)
    else setGradings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!user || !date || !level.trim()) return

    setSaving(true)
    setError(null)
    const { error } = await createGrading({
      user_id: user.id,
      grading_date: date,
      level: level.trim(),
      passed: fromResult(result),
    })
    setSaving(false)

    if (error) {
      setError(error)
      return
    }
    setDate('')
    setLevel('')
    setResult('upcoming')
    load()
  }

  async function handleResult(grading: Grading, next: Result) {
    setError(null)
    const { error } = await updateGrading(grading.id, { passed: fromResult(next) })
    if (error) {
      setError(error)
      return
    }
    load()
  }

  async function handleDelete(grading: Grading) {
    if (!(await confirmDialog(`Delete the ${grading.level} grading?`, { danger: true }))) return

    setError(null)
    const { error } = await deleteGrading(grading.id)
    if (error) {
      setError(error)
      return
    }
    load()
  }

  return (
    <section className="stack">
      <h1 className="greeting">Gradings</h1>
      {error && <p className="alert error">{error}</p>}

      <form className="card stack-sm" onSubmit={handleAdd}>
        <h2>Add a grading</h2>
        <div className="form-grid">
          <label className="field">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field">
            Level
            <input
              type="text"
              placeholder="e.g. P2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            />
          </label>
          <label className="field">
            Result
            <select value={result} onChange={(e) => setResult(e.target.value as Result)}>
              <option value="upcoming">Upcoming</option>
              <option value="passed">Passed</option>
              <option value="failed">Not passed</option>
            </select>
          </label>
        </div>
        <button type="submit" className="btn primary" disabled={saving || !date || !level.trim()}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : gradings.length === 0 ? (
          <p className="muted">No gradings yet.</p>
        ) : (
          <ul className="item-list">
            {gradings.map((g) => (
              <li key={g.id} className="item-row">
                <div className="item-main">
                  <span className="item-title">
                    {g.level}
                    {g.passed === true && <span className="badge success">Passed</span>}
                    {g.passed === null && <span className="badge">Upcoming</span>}
                  </span>
                  <span className="item-meta muted">{formatDate(g.grading_date)}</span>
                </div>
                <div className="row technique-actions">
                  <select
                    aria-label={`Result for ${g.level}`}
                    value={toResult(g.passed)}
                    onChange={(e) => handleResult(g, e.target.value as Result)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Not passed</option>
                  </select>
                  <button type="button" className="btn small danger" onClick={() => handleDelete(g)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

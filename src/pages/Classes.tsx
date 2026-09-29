import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { useConfirm } from '../components/confirm/useConfirm'
import { CLASS_TYPES, createClass, deleteClass, fetchClasses } from '../lib/classes'
import { formatDate, formatMinutes, todayIso } from '../lib/date'
import type { KravClass } from '../types/database'

export function Classes() {
  const { user } = useAuth()
  const confirmDialog = useConfirm()

  const [classes, setClasses] = useState<KravClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(todayIso())
  const [duration, setDuration] = useState('60')
  const [classType, setClassType] = useState(CLASS_TYPES[0])
  const [intensity, setIntensity] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchClasses()
    if (error) setError(error)
    else setClasses(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    const minutes = Number(duration)
    if (!user || !date || !(minutes > 0)) return

    setSaving(true)
    setError(null)
    const { error } = await createClass({
      user_id: user.id,
      class_date: date,
      duration_minutes: minutes,
      class_type: classType,
      intensity: intensity ? Number(intensity) : null,
      notes: notes.trim(),
    })
    setSaving(false)

    if (error) {
      setError(error)
      return
    }
    setNotes('')
    setIntensity('')
    load()
  }

  async function handleDelete(c: KravClass) {
    if (!(await confirmDialog(`Delete the class on ${formatDate(c.class_date)}?`, { danger: true }))) {
      return
    }

    setError(null)
    const { error } = await deleteClass(c.id)
    if (error) {
      setError(error)
      return
    }
    load()
  }

  return (
    <section className="stack">
      <h1 className="greeting">Classes</h1>
      {error && <p className="alert error">{error}</p>}

      <form className="card stack-sm" onSubmit={handleAdd}>
        <h2>Log a class</h2>
        <div className="form-grid">
          <label className="field">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field">
            Minutes
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </label>
          <label className="field">
            Type
            <select value={classType} onChange={(e) => setClassType(e.target.value)}>
              {CLASS_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Intensity
            <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          Notes
          <textarea
            rows={3}
            placeholder="What did you cover? Anything to work on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving…' : 'Log class'}
        </button>
      </form>

      <div className="card">
        <h2>History</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : classes.length === 0 ? (
          <p className="muted">No classes logged yet.</p>
        ) : (
          <ul className="item-list">
            {classes.map((c) => (
              <li key={c.id} className="item-row">
                <div className="item-main">
                  <span className="item-title">
                    {c.class_type}
                    {c.intensity && <span className="badge">Intensity {c.intensity}/5</span>}
                  </span>
                  <span className="item-meta muted">
                    {formatDate(c.class_date)} · {formatMinutes(c.duration_minutes)}
                  </span>
                  {c.notes && <span className="item-notes">{c.notes}</span>}
                </div>
                <button type="button" className="btn small danger" onClick={() => handleDelete(c)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

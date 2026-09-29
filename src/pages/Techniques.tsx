import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { useConfirm } from '../components/confirm/useConfirm'
import {
  PROFICIENCY_LABELS,
  TECHNIQUE_CATEGORIES,
  createTechnique,
  deleteTechnique,
  fetchTechniques,
  updateTechnique,
} from '../lib/techniques'
import type { Technique } from '../types/database'

const ALL = 'All'

export function Techniques() {
  const { user } = useAuth()
  const confirmDialog = useConfirm()

  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState(ALL)

  const [name, setName] = useState('')
  const [category, setCategory] = useState(TECHNIQUE_CATEGORIES[0])
  const [level, setLevel] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchTechniques()
    if (error) setError(error)
    else setTechniques(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!user || !name.trim()) return

    setSaving(true)
    setError(null)
    const { error } = await createTechnique({
      user_id: user.id,
      name: name.trim(),
      category,
      level: level.trim(),
    })
    setSaving(false)

    if (error) {
      setError(error)
      return
    }
    setName('')
    load()
  }

  async function handleProficiency(technique: Technique, proficiency: number) {
    // Optimistic — the select should reflect the change immediately.
    setTechniques((prev) => prev.map((t) => (t.id === technique.id ? { ...t, proficiency } : t)))
    const { error } = await updateTechnique(technique.id, { proficiency })
    if (error) {
      setError(error)
      load()
    }
  }

  async function handleDelete(technique: Technique) {
    if (!(await confirmDialog(`Delete "${technique.name}"?`, { danger: true }))) return

    setError(null)
    const { error } = await deleteTechnique(technique.id)
    if (error) {
      setError(error)
      return
    }
    load()
  }

  const visible = filter === ALL ? techniques : techniques.filter((t) => t.category === filter)

  return (
    <section className="stack">
      <h1 className="greeting">Techniques</h1>
      {error && <p className="alert error">{error}</p>}

      <form className="card stack-sm" onSubmit={handleAdd}>
        <h2>Add a technique</h2>
        <input
          type="text"
          placeholder="e.g. 360° defence, choke from front…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="form-grid">
          <label className="field">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {TECHNIQUE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Level
            <input
              type="text"
              placeholder="e.g. P1"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className="btn primary" disabled={saving || !name.trim()}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="pill-row">
        {[ALL, ...TECHNIQUE_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            className={`pill${filter === c ? ' active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="muted">No techniques here yet.</p>
        ) : (
          <ul className="item-list">
            {visible.map((t) => (
              <li key={t.id} className="item-row">
                <div className="item-main">
                  <span className="item-title">
                    {t.name}
                    {t.level && <span className="badge">{t.level}</span>}
                  </span>
                  <span className="item-meta muted">{t.category}</span>
                </div>
                <div className="row technique-actions">
                  <select
                    aria-label={`Proficiency for ${t.name}`}
                    value={t.proficiency}
                    onChange={(e) => handleProficiency(t, Number(e.target.value))}
                  >
                    {Object.entries(PROFICIENCY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn small danger" onClick={() => handleDelete(t)}>
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

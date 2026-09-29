import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { PROFICIENCY_LABELS, allCategories, createTechnique, fetchTechniques } from '../lib/techniques'
import type { Technique } from '../types/database'

const ALL = 'All'

export function Techniques() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState(ALL)
  const [search, setSearch] = useState('')

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
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
    const { data, error } = await createTechnique({
      user_id: user.id,
      name: name.trim(),
      category: category.trim() || 'Other',
      level: level.trim(),
    })
    setSaving(false)

    if (error || !data) {
      setError(error)
      return
    }
    // Straight to the new technique, ready to write out the steps.
    navigate(`/techniques/${data.id}?edit=1`)
  }

  const categories = allCategories(techniques)
  const usedCategories = categories.filter((c) => techniques.some((t) => t.category === c))
  const query = search.trim().toLowerCase()

  const visible = techniques.filter(
    (t) =>
      (filter === ALL || t.category === filter) &&
      (!query ||
        t.name.toLowerCase().includes(query) ||
        t.notes.toLowerCase().includes(query) ||
        t.steps.some((s) => s.text.toLowerCase().includes(query))),
  )

  // Group the visible techniques under their category headings.
  const groups = usedCategories
    .map((c) => ({ category: c, items: visible.filter((t) => t.category === c) }))
    .filter((g) => g.items.length > 0)

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="greeting">Techniques</h1>
        {!adding && (
          <button type="button" className="btn small primary" onClick={() => setAdding(true)}>
            Add technique
          </button>
        )}
      </div>
      {error && <p className="alert error">{error}</p>}

      {adding && (
        <form className="card stack-sm" onSubmit={handleAdd}>
          <h2>What did you learn?</h2>
          <label className="field">
            Name
            <input
              type="text"
              placeholder="e.g. 360° defence, choke from front…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <div className="form-grid">
            <label className="field">
              Category
              <input
                type="text"
                list="technique-categories"
                placeholder="Pick or type your own"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="technique-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="field">
              Level
              <input type="text" placeholder="e.g. P1" value={level} onChange={(e) => setLevel(e.target.value)} />
            </label>
          </div>
          <p className="muted hint">You'll add the step-by-step details next.</p>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving || !name.trim()}>
              {saving ? 'Adding…' : 'Add and write steps'}
            </button>
          </div>
        </form>
      )}

      {techniques.length > 0 && (
        <>
          <input type="search" placeholder="Search techniques and steps…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="pill-row">
            {[ALL, ...usedCategories].map((c) => (
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
        </>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : techniques.length === 0 ? (
        <div className="card">
          <p className="muted">
            Nothing here yet. Add a technique you've learnt and break it down step by step so you can revise it later.
          </p>
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <p className="muted">No techniques match.</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.category} className="card">
            <h2>{group.category}</h2>
            <ul className="item-list">
              {group.items.map((t) => (
                <li key={t.id}>
                  <Link to={`/techniques/${t.id}`} className="item-row technique-link">
                    <div className="item-main">
                      <span className="item-title">
                        {t.name}
                        {t.level && <span className="badge">{t.level}</span>}
                      </span>
                      <span className="item-meta muted">
                        {t.steps.length === 0
                          ? 'No steps yet'
                          : `${t.steps.length} ${t.steps.length === 1 ? 'step' : 'steps'}`}{' '}
                        · {PROFICIENCY_LABELS[t.proficiency]}
                      </span>
                    </div>
                    <span className="chevron" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useConfirm } from '../components/confirm/useConfirm'
import {
  PROFICIENCY_LABELS,
  allCategories,
  deleteTechnique,
  fetchTechnique,
  fetchTechniques,
  updateTechnique,
} from '../lib/techniques'
import { formatDate } from '../lib/date'
import type { Technique, TechniqueStep } from '../types/database'

/** A step while editing — `key` keeps React rows stable as steps move around. */
interface DraftStep extends TechniqueStep {
  key: number
}

interface Draft {
  name: string
  category: string
  level: string
  learnedOn: string
  notes: string
  steps: DraftStep[]
}

let nextKey = 1
const blankStep = (): DraftStep => ({ key: nextKey++, text: '', tip: '' })

function toDraft(t: Technique): Draft {
  return {
    name: t.name,
    category: t.category,
    level: t.level,
    learnedOn: t.learned_on ?? '',
    notes: t.notes,
    steps: t.steps.length ? t.steps.map((s) => ({ key: nextKey++, text: s.text, tip: s.tip ?? '' })) : [blankStep()],
  }
}

export function TechniqueDetail() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const confirmDialog = useConfirm()

  const [technique, setTechnique] = useState<Technique | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  // Focus the newest step's textarea after "Add step".
  const focusKey = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchTechnique(id), fetchTechniques()]).then(([one, all]) => {
      if (!active) return
      setError(one.error ?? all.error)
      setTechnique(one.data)
      setCategories(allCategories(all.data))
      if (one.data && searchParams.get('edit')) setDraft(toDraft(one.data))
      setLoading(false)
    })
    return () => {
      active = false
    }
    // Only on first load for this id — `?edit` is read once, then cleared below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (searchParams.get('edit')) setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  function startEditing() {
    if (technique) setDraft(toDraft(technique))
  }

  function updateDraft(changes: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...changes } : d))
  }

  function updateStep(key: number, changes: Partial<TechniqueStep>) {
    setDraft((d) => (d ? { ...d, steps: d.steps.map((s) => (s.key === key ? { ...s, ...changes } : s)) } : d))
  }

  function moveStep(index: number, delta: -1 | 1) {
    setDraft((d) => {
      if (!d) return d
      const steps = [...d.steps]
      const target = index + delta
      if (target < 0 || target >= steps.length) return d
      ;[steps[index], steps[target]] = [steps[target], steps[index]]
      return { ...d, steps }
    })
  }

  function removeStep(key: number) {
    setDraft((d) => (d ? { ...d, steps: d.steps.filter((s) => s.key !== key) } : d))
  }

  function addStep() {
    const step = blankStep()
    focusKey.current = step.key
    setDraft((d) => (d ? { ...d, steps: [...d.steps, step] } : d))
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!technique || !draft || !draft.name.trim()) return

    const changes = {
      name: draft.name.trim(),
      category: draft.category.trim() || 'Other',
      level: draft.level.trim(),
      learned_on: draft.learnedOn || null,
      notes: draft.notes.trim(),
      // Blank steps are just unused rows in the editor — don't store them.
      steps: draft.steps
        .filter((s) => s.text.trim())
        .map((s) => ({ text: s.text.trim(), tip: s.tip.trim() })),
    }

    setSaving(true)
    setError(null)
    const { error } = await updateTechnique(technique.id, changes)
    setSaving(false)

    if (error) {
      setError(error)
      return
    }
    setTechnique({ ...technique, ...changes })
    setDraft(null)
  }

  async function handleProficiency(proficiency: number) {
    if (!technique) return
    const previous = technique
    setTechnique({ ...technique, proficiency })
    const { error } = await updateTechnique(technique.id, { proficiency })
    if (error) {
      setError(error)
      setTechnique(previous)
    }
  }

  async function handleDelete() {
    if (!technique) return
    if (!(await confirmDialog(`Delete "${technique.name}" and all its steps?`, { danger: true }))) return

    const { error } = await deleteTechnique(technique.id)
    if (error) {
      setError(error)
      return
    }
    navigate('/techniques')
  }

  if (loading) return <p className="muted">Loading…</p>

  if (!technique) {
    return (
      <section className="stack">
        {error && <p className="alert error">{error}</p>}
        <div className="card">
          <p className="muted">
            Technique not found. <Link to="/techniques">Back to techniques</Link>
          </p>
        </div>
      </section>
    )
  }

  /* ---------------- Edit mode ---------------- */
  if (draft) {
    return (
      <form className="stack" onSubmit={handleSave}>
        <Link to="/techniques" className="back-link">
          ‹ Techniques
        </Link>
        {error && <p className="alert error">{error}</p>}

        <div className="card stack-sm">
          <label className="field">
            Name
            <input type="text" value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })} required />
          </label>
          <div className="form-grid">
            <label className="field">
              Category
              <input
                type="text"
                list="detail-categories"
                value={draft.category}
                onChange={(e) => updateDraft({ category: e.target.value })}
              />
              <datalist id="detail-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="field">
              Level
              <input type="text" placeholder="e.g. P1" value={draft.level} onChange={(e) => updateDraft({ level: e.target.value })} />
            </label>
            <label className="field">
              Learnt on
              <input type="date" value={draft.learnedOn} onChange={(e) => updateDraft({ learnedOn: e.target.value })} />
            </label>
          </div>
        </div>

        <div className="card stack-sm">
          <h2>Steps</h2>
          <ol className="step-editor">
            {draft.steps.map((step, index) => (
              <li key={step.key} className="step-edit">
                <div className="step-edit-header">
                  <span className="step-number">{index + 1}</span>
                  <div className="step-edit-tools">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Move step up"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Move step down"
                      disabled={index === draft.steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" className="icon-btn" aria-label="Remove step" onClick={() => removeStep(step.key)}>
                      ✕
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="What happens in this step?"
                  value={step.text}
                  onChange={(e) => updateStep(step.key, { text: e.target.value })}
                  ref={(el) => {
                    if (el && focusKey.current === step.key) {
                      el.focus()
                      focusKey.current = null
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Key point (optional)"
                  value={step.tip}
                  onChange={(e) => updateStep(step.key, { tip: e.target.value })}
                />
              </li>
            ))}
          </ol>
          <button type="button" className="btn add-toggle" onClick={addStep}>
            + Add step
          </button>
        </div>

        <div className="card stack-sm">
          <label className="field">
            Notes
            <textarea
              rows={4}
              placeholder="Common mistakes, what the instructor stressed, variations…"
              value={draft.notes}
              onChange={(e) => updateDraft({ notes: e.target.value })}
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn danger" onClick={handleDelete}>
            Delete
          </button>
          <span className="spacer" />
          <button type="button" className="btn" onClick={() => setDraft(null)}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    )
  }

  /* ---------------- View mode ---------------- */
  return (
    <section className="stack">
      <Link to="/techniques" className="back-link">
        ‹ Techniques
      </Link>
      {error && <p className="alert error">{error}</p>}

      <div className="page-header">
        <div>
          <h1 className="greeting">{technique.name}</h1>
          <p className="muted technique-meta">
            {technique.category}
            {technique.level && ` · ${technique.level}`}
            {technique.learned_on && ` · Learnt ${formatDate(technique.learned_on)}`}
          </p>
        </div>
        <button type="button" className="btn small" onClick={startEditing}>
          Edit
        </button>
      </div>

      <label className="field proficiency-field">
        How well do you know it?
        <select value={technique.proficiency} onChange={(e) => handleProficiency(Number(e.target.value))}>
          {Object.entries(PROFICIENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="card">
        <h2>Steps</h2>
        {technique.steps.length === 0 ? (
          <p className="muted">
            No steps yet.{' '}
            <button type="button" className="btn link" onClick={startEditing}>
              Break it down
            </button>
          </p>
        ) : (
          <ol className="step-list">
            {technique.steps.map((step, index) => (
              <li key={index} className="step">
                <span className="step-number">{index + 1}</span>
                <div className="step-body">
                  <p className="step-text">{step.text}</p>
                  {step.tip && <p className="step-tip">{step.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {technique.notes && (
        <div className="card">
          <h2>Notes</h2>
          <p className="notes-text">{technique.notes}</p>
        </div>
      )}
    </section>
  )
}

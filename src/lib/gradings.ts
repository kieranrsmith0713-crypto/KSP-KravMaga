import { supabase } from './supabase'
import type { Grading, GradingInsert, GradingUpdate } from '../types/database'
import { todayIso } from './date'

export async function fetchGradings(): Promise<{ data: Grading[]; error: string | null }> {
  const { data, error } = await supabase
    .from('krav_gradings')
    .select('*')
    .order('grading_date', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function createGrading(
  input: GradingInsert,
): Promise<{ data: Grading | null; error: string | null }> {
  const { data, error } = await supabase.from('krav_gradings').insert(input).select('*').single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function updateGrading(
  id: string,
  changes: GradingUpdate,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('krav_gradings').update(changes).eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteGrading(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('krav_gradings').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** The most recent grading you passed — i.e. your current level. */
export function currentLevel(gradings: Grading[]): Grading | null {
  return (
    [...gradings]
      .filter((g) => g.passed === true)
      .sort((a, b) => b.grading_date.localeCompare(a.grading_date))[0] ?? null
  )
}

/** The soonest grading that's today or later and hasn't been taken yet. */
export function nextGrading(gradings: Grading[]): Grading | null {
  const today = todayIso()
  return (
    [...gradings]
      .filter((g) => g.passed === null && g.grading_date >= today)
      .sort((a, b) => a.grading_date.localeCompare(b.grading_date))[0] ?? null
  )
}

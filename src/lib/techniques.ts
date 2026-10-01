import { supabase } from './supabase'
import type { Technique, TechniqueInsert, TechniqueUpdate } from '../types/database'

/**
 * Suggested categories. Category is free text, so you can type your own —
 * anything you've used shows up alongside these (see `allCategories`).
 */
export const TECHNIQUE_CATEGORIES = [
  'Strikes',
  'Kicks',
  'Defences',
  'Releases',
  'Chokes',
  'Groundwork',
  'Weapons',
  'Other',
]

export const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Introduced',
  2: 'Learning',
  3: 'Comfortable',
  4: 'Confident',
  5: 'Second nature',
}

export async function fetchTechniques(): Promise<{ data: Technique[]; error: string | null }> {
  const { data, error } = await supabase
    .from('krav_techniques')
    .select('*')
    .order('category')
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function fetchTechnique(id: string): Promise<{ data: Technique | null; error: string | null }> {
  const { data, error } = await supabase.from('krav_techniques').select('*').eq('id', id).maybeSingle()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createTechnique(
  input: TechniqueInsert,
): Promise<{ data: Technique | null; error: string | null }> {
  const { data, error } = await supabase.from('krav_techniques').insert(input).select('*').single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function updateTechnique(
  id: string,
  changes: TechniqueUpdate,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('krav_techniques')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteTechnique(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('krav_techniques').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** The suggested categories plus any custom ones already in use, A–Z with "Other" last. */
export function allCategories(techniques: Technique[]): string[] {
  const set = new Set([...TECHNIQUE_CATEGORIES, ...techniques.map((t) => t.category).filter(Boolean)])
  return [...set].sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)))
}

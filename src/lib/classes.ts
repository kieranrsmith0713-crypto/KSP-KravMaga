import { supabase } from './supabase'
import type { KravClass, KravClassInsert } from '../types/database'

export const CLASS_TYPES = ['Regular', 'Sparring', 'Fitness', 'Seminar', 'Private', 'Grading prep']

export async function fetchClasses(): Promise<{ data: KravClass[]; error: string | null }> {
  const { data, error } = await supabase
    .from('krav_classes')
    .select('*')
    .order('class_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function createClass(
  input: KravClassInsert,
): Promise<{ data: KravClass | null; error: string | null }> {
  const { data, error } = await supabase.from('krav_classes').insert(input).select('*').single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function deleteClass(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('krav_classes').delete().eq('id', id)
  return { error: error?.message ?? null }
}

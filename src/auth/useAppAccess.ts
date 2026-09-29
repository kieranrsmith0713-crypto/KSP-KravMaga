import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Access is granted per-app from KSP Hub's admin panel (user_app_access
 * table, shared Supabase project, RLS-scoped to "own rows").
 *
 * A failed query is deliberately NOT folded into "denied": they have very
 * different causes (an expired token or a network blip vs. genuinely having
 * no grant) and showing the same "you don't have access" screen for both
 * makes the difference impossible to diagnose from the UI.
 */
export type AppAccessState =
  | { status: 'checking' }
  | { status: 'granted' }
  | { status: 'denied' }
  | { status: 'error'; message: string }

export function useAppAccess(userId: string | undefined, appId: string): AppAccessState {
  const [state, setState] = useState<AppAccessState>({ status: 'checking' })

  useEffect(() => {
    if (!userId) {
      setState({ status: 'checking' })
      return
    }
    let active = true
    supabase
      .from('user_app_access')
      .select('app_id')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setState({ status: 'error', message: `${error.message} (code ${error.code ?? 'none'})` })
          return
        }
        setState({ status: data ? 'granted' : 'denied' })
      })
    return () => {
      active = false
    }
  }, [userId, appId])

  return state
}

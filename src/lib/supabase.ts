import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — these must point at the same Supabase project as KSP Hub.',
  )
}

// In production this app lives on a ksponline.co.uk subdomain and shares its
// session with Hub via a cookie scoped to the whole domain. Locally (or on a
// Vercel preview URL) that domain doesn't apply to the current host, so the
// cookie just falls back to scoping itself to whatever host is actually
// running — sign-in there still has to come from Hub, since Behaviour has no
// login screen of its own.
const isKspDomain =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.ksponline.co.uk')

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  cookieOptions: isKspDomain
    ? { domain: '.ksponline.co.uk', path: '/', sameSite: 'lax', secure: true }
    : { path: '/', sameSite: 'lax' },
})

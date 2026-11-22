import { supabase } from './supabase'

export type ThemeMode = 'auto' | 'light' | 'dark'

const STORAGE_KEY = 'ksp-appearance'
const THEME_COLOURS = { light: '#f4f1ea', dark: '#1b1a17' } as const

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark'
}

/** Last mode used on this device — read before React mounts to avoid a flash. */
export function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

/** 'auto' follows the device; 'light'/'dark' force it (same as the Hub's applyTheme). */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  if (mode === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)

  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Storage blocked — the theme still applies for this visit.
  }

  const resolved =
    mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode
  // index.html has a light and a dark theme-color tag (they follow the device).
  // Once a mode is forced, point both at the colour actually shown.
  for (const tag of document.querySelectorAll('meta[name="theme-color"]')) {
    tag.setAttribute('content', THEME_COLOURS[resolved])
    if (mode !== 'auto') tag.removeAttribute('media')
  }
}

/**
 * Appearance is chosen in the Hub (Settings) and saved as the
 * `global.appearance` user setting. Each KSP app lives on its own subdomain,
 * so device storage isn't shared — this pulls the saved choice for the
 * signed-in user and applies it.
 */
export async function syncThemeFromAccount(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('scope', 'global')
    .eq('key', 'appearance')
    .maybeSingle()
  if (!error && isThemeMode(data?.value)) applyTheme(data.value)
}

// The app's logo from the KSP design canvas ("Logos" page): a rounded tile
// with a two-colour line glyph (orange marks what the app is for), and the
// "KSP {name}" lockup with its mono descriptor. Styles in styles/ksp-mark.css.

export const APP_NAME = "Krav Maga"
export const APP_DESCRIPTOR = "Krav Maga / Training"

function Glyph() {
  return (
    <>
      <path d="M24 7l14 5v10c0 9-6 15.5-14 19-8-3.5-14-10-14-19V12z" stroke="#F3F1EC" /><path d="M26 14l-6 11h8l-6 11" stroke="#FF6B35" />
    </>
  )
}

/** The logo tile on its own. Stroke weight follows the board: heavier when small. */
export function AppTile({ size = 40, className }: { size?: number; className?: string }) {
  const stroke = size >= 72 ? 3 : size >= 26 ? 3.4 : 4
  const glyphSize = Math.round(size * 0.62)
  return (
    <span
      className={`ksp-tile ${className ?? ''}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.24) }}
      aria-hidden="true"
    >
      <svg
        width={glyphSize}
        height={glyphSize}
        viewBox="0 0 48 48"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph />
      </svg>
    </span>
  )
}

const TILE = { sidebar: 34, compact: 30, full: 72 } as const

/** Tile + "KSP {name}" + descriptor. sidebar: desktop nav; compact: phone header; full: sign-in screens. */
export function KspLockup({
  variant = 'sidebar',
  showDescriptor = true,
  className,
}: {
  variant?: 'sidebar' | 'compact' | 'full'
  showDescriptor?: boolean
  className?: string
}) {
  return (
    <span className={`ksp-lockup ksp-lockup-${variant} ${className ?? ''}`} aria-label={`KSP ${APP_NAME}`.trim()}>
      <AppTile size={TILE[variant]} />
      <span className="ksp-lockup-text">
        <span className="ksp-lockup-name">
          <span className="ksp-lockup-ksp">KSP</span>
          {APP_NAME && <span className="ksp-lockup-app">{APP_NAME}</span>}
        </span>
        {showDescriptor && <span className="ksp-lockup-desc">{APP_DESCRIPTOR}</span>}
      </span>
    </span>
  )
}

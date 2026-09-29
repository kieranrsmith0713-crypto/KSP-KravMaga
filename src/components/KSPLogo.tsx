interface KSPLogoProps {
  className?: string
}

/**
 * Krav Maga has no designed raster lockup yet, so it only ever renders the
 * themable compact HTML+CSS variant.
 */
export function KSPLogo({ className }: KSPLogoProps) {
  const rootClass = ['ksp-logo', 'ksp-logo-compact', className].filter(Boolean).join(' ')

  return (
    <span className={rootClass}>
      <span className="ksp-logo-mark">KSP</span>
      <span className="ksp-logo-tagline">Krav Maga</span>
    </span>
  )
}

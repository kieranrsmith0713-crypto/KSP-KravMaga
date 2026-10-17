import { KspLockup } from './KspMark'

interface KSPLogoProps {
  variant?: 'compact' | 'full'
  className?: string
}

/** The app's logo lockup (tile + "KSP name" + descriptor) — see KspMark.tsx. */
export function KSPLogo({ variant = 'compact', className }: KSPLogoProps) {
  return <KspLockup variant={variant} className={className} />
}

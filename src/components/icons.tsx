// Same stroke style as the other KSP apps' icons.tsx: 20x20 viewBox,
// currentColor stroke, no fill.
interface IconProps {
  className?: string
  width?: number
  height?: number
}

const base = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function HomeIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="M3.5 9 10 3.5 16.5 9v7.5a1 1 0 0 1-1 1h-3v-5h-5v5h-3a1 1 0 0 1-1-1V9Z" />
    </svg>
  )
}

export function CalendarIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" />
    </svg>
  )
}

export function TargetIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="10" cy="10" r=".5" />
    </svg>
  )
}

export function TrophyIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="M6 3.5h8v4a4 4 0 0 1-8 0v-4Z" />
      <path d="M6 4.5H3.5a1 1 0 0 0-1 1.2c.35 1.7 1.5 2.8 3.5 3M14 4.5h2.5a1 1 0 0 1 1 1.2c-.35 1.7-1.5 2.8-3.5 3" />
      <path d="M10 11.5V14M7.5 16.5h5" />
    </svg>
  )
}

export function MenuIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  )
}

export function XIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  )
}

export function ChevronRightIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="m8 5 5 5-5 5" />
    </svg>
  )
}

export function LogOutIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg {...base} className={className} width={width} height={height} aria-hidden="true">
      <path d="M7.5 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3h3" />
      <path d="m13 14 4-4-4-4M17 10H7.5" />
    </svg>
  )
}

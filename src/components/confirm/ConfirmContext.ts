import { createContext } from 'react'

export interface ConfirmOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>

export const ConfirmContext = createContext<ConfirmFn | undefined>(undefined)

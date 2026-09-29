import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfirmContext } from './ConfirmContext'
import type { ConfirmOptions } from './ConfirmContext'

interface PendingConfirm {
  message: string
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setPending({ message, options, resolve })
    })
  }, [])

  function handleClose(result: boolean) {
    pending?.resolve(result)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="confirm-backdrop" onClick={() => handleClose(false)}>
          <div className="card confirm-dialog" onClick={(e) => e.stopPropagation()}>
            {pending.options.title && <h2>{pending.options.title}</h2>}
            <p>{pending.message}</p>
            <div className="row confirm-actions">
              <button type="button" className="btn small" onClick={() => handleClose(false)}>
                {pending.options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                className={pending.options.danger ? 'btn small danger' : 'btn small primary'}
                onClick={() => handleClose(true)}
              >
                {pending.options.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

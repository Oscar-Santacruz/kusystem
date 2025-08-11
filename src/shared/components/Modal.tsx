import { useEffect, useRef, useId, type JSX, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onEsc)
      document.body.style.overflow = 'hidden'
      // capture element to restore focus when modal closes
      restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null
      // focus first focusable inside the panel
      const focus = () => {
        const panel = panelRef.current
        if (!panel) return
        const selectors = [
          'a[href]',
          'area[href]',
          'button:not([disabled])',
          'input:not([disabled]):not([type="hidden"])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',')
        const focusables = panel.querySelectorAll<HTMLElement>(selectors)
        const first = focusables[0]
        if (first) first.focus()
        else panel.focus()
      }
      // defer to next tick to ensure children are rendered
      setTimeout(focus, 0)
    }
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
      // restore focus to the previously focused element
      if (restoreFocusRef.current && typeof restoreFocusRef.current.focus === 'function') {
        restoreFocusRef.current.focus()
      }
      restoreFocusRef.current = null
    }
  }, [open, onClose])

  if (!open) return null
  const maxW = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl'
  return createPortal(
    <div 
      className="fixed inset-0 z-[1000]" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={title ? titleId : undefined} 
      aria-label={title ? undefined : title}
      onSubmit={(e) => {
        // Evita que el submit burbujee al formulario padre (fuera del portal)
        // sin bloquear el submit del formulario hijo dentro del modal
        e.stopPropagation()
      }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center overflow-auto p-4">
        <div
          className={`w-full ${maxW} rounded-lg bg-white text-slate-900 shadow-xl`}
          onClick={(e) => e.stopPropagation()}
          ref={panelRef}
          tabIndex={-1}
          onSubmit={(e) => {
            // Doble protección: detener sólo la propagación, no el comportamiento por defecto
            e.stopPropagation()
          }}
          onKeyDownCapture={(e) => {
            if (e.key !== 'Tab') return
            const panel = panelRef.current
            if (!panel) return
            const selectors = [
              'a[href]',
              'area[href]',
              'button:not([disabled])',
              'input:not([disabled]):not([type="hidden"])',
              'select:not([disabled])',
              'textarea:not([disabled])',
              '[tabindex]:not([tabindex="-1"])',
            ].join(',')
            const focusables = Array.from(panel.querySelectorAll<HTMLElement>(selectors)).filter((el) => el.offsetParent !== null)
            if (focusables.length === 0) {
              e.preventDefault()
              panel.focus()
              return
            }
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            const active = document.activeElement as HTMLElement | null
            if (e.shiftKey) {
              if (!active || active === first || !panel.contains(active)) {
                e.preventDefault()
                last.focus()
              }
            } else {
              if (active === last) {
                e.preventDefault()
                first.focus()
              }
            }
          }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
            <button type="button" onClick={onClose} className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">✕</button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal

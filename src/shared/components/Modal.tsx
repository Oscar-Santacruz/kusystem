import { useEffect, useRef, useId, type JSX, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
  /** Si true, en móviles el modal usa pantalla completa (sin bordes, altura completa). */
  mobileFullScreen?: boolean
  /**
   * 'portal' (default): renderiza con portal y overlay.
   * 'inline': incrusta el panel directamente donde se invoca (sin overlay ni portal).
   */
  variant?: 'portal' | 'inline'
}

export function Modal({ open, title, onClose, children, size = 'md', footer, mobileFullScreen = false, variant = 'portal' }: ModalProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const latestOnClose = useRef(onClose)
  useEffect(() => { latestOnClose.current = onClose }, [onClose])
  const titleId = useId()
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') latestOnClose.current?.()
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
        // Priorizar elemento con autofocus explícito
        const auto = panel.querySelector<HTMLElement>('[autofocus]')
        if (auto) { auto.focus(); return }
        // Priorizar inputs/selects/textarea y excluir botón de cerrar
        const selectors = [
          'input:not([disabled]):not([type="hidden"])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'button:not([disabled]):not([data-modal-close="true"])',
          'a[href]',
          'area[href]',
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
  }, [open])

  if (!open) return null
  const maxW = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl'
  const panelBase = 'relative z-[2001] w-full bg-white text-slate-900 shadow-xl'
  const panelShape = mobileFullScreen ? 'h-full max-w-none rounded-none sm:rounded-lg sm:h-auto' : `rounded-lg ${maxW}`
  const panelClass = `${panelBase} ${panelShape}`

  const panel = (
    <div
      className={`${panelClass} flex flex-col`}
      onClick={(e) => e.stopPropagation()}
      ref={panelRef}
      tabIndex={-1}
      onSubmit={(e) => { e.stopPropagation() }}
      onKeyDownCapture={(e) => {
        if (e.key !== 'Tab') return
        const panel = panelRef.current
        if (!panel) return
        const selectors = [
          'input:not([disabled]):not([type="hidden"])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'button:not([disabled]):not([data-modal-close="true"])',
          'a[href]',
          'area[href]',
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
        <button type="button" onClick={onClose} className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar" data-modal-close="true">✕</button>
      </div>
      <div className={`p-4 ${mobileFullScreen ? 'flex-1 overflow-auto min-h-0 sm:p-4' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  )

  if (variant === 'inline') {
    // Incrustado: no portal, sin overlay; útil para flujos embebidos
    return (
      <div role="dialog" aria-modal="false" aria-labelledby={title ? titleId : undefined} className="w-full">
        {panel}
      </div>
    )
  }

  // Portal con overlay
  return createPortal(
    <div 
      className="fixed inset-0 z-[2000]" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={title ? titleId : undefined} 
      aria-label={title ? undefined : title}
      onSubmit={(e) => { e.stopPropagation() }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`absolute inset-0 flex ${mobileFullScreen ? 'items-stretch' : 'items-start'} justify-center ${mobileFullScreen ? 'overflow-hidden' : 'overflow-auto'} p-0 sm:p-4`}>
        {panel}
      </div>
    </div>,
    document.body
  )
}

export default Modal

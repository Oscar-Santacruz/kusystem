import { Dialog as HeadlessDialog } from '@headlessui/react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="mx-auto max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
          {children}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between p-6 border-b border-slate-700">
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
      {children}
    </div>
  )
}

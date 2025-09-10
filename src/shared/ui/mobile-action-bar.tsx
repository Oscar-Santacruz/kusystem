import { type JSX, type ReactNode } from 'react'

interface MobileActionBarProps {
  children: ReactNode
}

// Simple sticky bottom action bar for small screens only
export function MobileActionBar({ children }: MobileActionBarProps): JSX.Element {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800/70 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MobileActionBar


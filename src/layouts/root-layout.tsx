import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      <Outlet />
    </div>
  )
}

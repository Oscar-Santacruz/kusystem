import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <Outlet />
    </div>
  )
}

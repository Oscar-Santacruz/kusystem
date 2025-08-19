import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-200">
      <Outlet />
    </div>
  )
}

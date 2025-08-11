import { Outlet, NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { getModuleNavItems } from '@/modules/registry'
import { ThemeToggleButton } from '@/shared/ui/theme'

export function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0()
  const moduleNav = getModuleNavItems()
  return (
    <div className="h-dvh grid grid-cols-[240px_minmax(0,1fr)] overflow-hidden">
      {/* Sidebar: solo menú de rutas, con usuario pegado abajo */}
      <aside className="bg-slate-900 text-slate-100 p-4 flex flex-col sticky top-0 h-dvh overflow-y-auto">
        <div>
          <h1 className="mb-4 text-xl font-semibold">kuSystem</h1>
          <nav className="flex flex-col gap-2 text-sm">
            <NavLink
              to="/main/welcome"
              className={({ isActive }) =>
                `rounded px-2 py-1 ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white'}`
              }
              end
            >
              Inicio
            </NavLink>
            {moduleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded px-2 py-1 ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white'}`
                }
                end
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-800 text-sm">
          {isLoading ? (
            <span className="text-slate-400">Cargando…</span>
          ) : isAuthenticated ? (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-slate-200" title={user?.email || user?.name || 'Usuario'}>
                {user?.email || user?.name || 'Usuario'}
              </span>
              <button
                className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Salir
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Área de contenido en blanco */}
      <div className="flex h-dvh flex-col bg-white overflow-hidden">
        <header className="border-b px-6 py-4">
          <div className="flex items-center justify-end">
            <ThemeToggleButton />
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto px-6 py-6 text-slate-900 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
        <footer className="border-t px-6 py-4 text-center text-xs text-slate-500">
          <p>Hola Mundo • Proyecto unificado listo para modularizar</p>
        </footer>
      </div>
    </div>
  )
}

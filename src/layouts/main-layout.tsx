import { Outlet, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0()
  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">kuSystem</h1>
        <div className="flex items-center gap-4">
          <nav className="text-sm text-slate-300">
            <Link className="hover:underline" to="/main/welcome">Inicio</Link>
          </nav>
          <div className="text-sm">
            {isLoading ? (
              <span className="text-slate-400">Cargando…</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-200">
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
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-10 text-center text-xs text-slate-500">
        <p>Hola Mundo • Proyecto unificado listo para modularizar</p>
      </footer>
    </div>
  )
}

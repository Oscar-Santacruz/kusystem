import { Outlet, NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { ThemeToggleButton } from '@/shared/ui/theme'
import { OrgSelector } from '@/components/org/OrgSelector'

export function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('ui.sidebarOpen')
      return raw ? JSON.parse(raw) : true
    } catch {
      return true
    }
  })

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gestion: true,
    reportes: false
  })

  useEffect(() => {
    try {
      localStorage.setItem('ui.sidebarOpen', JSON.stringify(sidebarOpen))
    } catch {
      // ignore
    }
  }, [sidebarOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl+B para alternar (evitamos Ctrl+S que el navegador usa para guardar)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        setSidebarOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Mobile header */}
      <header className="md:hidden bg-slate-900 p-3 flex items-center justify-between border-b border-slate-800 z-30">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 hover:bg-slate-800 rounded z-40"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <h1 className="text-lg font-semibold text-white select-none">kuSystem</h1>
        <div className="w-10">
          <ThemeToggleButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: menú jerárquico con categorías */}
        <aside 
          className={`bg-slate-900 text-slate-100 flex flex-col fixed md:static z-20 w-64 h-full transition-all duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
          }`}
        >
          {/* Header del sidebar */}
          <div className="p-4 border-b border-slate-800 flex-shrink-0">
            <h1 className="text-lg font-semibold text-white whitespace-nowrap overflow-hidden">
              {sidebarOpen ? 'kuSystem' : 'kS'}
            </h1>
          </div>

        {/* Navegación */}
        <nav className={[
          'flex-1',
          'overflow-auto',
          sidebarOpen ? 'md:overflow-auto' : 'md:overflow-hidden',
        ].join(' ')}>
          <div className="min-h-full">
            {/* Inicio */}
            <NavLink
              to="/main/welcome"
              className={({ isActive }) => [
                'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                sidebarOpen ? '' : 'md:justify-center md:px-0 md:gap-0',
              ].join(' ')}
              end
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span className={sidebarOpen ? '' : 'md:hidden'}>Inicio</span>
            </NavLink>

            {/* Sección Gestión */}
            <div className="mt-4">
              <button
                onClick={() => toggleSection('gestion')}
                className={[
                  'flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors',
                  sidebarOpen ? 'justify-between' : 'md:justify-center',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span className={sidebarOpen ? '' : 'md:hidden'}>Gestión</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.gestion ? 'rotate-90' : ''} ${sidebarOpen ? '' : 'md:hidden'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              
              {sidebarOpen && expandedSections.gestion && (
                <div className="bg-slate-800/30">
                  <NavLink
                    to="/main/quotes"
                    className={({ isActive }) => [
                      'flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors',
                      isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarOpen ? '' : 'md:pl-0 md:pr-0 md:justify-center md:gap-0',
                    ].join(' ')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                    </svg>
                    <span className={sidebarOpen ? '' : 'md:hidden'}>Presupuestos</span>
                  </NavLink>
                  
                  <NavLink
                    to="/main/clients"
                    className={({ isActive }) => [
                      'flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors',
                      isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarOpen ? '' : 'md:pl-0 md:pr-0 md:justify-center md:gap-0',
                    ].join(' ')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <span className={sidebarOpen ? '' : 'md:hidden'}>Clientes</span>
                  </NavLink>
                  
                  <NavLink
                    to="/main/products"
                    className={({ isActive }) => [
                      'flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors',
                      isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarOpen ? '' : 'md:pl-0 md:pr-0 md:justify-center md:gap-0',
                    ].join(' ')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd"/>
                    </svg>
                    <span className={sidebarOpen ? '' : 'md:hidden'}>Productos</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Sección Reportes (placeholder para futuro) */}
            <div className="mt-2">
              <button
                onClick={() => toggleSection('reportes')}
                className={[
                  'flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors',
                  sidebarOpen ? 'justify-between' : 'md:justify-center',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                  <span className={sidebarOpen ? '' : 'md:hidden'}>Reportes</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.reportes ? 'rotate-90' : ''} ${sidebarOpen ? '' : 'md:hidden'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              
              {sidebarOpen && expandedSections.reportes && (
                <div className="bg-slate-800/30">
                  <div className="flex items-center gap-3 pl-8 pr-4 py-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    Próximamente...
                  </div>
                </div>
              )}
            </div>

            {/* Sección Mi organización */}
            <div className="mt-2">
              <button
                onClick={() => toggleSection('mi_org')}
                className={[
                  'flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors',
                  sidebarOpen ? 'justify-between' : 'md:justify-center',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 01.894.553l.764 1.528 1.687.245a1 1 0 01.555 1.706l-1.22 1.189.288 1.677a1 1 0 01-1.451 1.054L10 10.708l-1.517.799a1 1 0 01-1.451-1.054l.288-1.677-1.22-1.189a1 1 0 01.555-1.706l1.687-.245.764-1.528A1 1 0 0110 2z"/>
                  </svg>
                  <span className={sidebarOpen ? '' : 'md:hidden'}>Mi organización</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.mi_org ? 'rotate-90' : ''} ${sidebarOpen ? '' : 'md:hidden'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              {sidebarOpen && expandedSections.mi_org && (
                <div className="bg-slate-800/30">
                  <NavLink
                    to="/main/organization/members"
                    className={({ isActive }) => [
                      'flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors',
                      isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarOpen ? '' : 'md:pl-0 md:pr-0 md:justify-center md:gap-0',
                    ].join(' ')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <span className={sidebarOpen ? '' : 'md:hidden'}>Miembros</span>
                  </NavLink>
                  <NavLink
                    to="/main/organization/invite"
                    className={({ isActive }) => [
                      'flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors',
                      isActive ? 'bg-blue-600 text-white border-r-2 border-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarOpen ? '' : 'md:pl-0 md:pr-0 md:justify-center md:gap-0',
                    ].join(' ')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <span className={sidebarOpen ? '' : 'md:hidden'}>Invitar</span>
                  </NavLink>
                </div>
              )}
            </div>

          </div>
        </nav>
        {/* Usuario en la parte inferior */}
        <div className="mt-auto border-t border-slate-800 p-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-sm">Cargando…</span>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className={`flex-1 min-w-0 ${sidebarOpen ? '' : 'md:hidden'}`}>
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                className={[
                  'w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors',
                  sidebarOpen ? '' : 'md:px-0 md:gap-0',
                ].join(' ')}
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                <span className={sidebarOpen ? '' : 'md:hidden'}>Cerrar Sesión</span>
              </button>
            </div>
          ) : null}
          </div>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header */}
          <header className="hidden md:flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white p-2 hover:bg-slate-800 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-13Z" opacity=".2" />
                  <path d="M8 4v16" />
                  <path d="M5.5 4h13A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4Zm2.5 0v16" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <OrgSelector />
              <ThemeToggleButton />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800 p-4 text-center text-xs text-slate-400">
            <p>Módulo de Presupuestos • Crea, edita e imprime presupuestos con cargos adicionales, notas y descarga en PDF.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

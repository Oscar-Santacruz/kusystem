import { Link } from 'react-router-dom'

export function WelcomePage() {
  return (
    <section className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600/20 via-slate-800/40 to-slate-900 border border-slate-800 p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Bienvenido a kuSystem</h2>
            <p className="mt-1 text-sm md:text-base text-slate-300 max-w-2xl">
              Gestiona presupuestos, clientes y productos desde una interfaz rápida, accesible y optimizada para móviles.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/main/quotes/new" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-500">
              Nuevo presupuesto
            </Link>
            <Link to="/main/clients/new" className="inline-flex items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
              Nuevo cliente
            </Link>
            <Link to="/main/products/" className="inline-flex items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
              Nuevo producto
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/main/quotes" className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Presupuestos</h3>
              <p className="text-sm text-slate-400">Crea, edita, imprime y comparte</p>
            </div>
            <span className="text-slate-500 group-hover:text-white">→</span>
          </div>
        </Link>
        <Link to="/main/clients" className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Clientes</h3>
              <p className="text-sm text-slate-400">Gestiona tus contactos</p>
            </div>
            <span className="text-slate-500 group-hover:text-white">→</span>
          </div>
        </Link>
        <Link to="/main/products" className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Productos</h3>
              <p className="text-sm text-slate-400">Inventario y precios</p>
            </div>
            <span className="text-slate-500 group-hover:text-white">→</span>
          </div>
        </Link>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h4 className="text-sm font-semibold text-white">Sugerencias</h4>
        <ul className="mt-2 text-sm text-slate-400 list-disc pl-5 space-y-1">
          <li>En móvil, usa el botón fijo inferior para guardar rápidamente.</li>
          <li>Desde Presupuestos, puedes crear clientes y productos sin salir del flujo.</li>
          <li>Configura tu logo desde la creación de empresa para mostrarlo en documentos.</li>
        </ul>
      </div>
    </section>
  )
}


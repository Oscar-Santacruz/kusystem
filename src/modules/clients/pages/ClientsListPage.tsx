import { type JSX } from 'react'
import { Link } from 'react-router-dom'

export function ClientsListPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <div className="space-x-2">
          <Link className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" to="#">
            Nuevo
          </Link>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white/50 p-4">
        <div className="text-slate-500">Scaffolding inicial. Aquí irá el listado de clientes con búsqueda y paginación.</div>
      </div>
    </section>
  )
}

export default ClientsListPage

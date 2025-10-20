export function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="rounded-xl bg-slate-900/80 px-8 py-6 shadow-lg ring-1 ring-white/10">
        <h1 className="text-xl font-semibold text-white">Procesando autenticación…</h1>
        <p className="mt-2 text-sm text-slate-300">Serás redirigido automáticamente en unos segundos.</p>
      </div>
    </div>
  )
}

import { useEffect } from 'react'

export function AuthCallback() {
  useEffect(() => {
    console.log('[auth0] esperando procesamiento de callback…')
  }, [])

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Procesando autenticación…</h1>
      <p className="text-slate-400">Serás redirigido automáticamente.</p>
    </div>
  )
}

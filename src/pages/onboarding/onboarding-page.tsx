import { Link } from 'react-router-dom'

export function OnboardingPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Bienvenido a kuSystem</h1>
      <p className="text-gray-600 mb-6">Antes de continuar, elige una opción para comenzar a trabajar:</p>
      <div className="grid gap-4">
        <Link
          to="/organizations/create"
          className="block rounded border p-4 hover:bg-gray-50 transition"
        >
          <h2 className="font-medium mb-1">Crear mi organización</h2>
          <p className="text-sm text-gray-600">Crea una nueva organización y conviértete en su propietario.</p>
        </Link>

        <Link
          to="/invitations/ingresar"
          className="block rounded border p-4 hover:bg-gray-50 transition"
          onClick={(e) => {
            e.preventDefault()
            const token = window.prompt('Pega el token del enlace de invitación:')
            if (token) {
              window.location.href = `/invitations/${encodeURIComponent(token)}`
            }
          }}
        >
          <h2 className="font-medium mb-1">Tengo una invitación</h2>
          <p className="text-sm text-gray-600">Ingresa con el enlace (token) que te enviaron por correo.</p>
        </Link>
      </div>
    </div>
  )
}

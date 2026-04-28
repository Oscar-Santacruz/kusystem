import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function LogoutPage() {
    const { logout } = useAuth0()

    useEffect(() => {
        logout({ logoutParams: { returnTo: window.location.origin } })
    }, [logout])

    return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
            <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold">Cerrando sesión...</h1>
                <p className="text-slate-400">Por favor, espere un momento.</p>
            </div>
        </div>
    )
}

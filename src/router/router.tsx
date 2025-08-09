import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/root-layout'
import { MainLayout } from '@/layouts/main-layout'
import { WelcomePage } from '@/pages/welcome-page'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { LoginPage } from '@/pages/login-page'
import { AuthCallback } from '@/pages/auth-callback'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <h1>404 - Página no encontrada</h1>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'callback', element: <AuthCallback /> },
      {
        path: '',
        element: <Navigate to="/main/welcome" replace />,
      },
      {
        path: 'main',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'welcome', element: <WelcomePage /> },
        ],
      },
    ],
  },
])

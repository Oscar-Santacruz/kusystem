import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { RootLayout } from '@/layouts/root-layout'
import { MainLayout } from '@/layouts/main-layout'
import { WelcomePage } from '@/pages/welcome-page'
import { PublicLandingPage } from '@/pages/public-landing'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { OrgGuard } from '@/auth/OrgGuard'
import { LoginPage } from '@/pages/login-page'
import { AuthCallback } from '@/pages/auth-callback'
import { getMainChildrenRoutes } from '@/modules/registry'
import { OnboardingPage } from '@/pages/onboarding/onboarding-page'
import { CreateOrganizationPage } from '@/pages/organizations/create-organization-page'
import { InvitationAcceptPage } from '@/pages/invitations/invitation-accept-page'
import { InviteMembersPage } from '@/pages/organizations/invite-members-page'
import { MembersPage } from '@/pages/organizations/members-page'
import { PermissionsPage } from '@/pages/organizations/permissions-page'
import { LogoutPage } from '@/pages/logout-page'

// Lazy-load páginas pesadas para reducir el bundle principal (mapear named export -> default)
const QuotePublicPage = lazy(() => import('@/modules/quotes/pages/QuotePublicPage').then(m => ({ default: m.QuotePublicPage })))
const QuotePreviewPage = lazy(() => import('@/modules/quotes/pages/QuotePreviewPage').then(m => ({ default: m.QuotePreviewPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <h1>404 - Página no encontrada</h1>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'logout', element: <LogoutPage /> },
      { path: 'callback', element: <AuthCallback /> },
      // Ruta pública para ver presupuesto por publicId (sin auth)
      {
        path: 'q/:publicId', element: (
          <Suspense fallback={<div className="p-6">Cargando…</div>}>
            <QuotePublicPage />
          </Suspense>
        )
      },
      // Ruta de preview de impresión por ID interno (sin auth) para desarrollo
      {
        path: 'preview/quotes/:id', element: (
          <Suspense fallback={<div className="p-6">Cargando…</div>}>
            <QuotePreviewPage />
          </Suspense>
        )
      },
      // Onboarding y flujos públicos de invitación
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'organizations/create', element: <CreateOrganizationPage /> },
      { path: 'invitations/:token', element: <InvitationAcceptPage /> },
      {
        path: '',
        element: <PublicLandingPage />,
      },
      {
        path: 'main',
        element: (
          <ProtectedRoute>
            <OrgGuard>
              <MainLayout />
            </OrgGuard>
          </ProtectedRoute>
        ),
        children: [
          { path: 'welcome', element: <WelcomePage /> },
          { path: 'organization/invite', element: <InviteMembersPage /> },
          { path: 'organization/members', element: <MembersPage /> },
          { path: 'organization/permissions', element: <PermissionsPage /> },
          ...getMainChildrenRoutes(),
        ],
      },
    ],
  },
])

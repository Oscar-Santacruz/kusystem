import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/root-layout'
import { MainLayout } from '@/layouts/main-layout'
import { WelcomePage } from '@/pages/welcome-page'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { OrgGuard } from '@/auth/OrgGuard'
import { LoginPage } from '@/pages/login-page'
import { AuthCallback } from '@/pages/auth-callback'
import { getMainChildrenRoutes } from '@/modules/registry'
import { QuotePublicPage } from '@/modules/quotes/pages/QuotePublicPage'
import { QuotePreviewPage } from '@/modules/quotes/pages/QuotePreviewPage'
import { OnboardingPage } from '@/pages/onboarding/onboarding-page'
import { CreateOrganizationPage } from '@/pages/organizations/create-organization-page'
import { InvitationAcceptPage } from '@/pages/invitations/invitation-accept-page'
import { InviteMembersPage } from '@/pages/organizations/invite-members-page'
import { MembersPage } from '@/pages/organizations/members-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <h1>404 - Página no encontrada</h1>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'callback', element: <AuthCallback /> },
      // Ruta pública para ver presupuesto por publicId (sin auth)
      { path: 'q/:publicId', element: <QuotePublicPage /> },
      // Ruta de preview de impresión por ID interno (sin auth) para desarrollo
      { path: 'preview/quotes/:id', element: <QuotePreviewPage /> },
      // Onboarding y flujos públicos de invitación
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'organizations/create', element: <CreateOrganizationPage /> },
      { path: 'invitations/:token', element: <InvitationAcceptPage /> },
      {
        path: '',
        element: <Navigate to="/main/welcome" replace />,
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
          ...getMainChildrenRoutes(),
        ],
      },
    ],
  },
])

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Puedes integrar un logger aquí (Sentry, etc.)
    console.error('[ErrorBoundary] Error capturado:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="m-6 rounded border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="mb-1 font-semibold">Ocurrió un error</h2>
          <p className="text-sm">Intenta recargar la página o volver al inicio.</p>
        </div>
      )
    }
    return this.props.children
  }
}

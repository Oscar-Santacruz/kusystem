import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeDark() {
  const root = document.documentElement
  root.classList.add('dark')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Fijar siempre en oscuro
  const [theme] = useState<Theme>('dark')

  useEffect(() => {
    applyThemeDark()
  }, [])

  const setTheme = (_t: Theme) => {
    // noop: no permitimos cambiar
  }
  const toggle = () => {
    // noop: no permitimos cambiar
  }

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}

export function ThemeToggleButton() {
  // Eliminado el cambio de tema: no renderizar botón
  return null
}

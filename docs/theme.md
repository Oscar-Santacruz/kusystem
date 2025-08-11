# Personalización de Tema y Dark Mode

- Base: Tailwind CSS v4
- Dark mode: habilitado por clase (`darkMode: 'class'` en `tailwind.config.ts`).
- Uso: agregar `class="dark"` en el contenedor raíz (por ejemplo en `<html>` o en un wrapper de la app) para activar el modo oscuro.

## Recomendaciones
- Definir tokens de color vía `@theme` o `extend` si se necesitan variantes de marca.
- Usar utilidades semánticas (p.ej. `text-muted-foreground`) si se integra shadcn/ui.
- Mantener contraste AA mínimo. Validar accesibilidad con Lighthouse.

## Ejemplo de toggle
```tsx
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])
  return (
    <button onClick={() => setIsDark(v => !v)} className="rounded border px-2 py-1">
      {isDark ? 'Claro' : 'Oscuro'}
    </button>
  )
}
```

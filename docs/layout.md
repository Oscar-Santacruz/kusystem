# Layout: Sidebar Sticky y Main Scrollable

- Sidebar pegado al viewport con scroll interno en `<main>`.
- Altura completa usando `min-h-screen` y contenedores flex.
- Evitar overflow del body; permitir scroll sólo en el área de contenido.

## Patrón base
```tsx
<div className="flex min-h-screen">
  <aside className="w-64 shrink-0 border-r">{/* navegación */}</aside>
  <main className="flex-1 overflow-y-auto">{/* rutas */}</main>
</div>
```

## Buenas prácticas
- Mantener headers pegajosos con `sticky top-0` en listados largos.
- Evitar anidar múltiples scrolls verticales.
- Usar contenedores `p-4` para spacing consistente.
- Preparar estilos de impresión sólo en páginas dedicadas (p.ej. `/quotes/:id/print`).

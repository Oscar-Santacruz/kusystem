# Arquitectura Frontend Modular (Manifest + Registry + Shared)

- Módulos desacoplables en `src/modules/<modulo>/` con `index.ts` exponiendo `ModuleDescriptor`.
- `src/modules/registry.ts` agrega los módulos al host y compone rutas y navegación.
- `src/shared/` actúa como API estable: tipos, utilidades, hooks comunes.

## Patrón de módulo
- `index.ts`: define rutas `routes` y opcional `nav`.
- `pages/`: páginas de enrutamiento (`List`, `New`, `Edit`, etc.).
- `components/`: UI reutilizable de ese dominio.
- `hooks/`: integración con API (React Query), normalización y validaciones mínimas.

## Integración API
- Cliente HTTP central: `src/services/api.ts` con `ApiInstance`.
- Hooks por dominio (p.ej. `useQuotes`, `useClients`, `useProducts`, `useClientBranches`).
- Convenciones: `placeholderData: keepPreviousData`, `refetchOnWindowFocus: false`, normalizar fechas y limpiar strings vacíos antes de enviar.

## Flujo de Presupuestos
- `QuoteForm` integra búsqueda y creación inline de clientes y productos.
- Debounce de búsqueda y loaders.
- Validación mínima: cliente seleccionado + al menos un ítem.
- Impresión: `/quotes/:id/print` con layout dedicado.

## Desac acoplamiento y futura exportación
- Cada módulo tiene dependencias mínimas al host.
- `shared` como capa estable para mover módulos a repos externos.
- Evitar imports cruzados entre módulos (usar tipos/funciones de `shared`).

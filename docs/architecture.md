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

## Persistencia del `pageSize`
- Persistir en `localStorage` con key `"table:pageSize"`.
- Defaults responsive: Mobile (≤768) = 10; Desktop = 25.
- Si la preferencia no existe en el viewport actual, ajustar al valor permitido más cercano y resetear a página 1.

## Patrón mínimo en páginas de lista
1. Definir `columns: ColumnDef<T>[]` en la página.
2. Llevar `pageIndex` (0-based) y `pageSize` en estado local con persistencia.
3. Llamar al hook de datos con `page = pageIndex + 1` y `pageSize`.
4. Pasar a `DataTable`:
   - `data`, `columns`, `isLoading`, `pagination={{ pageIndex, pageSize, total }}`.
   - `onPaginationChange={(next) => { setPageIndex(next.pageIndex); setPageSize(next.pageSize) }}`.

## Do / Don’t (Tablas)
- Do: usar `DataTable` para todas las nuevas tablas paginadas.
- Do: mantener búsqueda y acciones fuera del `DataTable` (en la página).
- Don’t: duplicar paginación arriba de la tabla ni crear tablas HTML manuales.
- Don’t: añadir librerías nuevas para tabla/paginación.

## Referencias
- Componente genérico: `src/shared/components/DataTable.tsx`.
- Implementaciones: `modules/clients/pages/ClientsListPage.tsx`, `modules/products/pages/ProductsListPage.tsx`.
- Pendiente de unificar: `modules/quotes/components/QuotesTable.tsx` (puede migrarse a `DataTable`).

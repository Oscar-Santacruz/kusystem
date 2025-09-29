# DataTable genérico (TanStack Table v8)

Este proyecto define un componente genérico de tabla reutilizable con TanStack Table v8, con paginación manual, selector de "Filas por página" responsive y microcopy accesible.

Ruta del componente:
- `frontend/src/shared/components/DataTable.tsx`

## Cuándo usarlo
- Usa SIEMPRE `DataTable` para construir tablas paginadas en módulos de la app (Clientes, Productos, Presupuestos, etc.).
- No construyas nuevas tablas HTML manuales. Centralizamos la UI/UX de paginación, rango y selector de filas por página en este componente.

## Principales features
- **TanStack v8**: `useReactTable`, `manualPagination`.
- **Selector “Filas por página”**: dentro del mismo contenedor de la paginación inferior.
  - Desktop: selector + rango a la izquierda, controles a la derecha.
  - Mobile (≤768px): opciones `[10, 25, 50]`.
  - Desktop: opciones `[10, 25, 50, 100]`.
  - Se muestra solo si `total > minOpcion`.
- **Microcopy y A11y**:
  - Label visible: “Filas por página”, `aria-label="Filas por página"`.
  - Rango con `aria-live="polite"`: “Mostrando {from}–{to} de {total}”.
- **Estados**:
  - Al cambiar page size, resetea `pageIndex` a 0.
- **Prop de control**:
  - `showPageSize?: boolean` para ocultar el selector si usas scroll infinito.

## API
```ts
export interface DataTableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  pagination: { pageIndex: number; pageSize: number; total: number }
  onPaginationChange: (updater: PaginationState) => void
  showPageSize?: boolean
  className?: string
}
```

- `pagination.pageIndex` es 0-based. Si tu backend usa 1-based, convierte en tu página contenedora.
- `onPaginationChange` recibe el estado de paginación nuevo; sincroniza `pageIndex` y `pageSize` en tu estado local.

## Persistencia del pageSize (requerida)
La persistencia se maneja en la página contenedora, no dentro de `DataTable`. Propuesta de hook:

```tsx
function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(state)) } catch {}
  }, [key, state])
  return [state, setState] as const
}
```

- Key recomendada compartida: `"table:pageSize"`. Si necesitas preferencias por módulo, agrega un sufijo, por ejemplo `"table:pageSize:clients"`.
- Defaults responsive:
  - Mobile: default 10.
  - Desktop: default 25.
- Si el valor persistido no está en las opciones del viewport actual, ajusta al permitido más cercano y reset a `pageIndex=0`.

## Patrón de uso (ejemplo)
```tsx
// 0-based en UI, 1-based en backend
const [pageIndex, setPageIndex] = useState(0)
const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
const MOBILE_OPTIONS = [10, 25, 50]
const DESKTOP_OPTIONS = [10, 25, 50, 100]
const PAGE_SIZE_OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS
const DEFAULT_PAGE_SIZE = isMobile ? 10 : 25

const [pageSize, setPageSize] = usePersistentState<number>('table:pageSize', DEFAULT_PAGE_SIZE)

// Reconciliar si cambia el viewport
useEffect(() => {
  if (!PAGE_SIZE_OPTIONS.includes(pageSize)) {
    const nearest = PAGE_SIZE_OPTIONS.reduce((prev, curr) => Math.abs(curr - pageSize) < Math.abs(prev - pageSize) ? curr : prev, PAGE_SIZE_OPTIONS[0])
    if (nearest !== pageSize) { setPageSize(nearest); setPageIndex(0) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isMobile])

const page = pageIndex + 1
const { data } = useMyQuery({ page, pageSize })
const items = data?.data ?? []
const total = data?.total ?? 0

<DataTable<MyRow>
  data={items}
  columns={columns}
  isLoading={isLoading}
  pagination={{ pageIndex, pageSize, total }}
  onPaginationChange={(next) => { setPageIndex(next.pageIndex); setPageSize(next.pageSize) }}
  showPageSize={true}
/>
```

## Migración de páginas existentes
- Reemplaza tablas HTML manuales por `DataTable`.
- Extrae `columns` por dominio.
- Mantén lógica de búsqueda/URL/acciones fuera del `DataTable`.
- Ajusta `page` (1-based) ↔ `pageIndex` (0-based) en tu hook de datos.

## Do / Don’t
- **Do**: usar `DataTable` para todas las tablas paginadas.
- **Do**: persistir `pageSize` con la key indicada.
- **Don’t**: duplicar la paginación o el selector arriba de la tabla.
- **Don’t**: introducir librerías extra para resolver paginación o tabla básica.

## Ejemplos en código
- Clientes: `frontend/src/modules/clients/pages/ClientsListPage.tsx`
- Productos: `frontend/src/modules/products/pages/ProductsListPage.tsx`
- Presupuestos (patrón similar): `frontend/src/modules/quotes/components/QuotesTable.tsx` (pendiente de migrar a `DataTable` si se desea unificar)

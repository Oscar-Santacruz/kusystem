# Documentación del Proyecto

- Arquitectura modular: ver `docs/architecture.md`
- Layout (sidebar sticky, main scrollable): ver `docs/layout.md`
- Tema y Dark Mode (Tailwind): ver `docs/theme.md`
- Recomendaciones y extensiones: ver `docs/recommendations.md`

## Ejecución local
- Backend: `npm run dev` en `kuSystem-backend/` (puerto 4000)
- Frontend: `npm run dev` en `kuSystem/` (puerto 5173)
- Variables: ver `.env.local` con `VITE_API_BASE_URL=http://localhost:4000` (reiniciar Vite si se cambia)

## Flujos Clave
- Presupuestos: `/main/quotes` y `/main/quotes/new`
  - Búsqueda/alta inline de clientes y productos en `QuoteForm`
  - Debounce y loaders en listas
  - Validación mínima: cliente e ítems requeridos
  - Impresión: `/main/quotes/:id/print`
- Clientes: `/main/clients` (crear/editar)
- Sucursales: `/main/clients/:clientId/branches`, editar: `/main/client-branches/:id/edit`
- Productos: `/main/products`

## Notas Técnicas
- Cliente HTTP: `src/services/api.ts`
- Hooks: `useQuotes`, `useClients`, `useProducts`, `useClientBranches`
- React Query v5: `placeholderData: keepPreviousData`, `refetchOnWindowFocus: false`
- Normalización de fechas y limpieza de strings vacíos en envíos

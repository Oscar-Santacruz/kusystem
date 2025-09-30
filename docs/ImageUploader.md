# ImageUploader Component

Componente reutilizable para subir imágenes usando Uppy.

## Características

- **Drag & Drop**: Arrastra archivos directamente al área de upload
- **Botón de selección**: Permite elegir archivos desde el explorador
- **Validación**: Solo acepta imágenes (image/*), máximo 5MB
- **Vista previa grande**: Muestra la imagen actual (128x128px) con botón para eliminar
- **Botón X para eliminar**: Permite quitar la imagen y volver a seleccionar otra
- **Auto-upload**: Sube automáticamente al seleccionar el archivo
- **Feedback visual**: Indicadores de progreso y errores
- **Limpieza de estado**: Limpia el estado interno de Uppy al eliminar la imagen

## Tecnología

Utiliza [Uppy](https://uppy.io/) con los siguientes plugins:
- `@uppy/core`: Core de Uppy
- `@uppy/dashboard`: UI completa con drag & drop, preview y progress
- `@uppy/react`: Componentes React de Uppy
- `@uppy/xhr-upload`: Upload vía XHR/fetch

## Uso

```tsx
import { ImageUploader } from '@/shared/ui/image-uploader'

function MyComponent() {
  const [imageKey, setImageKey] = useState<string | null>(null)
  
  return (
    <ImageUploader
      uploadUrl="https://api.example.com/upload"
      onUploadSuccess={(fileKey) => setImageKey(fileKey)}
      onUploadError={(error) => console.error(error)}
      previewUrl={imageKey}
      helpText="Formatos: JPG, PNG. Máximo: 5MB"
      disabled={false}
      height={200}
    />
  )
}
```

## Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `uploadUrl` | `string` | ✅ | - | URL del endpoint para subir |
| `onUploadSuccess` | `(fileKey: string) => void` | ✅ | - | Callback al completar upload |
| `onUploadError` | `(error: Error) => void` | ❌ | - | Callback en caso de error |
| `previewUrl` | `string \| null` | ❌ | - | URL de imagen actual |
| `onClearPreview` | `() => void` | ❌ | - | Callback al hacer clic en X |
| `helpText` | `string` | ❌ | "Arrastra..." | Texto de ayuda |
| `disabled` | `boolean` | ❌ | `false` | Deshabilitar uploader |
| `height` | `number` | ❌ | `200` | Altura del área de drop (px) |

## Ejemplos de uso en el proyecto

### 1. Crear Producto

```tsx
// ProductForm.tsx
const tempProductId = useMemo(() => `temp-${Date.now()}`, [])
const uploadUrl = useMemo(() => getProductImageUploadUrl(tempProductId), [tempProductId])

// URL completa para vista previa
const imagePreviewUrl = useMemo(() => {
  if (!values.imageUrl) return null
  if (values.imageUrl.startsWith('http')) return values.imageUrl
  const base = import.meta.env.VITE_FILES_BASE_URL || 'http://localhost:3000'
  return `${base}/api/files/${values.imageUrl}`
}, [values.imageUrl])

<ImageUploader
  uploadUrl={uploadUrl}
  onUploadSuccess={(fileKey) => handleChange('imageUrl', fileKey)}
  onClearPreview={() => handleChange('imageUrl', undefined)}
  previewUrl={imagePreviewUrl}
  helpText="JPG, PNG o WebP. Máximo: 5MB."
  height={180}
/>
```

### 2. Crear Organización

```tsx
// CreateOrganizationPage.tsx
const uploadUrl = useMemo(() => {
  const base = getEnv().VITE_FILES_BASE_URL || 'http://localhost:3000'
  return `${base}/api/files/kusystem/${slug}/logo.png`
}, [slug])

// URL completa para vista previa
const previewUrl = useMemo(() => {
  if (!logoKey) return null
  const base = getEnv().VITE_FILES_BASE_URL || 'http://localhost:3000'
  return `${base}/api/files/${logoKey}`
}, [logoKey])

<ImageUploader
  uploadUrl={uploadUrl}
  onUploadSuccess={(fileKey) => setLogoKey(fileKey)}
  onClearPreview={() => setLogoKey(null)}
  previewUrl={previewUrl}
  helpText="PNG o SVG. 256x256. Máximo: 5MB."
  height={150}
/>
```

## Backend esperado

El componente espera un endpoint que:
- Acepte `PUT` con `multipart/form-data`
- Campo del form: `file`
- Retorne la key del archivo en `response.body.key`

Ejemplo de respuesta:
```json
{
  "key": "products/abc123/image.jpg",
  "url": "https://cdn.example.com/products/abc123/image.jpg"
}
```

## Personalización

Para cambiar restricciones (tamaño, tipos de archivo):

```tsx
// En image-uploader.tsx
const [uppy] = useState(() =>
  new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      allowedFileTypes: ['image/*'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  })
)
```

## Estilos

El componente importa los estilos de Uppy automáticamente:
```tsx
import '@uppy/core/css/style.css'
import '@uppy/dashboard/css/style.css'
```

Para personalizar, puedes sobrescribir las clases CSS de Uppy en tu archivo de estilos global.

## Troubleshooting

### Error: Missing "./dist/style.css" o Module has no exported member 'DragDrop'
Uppy 5.x cambió la estructura de paquetes:
```tsx
// ❌ Incorrecto
import { DragDrop } from '@uppy/react'
import '@uppy/core/dist/style.css'

// ✅ Correcto (Uppy 5.x)
import { Dashboard } from '@uppy/react'
import '@uppy/core/css/style.css'
import '@uppy/dashboard/css/style.css'
```

**Nota**: El componente `DragDrop` no está disponible en `@uppy/react` v5.x. Usa `Dashboard` que incluye drag & drop y más funcionalidades.

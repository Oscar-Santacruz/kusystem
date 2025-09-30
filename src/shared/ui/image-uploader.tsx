import { useEffect, useState, useId } from 'react'
import Uppy from '@uppy/core'
import { Dashboard } from '@uppy/react'
import XHRUpload from '@uppy/xhr-upload'
import { FiX } from 'react-icons/fi'

import '@uppy/core/css/style.css'
import '@uppy/dashboard/css/style.css'

export interface ImageUploaderProps {
  /** URL del endpoint para subir la imagen */
  uploadUrl: string
  /** Callback cuando se completa la subida exitosamente, retorna la key del archivo */
  onUploadSuccess: (fileKey: string) => void
  /** Callback cuando hay un error */
  onUploadError?: (error: Error) => void
  /** Vista previa de la imagen actual (URL) */
  previewUrl?: string | null
  /** Texto de ayuda opcional */
  helpText?: string
  /** Deshabilitar el uploader */
  disabled?: boolean
  /** Altura del área de drop (default: 200px) */
  height?: number
  /** Limpia la imagen seleccionada para volver a elegir otra */
  onClearPreview?: () => void
}

export function ImageUploader(props: ImageUploaderProps) {
  const {
    uploadUrl,
    onUploadSuccess,
    onUploadError,
    previewUrl,
    helpText = 'Arrastra una imagen aquí o haz clic para seleccionar',
    disabled = false,
    height = 200,
    onClearPreview,
  } = props

  const uid = useId()
  const [uppy] = useState(() =>
    new Uppy({
      id: `image-uploader-${uid}`,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
      },
      autoProceed: true,
    }).use(XHRUpload, {
      endpoint: uploadUrl,
      method: 'PUT',
      formData: true,
      fieldName: 'file',
    })
  )

  // Función para limpiar archivos de Uppy
  const clearUppyFiles = () => {
    uppy.cancelAll()
    const files = uppy.getFiles()
    files.forEach((file) => {
      uppy.removeFile(file.id)
    })
  }

  useEffect(() => {
    // Listener para cuando se completa la subida
    const handleSuccess = (_file: any, response: any) => {
      // Extraer la key del response o del file
      const fileKey = response.body?.key || _file?.name || ''
      onUploadSuccess(fileKey)
    }

    // Listener para errores
    const handleError = (_file: any, error: any) => {
      console.error('Upload error:', error)
      onUploadError?.(error as Error)
    }

    uppy.on('upload-success', handleSuccess)
    uppy.on('upload-error', handleError)

    // Cleanup
    return () => {
      uppy.off('upload-success', handleSuccess)
      uppy.off('upload-error', handleError)
    }
  }, [uppy, onUploadSuccess, onUploadError])

  // Actualizar el endpoint si cambia
  useEffect(() => {
    const xhrPlugin = uppy.getPlugin('XHRUpload')
    if (xhrPlugin) {
      xhrPlugin.setOptions({ endpoint: uploadUrl })
    }
  }, [uploadUrl, uppy])

  return (
    <div className="space-y-3">
      {previewUrl && (
        <div className="flex items-center gap-4">
          <div className="relative h-32 w-32 flex items-center justify-center rounded border bg-white overflow-hidden">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-full w-full object-contain"
              onError={(e) => {
                // Si la imagen falla al cargar, ocultar el contenedor
                const target = e.currentTarget
                target.style.display = 'none'
                const parent = target.parentElement?.parentElement
                if (parent) parent.style.display = 'none'
              }}
            />
            <button
              type="button"
              aria-label="Quitar imagen"
              onClick={() => {
                // Limpiar archivos de Uppy
                clearUppyFiles()
                // Avisamos al padre que limpie la imagen para volver a mostrar el uploader
                onClearPreview?.()
              }}
              className="absolute top-1 right-1 inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/90 text-slate-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quitar imagen"
            >
              <FiX />
            </button>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-medium">Imagen actual</p>
            <p className="text-xs text-slate-500">Haz clic en la X para eliminarla y subir otra</p>
          </div>
        </div>
      )}

      {!previewUrl && (
        <div
          className={disabled ? 'opacity-50 pointer-events-none' : ''}
          style={{ minHeight: height }}
        >
          <Dashboard
            uppy={uppy}
            height={height}
            width="100%"
            hideUploadButton
            proudlyDisplayPoweredByUppy={false}
            note={helpText}
            locale={{
              strings: {
                dropPasteFiles: window.innerWidth < 768 ? '%{browseFiles}' : '%{browseFiles} o arrastra aquí',
                browseFiles: 'Selecciona archivos',
              },
            }}
          />
        </div>
      )}

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  )
}

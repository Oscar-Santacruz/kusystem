import axios from 'axios'
import { getEnv } from '@/config/env'

/**
 * Sube el logo de una organización al servicio interno de archivos.
 * Endpoint esperado (PUT multipart/form-data):
 *   /api/files/kusystem/{slug}/logo.png
 * Campo del form: "file"
 *
 * Retorna la key utilizada, p. ej.: "kusystem/{slug}/logo.png"
 */
export async function uploadOrgLogo(slug: string, file: File | Blob): Promise<string> {
  const { VITE_FILES_BASE_URL } = getEnv()
  const base = VITE_FILES_BASE_URL || 'http://localhost:3000'
  const key = `kusystem/${encodeURIComponent(slug)}/logo.png`
  const url = `${base}/api/files/${key}`

  const fd = new FormData()
  fd.append('file', file)

  await axios.put(url, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  // Devolvemos la key (sin encode) como referencia para backend
  return `kusystem/${slug}/logo.png`
}

import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.STORAGE_PATH ?? './uploads'

/**
 * Speichert eine Datei lokal.
 * Dateiname: UUID + bereingte Extension — kein Nutzer-Input im Pfad.
 * Gibt storageKey (interner Pfad) und storageUrl (HTTP-Pfad) zurück.
 */
export async function saveFile(
  buffer: Buffer,
  subdir: 'images' | 'documents' | 'gpx',
  originalFilename: string,
): Promise<{ storageKey: string; storageUrl: string }> {
  const rawExt = path.extname(originalFilename).toLowerCase()
  const ext = /^\.[a-z0-9]+$/.test(rawExt) ? rawExt : ''
  const storageKey = `${subdir}/${randomUUID()}${ext}`
  const fullPath = path.join(UPLOAD_DIR, storageKey)

  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)

  return { storageKey, storageUrl: `/uploads/${storageKey}` }
}

/**
 * Löscht eine Datei. Ignoriert Fehler wenn Datei bereits weg ist.
 */
export async function removeFile(storageKey: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, storageKey)
  await fs.unlink(fullPath).catch(() => {})
}

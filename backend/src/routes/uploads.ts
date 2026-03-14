import { Hono } from 'hono'
import type { Context } from 'hono'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireOwner } from '../middleware/auth.js'
import { saveFile, removeFile } from '../lib/storage.js'
import type { HonoEnv } from '../index.js'
import type { MediaType } from '@prisma/client'

// ── Konfiguration je Medientyp ────────────────────────────────────────────

const CONFIGS = {
  images: {
    mediaType: 'IMAGE' as MediaType,
    subdir: 'images' as const,
    // HEIC/HEIF: iPhone-Originalformat
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    maxBytes: 20 * 1024 * 1024,   // 20 MB
  },
  documents: {
    mediaType: 'PDF' as MediaType,
    subdir: 'documents' as const,
    allowedMimes: ['application/pdf'],
    maxBytes: 50 * 1024 * 1024,   // 50 MB
    // Erweiterbar um 'application/msword', 'application/vnd.openxmlformats-...' wenn nötig
  },
  gpx: {
    mediaType: 'GPX' as MediaType,
    subdir: 'gpx' as const,
    // Browser senden je nach OS unterschiedliche MIME-Types für GPX
    allowedMimes: ['application/gpx+xml', 'application/xml', 'text/xml', 'text/plain'],
    maxBytes: 10 * 1024 * 1024,   // 10 MB
  },
} as const

const visibilityEnum = z.enum(['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC'])

export const uploadRoutes = new Hono<HonoEnv>()

// ── Gemeinsamer Handler ───────────────────────────────────────────────────

async function handleUpload(
  c: Context<HonoEnv>,
  config: typeof CONFIGS[keyof typeof CONFIGS],
) {
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    return c.json({ error: 'Ungültige Multipart-Daten' }, 400)
  }

  const file       = form.get('file')
  const tripId     = form.get('tripId')?.toString()
  const dayId      = form.get('dayId')?.toString() || undefined
  const rawVis     = form.get('visibility')?.toString() ?? 'PRIVATE'

  if (!(file instanceof File))  return c.json({ error: 'Keine Datei übermittelt' }, 400)
  if (!tripId)                  return c.json({ error: 'tripId fehlt' }, 400)

  const visResult = visibilityEnum.safeParse(rawVis)
  if (!visResult.success)       return c.json({ error: 'Ungültige Sichtbarkeit' }, 400)

  // Dateityp-Whitelist
  if (!config.allowedMimes.includes(file.type as string)) {
    return c.json({ error: `Dateityp nicht erlaubt: ${file.type}` }, 415)
  }

  // Maximalgröße
  if (file.size > config.maxBytes) {
    const mb = Math.round(config.maxBytes / 1024 / 1024)
    return c.json({ error: `Datei zu groß (max. ${mb} MB)` }, 413)
  }

  // Trip existiert + Owner
  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } })
  if (!trip)                           return c.json({ error: 'Trip nicht gefunden' }, 404)
  if (trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  // Day gehört zum Trip
  if (dayId) {
    const day = await db.day.findFirst({ where: { id: dayId, tripId }, select: { id: true } })
    if (!day) return c.json({ error: 'Day nicht gefunden oder gehört nicht zu diesem Trip' }, 400)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { storageKey, storageUrl } = await saveFile(buffer, config.subdir, file.name)

  const media = await db.media.create({
    data: {
      type:       config.mediaType,
      filename:   file.name,
      storageKey,
      storageUrl,
      mimeType:   file.type,
      size:       file.size,
      tripId,
      dayId:      dayId ?? null,
      visibility: visResult.data,
    },
  })

  return c.json(media, 201)
}

// ── Endpunkte ─────────────────────────────────────────────────────────────

uploadRoutes.post('/images',    requireOwner, (c) => handleUpload(c, CONFIGS.images))
uploadRoutes.post('/documents', requireOwner, (c) => handleUpload(c, CONFIGS.documents))
uploadRoutes.post('/gpx',       requireOwner, (c) => handleUpload(c, CONFIGS.gpx))

// DELETE /uploads/:id — löscht Datei + DB-Eintrag
uploadRoutes.delete('/:id', requireOwner, async (c) => {
  const media = await db.media.findFirst({
    where: { id: c.req.param('id') },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!media)                          return c.json({ error: 'Nicht gefunden' }, 404)
  if (media.trip?.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await removeFile(media.storageKey)
  await db.media.delete({ where: { id: media.id } })
  return c.body(null, 204)
})

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireOwner } from '../middleware/auth.js'
import { visibilityFilter } from '../lib/visibility.js'
import type { HonoEnv } from '../index.js'

const visibilityEnum = z.enum(['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC'])

const createSchema = z.object({
  date:       z.string().date(),           // YYYY-MM-DD
  title:      z.string().max(200).optional(),
  summary:    z.string().optional(),
  stageId:    z.string().optional(),
  visibility: visibilityEnum.default('PRIVATE'),
})

const updateSchema = createSchema.partial()

export const dayRoutes = new Hono<HonoEnv>()

// GET /trips/:tripId/days  — optional ?stageId=
dayRoutes.get('/:tripId/days', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const tripId = c.req.param('tripId')
  const stageId = c.req.query('stageId')

  const trip = await db.trip.findFirst({
    where: { id: tripId, visibility: { in: allowed } },
    select: { id: true },
  })
  if (!trip) return c.json({ error: 'Nicht gefunden' }, 404)

  const days = await db.day.findMany({
    where: {
      tripId,
      visibility: { in: allowed },
      ...(stageId ? { stageId } : {}),
    },
    orderBy: { date: 'asc' },
    select: {
      id: true, date: true, title: true, summary: true,
      stageId: true, visibility: true,
      _count: { select: { media: true, notes: true } },
    },
  })
  return c.json(days)
})

// POST /trips/:tripId/days
dayRoutes.post('/:tripId/days', requireOwner, zValidator('json', createSchema), async (c) => {
  const tripId = c.req.param('tripId')
  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } })
  if (!trip) return c.json({ error: 'Nicht gefunden' }, 404)
  if (trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const data = c.req.valid('json')

  // stageId auf Zugehörigkeit zum Trip prüfen
  if (data.stageId) {
    const stage = await db.stage.findFirst({ where: { id: data.stageId, tripId }, select: { id: true } })
    if (!stage) return c.json({ error: 'Stage gehört nicht zu dieser Reise' }, 400)
  }

  const day = await db.day.create({
    data: { ...data, tripId, date: new Date(data.date) },
  })
  return c.json(day, 201)
})

// GET /trips/:tripId/days/:id
dayRoutes.get('/:tripId/days/:id', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const { tripId, id } = c.req.param()

  const day = await db.day.findFirst({
    where: { id, tripId, visibility: { in: allowed } },
    include: {
      notes: {
        where: { visibility: { in: allowed } },
        orderBy: { createdAt: 'asc' },
      },
      locations: {
        where: { visibility: { in: allowed } },
        orderBy: { createdAt: 'asc' },
      },
      bookings: {
        where: { visibility: { in: allowed } },
        orderBy: { createdAt: 'asc' },
      },
      media: {
        where: { visibility: { in: allowed } },
        orderBy: { order: 'asc' },
        select: {
          id: true, type: true, filename: true,
          storageUrl: true, thumbnailUrl: true,
          visibility: true, order: true, createdAt: true,
        },
      },
      stage: { select: { id: true, title: true } },
    },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  return c.json(day)
})

// PATCH /trips/:tripId/days/:id
dayRoutes.patch('/:tripId/days/:id', requireOwner, zValidator('json', updateSchema), async (c) => {
  const { tripId, id } = c.req.param()
  const day = await db.day.findFirst({
    where: { id, tripId },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  if (day.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const data = c.req.valid('json')

  if (data.stageId) {
    const stage = await db.stage.findFirst({ where: { id: data.stageId, tripId }, select: { id: true } })
    if (!stage) return c.json({ error: 'Stage gehört nicht zu dieser Reise' }, 400)
  }

  const updated = await db.day.update({
    where: { id },
    data: { ...data, ...(data.date ? { date: new Date(data.date) } : {}) },
  })
  return c.json(updated)
})

// DELETE /trips/:tripId/days/:id
dayRoutes.delete('/:tripId/days/:id', requireOwner, async (c) => {
  const { tripId, id } = c.req.param()
  const day = await db.day.findFirst({
    where: { id, tripId },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  if (day.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await db.day.delete({ where: { id } })
  return c.body(null, 204)
})

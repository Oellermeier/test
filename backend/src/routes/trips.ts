import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireOwner } from '../middleware/auth.js'
import { visibilityFilter } from '../lib/visibility.js'
import type { HonoEnv } from '../index.js'

const visibilityEnum = z.enum(['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC'])

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().optional(),
  startDate:   z.string().datetime({ offset: true }).optional(),
  endDate:     z.string().datetime({ offset: true }).optional(),
  visibility:  visibilityEnum.default('PRIVATE'),
})

const updateSchema = createSchema.partial()

export const tripRoutes = new Hono<HonoEnv>()

// GET /trips
tripRoutes.get('/', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const trips = await db.trip.findMany({
    where: { visibility: { in: allowed } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, description: true,
      startDate: true, endDate: true, visibility: true, createdAt: true,
      _count: { select: { days: true, stages: true } },
    },
  })
  return c.json(trips)
})

// POST /trips
tripRoutes.post('/', requireOwner, zValidator('json', createSchema), async (c) => {
  const trip = await db.trip.create({
    data: { ...c.req.valid('json'), ownerId: c.var.user!.id },
  })
  return c.json(trip, 201)
})

// GET /trips/:id
tripRoutes.get('/:id', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const trip = await db.trip.findFirst({
    where: { id: c.req.param('id'), visibility: { in: allowed } },
    include: {
      stages: {
        where: { visibility: { in: allowed } },
        orderBy: { order: 'asc' },
      },
      days: {
        where: { visibility: { in: allowed } },
        orderBy: { date: 'asc' },
        select: {
          id: true, date: true, title: true, summary: true,
          stageId: true, visibility: true,
          _count: { select: { media: true, notes: true } },
        },
      },
    },
  })
  if (!trip) return c.json({ error: 'Nicht gefunden' }, 404)
  return c.json(trip)
})

// PATCH /trips/:id
tripRoutes.patch('/:id', requireOwner, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')
  const existing = await db.trip.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing) return c.json({ error: 'Nicht gefunden' }, 404)
  if (existing.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const updated = await db.trip.update({ where: { id }, data: c.req.valid('json') })
  return c.json(updated)
})

// DELETE /trips/:id
tripRoutes.delete('/:id', requireOwner, async (c) => {
  const id = c.req.param('id')
  const existing = await db.trip.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing) return c.json({ error: 'Nicht gefunden' }, 404)
  if (existing.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await db.trip.delete({ where: { id } })
  return c.body(null, 204)
})

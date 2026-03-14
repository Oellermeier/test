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
  order:       z.number().int().min(0).default(0),
  startDate:   z.string().datetime({ offset: true }).optional(),
  endDate:     z.string().datetime({ offset: true }).optional(),
  visibility:  visibilityEnum.default('PRIVATE'),
})

const updateSchema = createSchema.partial()

export const stageRoutes = new Hono<HonoEnv>()

// GET /trips/:tripId/stages
stageRoutes.get('/:tripId/stages', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const tripId = c.req.param('tripId')

  const trip = await db.trip.findFirst({
    where: { id: tripId, visibility: { in: allowed } },
    select: { id: true },
  })
  if (!trip) return c.json({ error: 'Nicht gefunden' }, 404)

  const stages = await db.stage.findMany({
    where: { tripId, visibility: { in: allowed } },
    orderBy: { order: 'asc' },
    select: {
      id: true, title: true, description: true,
      order: true, startDate: true, endDate: true, visibility: true,
      _count: { select: { days: true } },
    },
  })
  return c.json(stages)
})

// POST /trips/:tripId/stages
stageRoutes.post('/:tripId/stages', requireOwner, zValidator('json', createSchema), async (c) => {
  const tripId = c.req.param('tripId')
  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } })
  if (!trip) return c.json({ error: 'Nicht gefunden' }, 404)
  if (trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const stage = await db.stage.create({ data: { ...c.req.valid('json'), tripId } })
  return c.json(stage, 201)
})

// GET /trips/:tripId/stages/:id
stageRoutes.get('/:tripId/stages/:id', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const { tripId, id } = c.req.param()

  const stage = await db.stage.findFirst({
    where: { id, tripId, visibility: { in: allowed } },
    include: {
      days: {
        where: { visibility: { in: allowed } },
        orderBy: { date: 'asc' },
        select: {
          id: true, date: true, title: true, summary: true, visibility: true,
          _count: { select: { media: true, notes: true } },
        },
      },
    },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  return c.json(stage)
})

// PATCH /trips/:tripId/stages/:id
stageRoutes.patch('/:tripId/stages/:id', requireOwner, zValidator('json', updateSchema), async (c) => {
  const { tripId, id } = c.req.param()
  const stage = await db.stage.findFirst({
    where: { id, tripId },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  if (stage.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const updated = await db.stage.update({ where: { id }, data: c.req.valid('json') })
  return c.json(updated)
})

// DELETE /trips/:tripId/stages/:id
stageRoutes.delete('/:tripId/stages/:id', requireOwner, async (c) => {
  const { tripId, id } = c.req.param()
  const stage = await db.stage.findFirst({
    where: { id, tripId },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  if (stage.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await db.stage.delete({ where: { id } })
  return c.body(null, 204)
})

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireOwner } from '../middleware/auth.js'
import { visibilityFilter } from '../lib/visibility.js'
import type { HonoEnv } from '../index.js'

const visibilityEnum = z.enum(['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC'])

const createSchema = z.object({
  tripId:      z.string().uuid(),
  title:       z.string().min(1).max(200),
  description: z.string().optional(),
  order:       z.number().int().min(0).default(0),
  startDate:   z.string().datetime({ offset: true }).optional(),
  endDate:     z.string().datetime({ offset: true }).optional(),
  visibility:  visibilityEnum.default('PRIVATE'),
})

const updateSchema = createSchema.omit({ tripId: true }).partial()

const listQuery = z.object({
  tripId: z.string().uuid(),
  limit:  z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const stageRoutes = new Hono<HonoEnv>()

// GET /stages?tripId=
stageRoutes.get('/', zValidator('query', listQuery), async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const { tripId, limit, offset } = c.req.valid('query')

  // Sicherstellen, dass der Trip für den Nutzer sichtbar ist
  const trip = await db.trip.findFirst({
    where: { id: tripId, visibility: { in: allowed } },
    select: { id: true },
  })
  if (!trip) return c.json({ error: 'Trip nicht gefunden' }, 404)

  const [items, total] = await Promise.all([
    db.stage.findMany({
      where: { tripId, visibility: { in: allowed } },
      orderBy: { order: 'asc' },
      take: limit,
      skip: offset,
      select: {
        id: true, title: true, description: true,
        order: true, startDate: true, endDate: true, visibility: true,
        _count: { select: { days: true } },
      },
    }),
    db.stage.count({ where: { tripId, visibility: { in: allowed } } }),
  ])
  return c.json({ items, total, limit, offset })
})

// POST /stages
stageRoutes.post('/', requireOwner, zValidator('json', createSchema), async (c) => {
  const { tripId, ...data } = c.req.valid('json')
  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } })
  if (!trip) return c.json({ error: 'Trip nicht gefunden' }, 404)
  if (trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const stage = await db.stage.create({ data: { ...data, tripId } })
  return c.json(stage, 201)
})

// GET /stages/:id
stageRoutes.get('/:id', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const stage = await db.stage.findFirst({
    where: { id: c.req.param('id'), visibility: { in: allowed } },
    include: {
      days: {
        where: { visibility: { in: allowed } },
        orderBy: [{ position: 'asc' }, { date: 'asc' }],
        select: {
          id: true, date: true, title: true, summary: true,
          status: true, position: true, visibility: true,
          _count: { select: { media: true, notes: true } },
        },
      },
    },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  return c.json(stage)
})

// PATCH /stages/:id
stageRoutes.patch('/:id', requireOwner, zValidator('json', updateSchema), async (c) => {
  const stage = await db.stage.findFirst({
    where: { id: c.req.param('id') },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  if (stage.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const updated = await db.stage.update({ where: { id: c.req.param('id') }, data: c.req.valid('json') })
  return c.json(updated)
})

// DELETE /stages/:id
stageRoutes.delete('/:id', requireOwner, async (c) => {
  const stage = await db.stage.findFirst({
    where: { id: c.req.param('id') },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!stage) return c.json({ error: 'Nicht gefunden' }, 404)
  if (stage.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await db.stage.delete({ where: { id: c.req.param('id') } })
  return c.body(null, 204)
})

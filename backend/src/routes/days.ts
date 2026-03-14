import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { requireOwner } from '../middleware/auth.js'
import { visibilityFilter } from '../lib/visibility.js'
import type { HonoEnv } from '../index.js'

const visibilityEnum = z.enum(['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC'])
const statusEnum = z.enum(['PLANNED', 'ACTIVE', 'DONE'])

const createSchema = z.object({
  tripId:     z.string().uuid(),
  date:       z.string().date(),           // YYYY-MM-DD
  title:      z.string().max(200).optional(),
  summary:    z.string().optional(),
  status:     statusEnum.default('PLANNED'),
  stageId:    z.string().uuid().optional(),
  position:   z.number().int().min(0).optional(),
  visibility: visibilityEnum.default('PRIVATE'),
})

const updateSchema = createSchema.omit({ tripId: true }).partial()

const listQuery = z.object({
  tripId:  z.string().uuid(),
  stageId: z.string().uuid().optional(),
  status:  statusEnum.optional(),
  limit:   z.coerce.number().int().min(1).max(100).default(50),
  offset:  z.coerce.number().int().min(0).default(0),
})

export const dayRoutes = new Hono<HonoEnv>()

// GET /days?tripId=&stageId=&status=&limit=&offset=
dayRoutes.get('/', zValidator('query', listQuery), async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const { tripId, stageId, status, limit, offset } = c.req.valid('query')

  const trip = await db.trip.findFirst({
    where: { id: tripId, visibility: { in: allowed } },
    select: { id: true },
  })
  if (!trip) return c.json({ error: 'Trip nicht gefunden' }, 404)

  const where = {
    tripId,
    visibility: { in: allowed },
    ...(stageId ? { stageId } : {}),
    ...(status  ? { status  } : {}),
  }

  const [items, total] = await Promise.all([
    db.day.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
      select: {
        id: true, date: true, title: true, summary: true,
        status: true, stageId: true, position: true, visibility: true,
        _count: { select: { media: true, notes: true } },
      },
    }),
    db.day.count({ where }),
  ])
  return c.json({ items, total, limit, offset })
})

// POST /days
dayRoutes.post('/', requireOwner, zValidator('json', createSchema), async (c) => {
  const { tripId, stageId, date, ...rest } = c.req.valid('json')

  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } })
  if (!trip) return c.json({ error: 'Trip nicht gefunden' }, 404)
  if (trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  if (stageId) {
    const stage = await db.stage.findFirst({ where: { id: stageId, tripId }, select: { id: true } })
    if (!stage) return c.json({ error: 'Stage gehört nicht zu diesem Trip' }, 400)
  }

  const day = await db.day.create({
    data: { ...rest, tripId, stageId, date: new Date(date) },
  })
  return c.json(day, 201)
})

// GET /days/:id
dayRoutes.get('/:id', async (c) => {
  const allowed = visibilityFilter(c.var.user?.role)
  const day = await db.day.findFirst({
    where: { id: c.req.param('id'), visibility: { in: allowed } },
    include: {
      stage:    { select: { id: true, title: true } },
      notes:    { where: { visibility: { in: allowed } }, orderBy: { createdAt: 'asc' } },
      locations:{ where: { visibility: { in: allowed } }, orderBy: { createdAt: 'asc' } },
      bookings: { where: { visibility: { in: allowed } }, orderBy: { createdAt: 'asc' } },
      media: {
        where: { visibility: { in: allowed } },
        orderBy: { order: 'asc' },
        select: {
          id: true, type: true, filename: true,
          storageUrl: true, thumbnailUrl: true,
          visibility: true, order: true, createdAt: true,
        },
      },
    },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  return c.json(day)
})

// PATCH /days/:id
dayRoutes.patch('/:id', requireOwner, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')
  const day = await db.day.findFirst({
    where: { id },
    include: { trip: { select: { ownerId: true, id: true } } },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  if (day.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  const { stageId, date, ...rest } = c.req.valid('json')

  if (stageId !== undefined) {
    if (stageId !== null) {
      const stage = await db.stage.findFirst({ where: { id: stageId, tripId: day.tripId }, select: { id: true } })
      if (!stage) return c.json({ error: 'Stage gehört nicht zu diesem Trip' }, 400)
    }
  }

  const updated = await db.day.update({
    where: { id },
    data: {
      ...rest,
      ...(stageId !== undefined ? { stageId } : {}),
      ...(date ? { date: new Date(date) } : {}),
    },
  })
  return c.json(updated)
})

// DELETE /days/:id
dayRoutes.delete('/:id', requireOwner, async (c) => {
  const id = c.req.param('id')
  const day = await db.day.findFirst({
    where: { id },
    include: { trip: { select: { ownerId: true } } },
  })
  if (!day) return c.json({ error: 'Nicht gefunden' }, 404)
  if (day.trip.ownerId !== c.var.user!.id) return c.json({ error: 'Kein Zugriff' }, 403)

  await db.day.delete({ where: { id } })
  return c.body(null, 204)
})

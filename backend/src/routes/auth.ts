import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '../lib/db.js'
import { signToken, COOKIE_NAME, JWT_EXPIRES_IN } from '../middleware/auth.js'
import type { HonoEnv } from '../index.js'

export const authRoutes = new Hono<HonoEnv>()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /auth/login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return c.json({ error: 'Ungültige Anmeldedaten' }, 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ error: 'Ungültige Anmeldedaten' }, 401)

  const token = signToken({ userId: user.id, role: user.role })

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
    path: '/',
  })

  return c.json({ id: user.id, name: user.name, role: user.role })
})

// POST /auth/logout
authRoutes.post('/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
  return c.json({ ok: true })
})

// GET /auth/me — aktuellen User zurückgeben (für Frontend-Hydration)
authRoutes.get('/me', (c) => {
  const user = c.var.user
  if (!user) return c.json({ user: null })
  return c.json({ user })
})

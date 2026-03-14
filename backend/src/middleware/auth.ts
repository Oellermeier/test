import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import type { UserRole } from '@prisma/client'
import type { HonoEnv } from '../index.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
export const COOKIE_NAME = 'travel_token'
export const JWT_EXPIRES_IN = '30d'

export type JwtPayload = { userId: string; role: UserRole }

/**
 * Liest JWT aus Cookie — setzt c.var.user wenn gültig, sonst null.
 * Kein Fehler bei fehlendem Token (erlaubt öffentliche Routen).
 */
export const authenticate = createMiddleware<HonoEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME)
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
      c.set('user', { id: payload.userId, role: payload.role })
    } catch {
      // Ungültiger Token → kein User, kein Fehler
    }
  }
  await next()
})

/**
 * Schützt Routen: Nutzer muss authentifiziert sein.
 */
export const requireAuth = createMiddleware<HonoEnv>(async (c, next) => {
  if (!c.var.user) return c.json({ error: 'Nicht angemeldet' }, 401)
  await next()
})

/**
 * Schützt Owner-Routen: Nur der Reisende selbst darf schreiben.
 */
export const requireOwner = createMiddleware<HonoEnv>(async (c, next) => {
  if (!c.var.user) return c.json({ error: 'Nicht angemeldet' }, 401)
  if (c.var.user.role !== 'OWNER') return c.json({ error: 'Kein Zugriff' }, 403)
  await next()
})

/**
 * Erstellt ein JWT für den gegebenen User.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

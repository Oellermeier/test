import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import type { UserRole } from '@prisma/client'
import { serveStatic } from '@hono/node-server/serve-static'
import { authenticate } from './middleware/auth.js'
import { authRoutes } from './routes/auth.js'
import { tripRoutes } from './routes/trips.js'
import { stageRoutes } from './routes/stages.js'
import { dayRoutes } from './routes/days.js'
import { uploadRoutes } from './routes/uploads.js'

// Hono-Context-Typen — einmal definiert, überall verfügbar
export type HonoEnv = {
  Variables: {
    user: { id: string; role: UserRole } | null
  }
}

const app = new Hono<HonoEnv>()

// ─── Globale Middleware ───────────────────────────────────────────────────────

app.use('*', logger())

app.use('*', cors({
  origin: [
    process.env.APP_ORIGIN ?? 'http://localhost:3001',
    process.env.SITE_ORIGIN ?? 'http://localhost:3002',
  ],
  credentials: true, // notwendig für Cookie-basierte Auth
}))

// authenticate läuft global — setzt c.var.user wenn Token vorhanden
app.use('*', authenticate)

// ─── Routen ──────────────────────────────────────────────────────────────────

app.route('/auth', authRoutes)
app.route('/trips',   tripRoutes)
app.route('/stages',  stageRoutes)
app.route('/days',    dayRoutes)
app.route('/uploads', uploadRoutes)

// Statische Auslieferung hochgeladener Dateien (Dev: Node.js, Prod: nginx)
// Root = Arbeitsverzeichnis des Backend-Prozesses; /uploads/* → ./uploads/*
app.use('/uploads/*', serveStatic({ root: './' }))

app.get('/', (c) => c.json({ status: 'ok', version: '0.1.0' }))

// ─── Start ───────────────────────────────────────────────────────────────────

const port = parseInt(process.env.PORT ?? '3000', 10)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Backend läuft auf http://localhost:${port}`)
})

export default app

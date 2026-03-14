# Changelog

Format: `[YYYY-MM-DD] AP-XX — Beschreibung`

---

## [2026-03-14] AP-01 — Projektstruktur & Dokumentation

**Erledigt:**
- Verzeichnisstruktur angelegt (backend, frontend-app, frontend-site, shared, docs, scripts, infra)
- README.md erstellt
- PROJECT_STATUS.md erstellt
- CHANGELOG.md erstellt
- docs/architecture.md erstellt
- docs/mvp-scope.md erstellt
- docs/data-model.md erstellt
- docs/roles-and-visibility.md erstellt
- docs/decisions/ADR-001-tech-stack.md erstellt

**Entscheidungen:**
- Monorepo-Struktur ohne Monorepo-Tool (einfachste Variante für Start)
- Prisma als ORM gewählt (typsicher, migrations-fähig, gut zu Next.js)
- Next.js für beide Frontends (unterschiedliche Deployments)
- PostgreSQL als Datenbank

---

## [2026-03-14] AP-06 — Upload-API (Bild, PDF, GPX)

**Neu:**
- `lib/storage.ts`: `saveFile()` + `removeFile()` — lokal, UUID-basierte Dateinamen
- `routes/uploads.ts`: POST /uploads/images|documents|gpx, DELETE /uploads/:id
- Gemeinsamer `handleUpload()` mit CONFIGS-Objekt je Typ (kein Duplikat-Code)
- Validierung: MIME-Whitelist, Maximalgröße, Trip-Ownership, Day-Zugehörigkeit
- `index.ts`: uploadRoutes gemountet + `serveStatic` für `/uploads/*`

**Limits:** Images 20 MB, Dokumente 50 MB, GPX 10 MB

**Kleine Nachschärfungen:**
- `shared/types`: Media-Interface vollständig (storageKey, mimeType, size, tripId, dayId)
- `docs/architecture.md`: Upload-Strategie + Date-Handling dokumentiert

---

## [2026-03-14] AP-05 (rev2) — CRUD Trip/Stage/Day, UUID, flat routes, pagination

**Änderungen gegenüber rev1:**
- Alle IDs: `cuid()` → `uuid()` (sicherer für öffentliche URLs, kein Sequenz-Leak)
- Routen: nested → flat (`/stages?tripId=`, `/days?tripId=`)
- `Day`: `status` (PLANNED/ACTIVE/DONE) und `position` (Int?) ergänzt
- Pagination auf allen List-Endpunkten: `limit`/`offset` + `total` in Response
- `status`-Filter auf GET /days ergänzt
- `shared/types`: `DayStatus`, `DaySummary.status`, `DaySummary.position`

---

## [2026-03-14] AP-05 (rev1) — CRUD-Routen Trip, Stage, Day (ersetzt)

**Erledigt:**
- `routes/trips.ts`: GET/POST /trips, GET/PATCH/DELETE /trips/:id
- `routes/stages.ts`: GET/POST /trips/:tripId/stages, GET/PATCH/DELETE /trips/:tripId/stages/:id
- `routes/days.ts`: GET/POST /trips/:tripId/days (?stageId), GET/PATCH/DELETE /trips/:tripId/days/:id
- Day-Detail inkludiert notes, locations, bookings, media (minimal), stage-Referenz
- `lib/visibility.ts`: `visibilityFilter()` und `canView()` akzeptieren nun `undefined|null`
- `index.ts`: neue Routen gemountet

**Entscheidungen:**
- Keine Service-Schicht — direkte Prisma-Queries in Routen
- Ownership-Check für Stage/Day via `include: { trip: { select: { ownerId } } }` (kein N+1)
- Stage-Zugehörigkeit zu Trip wird beim Day-Create/-Update validiert
- Sortierung: Trips by createdAt desc, Stages by order asc, Days by date asc

---

## [2026-03-14] AP-04 — Hono-Grundgerüst + Auth + Visibility

**Erledigt:**
- `backend/src/index.ts`: Hono-App mit CORS, Logger, globalem `authenticate`-Middleware
- `backend/src/lib/db.ts`: Prisma-Singleton (Hot-Reload-sicher)
- `backend/src/lib/visibility.ts`: `canView()` + `visibilityFilter()` für Prisma-WHERE
- `backend/src/middleware/auth.ts`: `authenticate` / `requireAuth` / `requireOwner` + `signToken()`
- `backend/src/routes/auth.ts`: POST /auth/login, POST /auth/logout, GET /auth/me
- `shared/types/index.ts`: `canView()` und `VISIBILITY_LEVELS` entfernt (gehört ins Backend)
- `backend/package.json`: `@hono/zod-validator` ergänzt

**Entscheidungen:**
- Kein Refresh-Token im MVP (30-Tage JWT reicht für persönliches Projekt)
- `authenticate` läuft global, setzt `user` oder `null` — kein Fehler bei öffentlichen Routen
- `requireOwner` als separater Guard statt Logik in jeder Route

---

## [2026-03-14] AP-02 — Tech-Stack-Entscheidung

**Erledigt:**
- ADR-001 dokumentiert mit Begründungen und Alternativen

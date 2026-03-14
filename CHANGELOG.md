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

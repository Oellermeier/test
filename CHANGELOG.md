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

## [2026-03-14] AP-12 — Frontend-Site: Tagesdetail + Galerie + Family-Auth

**Neu/geändert (frontend-site/):**
- `src/types/api.ts`: StageItem, DayListItem, TripDetail, MediaItem, NoteItem, LocationItem, DayDetail
- `src/lib/api.ts`: `apiFetch()` akzeptiert optionale `extraHeaders`; `API_URL` exportiert
- `src/lib/viewer-auth.ts`: `familyHeaders()` + `isFamilyMember()` — liest `family_ok`-Cookie, gibt `travel_token`-Header zurück
- `src/lib/media.ts`: `mediaUrl()` — stellt API_URL voran (relative Backend-Pfade)
- `src/pages/reisen/[id]/index.astro`: Reisedetailseite — Etappen-Chips, chronologische Tagesliste mit Zusammenfassung
- `src/pages/reisen/[id]/tage/[dayId]/index.astro`: Tagesdetail im Tagebuch-Stil — Notizen, Bildgalerie, Orte (Maps-Link), Dateiblock, Breadcrumb, Zurück-Navigation
- `src/components/MediaGallery.astro`: Bildgitter (1/2/3-spaltig je Anzahl), klickbar auf Vollbild
- `src/pages/familie/index.astro`: Familienbereich — SSR-Formular-Handling, Login setzt httpOnly-Cookie, Logout löscht Cookie, kein JS nötig
- `src/layouts/BaseLayout.astro`: „Familie"-Link in Nav ergänzt
- `.env.example`: FAMILY_PASSWORD + FAMILY_JWT dokumentiert

**Entscheidungen:**
- Family-Auth ohne neuen Backend-Endpoint: FAMILY_JWT = einmalig generierter FAMILY_EXTENDED-Token im .env der Site — Backend-Visibilitätsfilter läuft unverändert
- Kein Client-JS für die gesamte Family-Auth — reines SSR-Formular
- Dokumente/GPX als Links statt iframe — minimalistisch, funktional
- Kein Lightbox-Framework — verlinktes Vollbild reicht für MVP

---

## [2026-03-14] AP-11 — Frontend-Site: Grundgerüst + Reiseübersicht (Astro)

**Neu (frontend-site/):**
- `package.json`: Astro 5, `@astrojs/node` (SSR standalone), `@astrojs/tailwind`, Tailwind v3
- `astro.config.mjs`: `output: 'server'`, Node-Adapter, Tailwind-Integration
- `tsconfig.json`: strict + `@/*`-Alias
- `.env.example`: `API_URL`-Konfiguration
- `src/lib/api.ts`: `apiFetch()` — server-side fetch, kein Cookie-Forwarding (nur PUBLIC)
- `src/lib/format.ts`: `formatDateLong()` + `formatDateRange()` in Deutsch
- `src/types/api.ts`: `TripListItem`, `PaginatedResponse<T>`
- `src/layouts/BaseLayout.astro`: Magazin-Layout (serif, stone-Palette, sticky Header, Footer)
- `src/components/TripCard.astro`: Magazin-Karte (Cover-Bild oder Platzhalter, Datum, Titel, Beschreibung, Tage-Count)
- `src/pages/index.astro`: Redirect → /reisen
- `src/pages/reisen/index.astro`: Reiseübersicht mit echten Backend-Daten, Empty State
- `public/favicon.svg`: amber-brauner Platzhalter

**Entscheidungen:**
- SSR (kein SSG) — Inhalte können sich ändern, kein Build-Trigger nötig
- Kein komplexes Auth-UI — nur PUBLIC-Daten; Family-Zugang kommt in AP-12
- Tailwind v3 statt v4 — `@astrojs/tailwind` unterstützt noch kein v4 ohne Konfigurationsaufwand
- Magazin-Ästhetik: Serif-Schrift, stone/amber-Palette, großzügige Whitespace-Nutzung — deutlich anders als die App

---

## [2026-03-14] AP-10 — Freigabe-Steuerung + PWA/Offline-Basis

**Freigabe (Day Visibility):**
- `components/days/VisibilityEditor.tsx`: Client Component — Chip zeigt aktuelle Visibility,
  Tap öffnet Inline-Picker, PATCH /api/days/:id, router.refresh() nach Erfolg
- `trips/[id]/days/[dayId]/page.tsx`: VisibilityEditor im Header-Bereich eingebunden

**PWA/Offline:**
- `public/sw.js`: Service Worker — Network First, besuchte Seiten gecacht, offline abrufbar;
  API + Uploads explizit ausgenommen; alte Cache-Versionen werden bei Aktivierung bereinigt
- `components/SwRegister.tsx`: Client Component — registriert SW nach Mount
- `app/layout.tsx`: SwRegister eingebunden
- `public/icons/icon.svg`: SVG-Platzhalter-Icon (blau, "R")
- `public/manifest.json`: SVG-Icon als Fallback ergänzt

---

## [2026-03-14] AP-09 — Upload-UI (Bild, PDF, GPX)

**Neu:**
- `app/(app)/upload/page.tsx`: Server Component — Trips SSR, gibt an UploadForm weiter
- `components/upload/UploadForm.tsx`: Client Component mit:
  - Datei-Dropzone (tap-freundlich, zeigt Typ-Badge nach Auswahl)
  - GPX-Erkennung primär per Extension (iOS-MIME-Varianz berücksichtigt)
  - Trip-Select (SSR-Daten), Day-Select (client-seitig nachgeladen bei Trip-Änderung)
  - Visibility-Picker als 2×2 Tap-Grid
  - Feedback-Zustände: uploading, success (6s), error mit Meldung
  - Formular-Reset nach Erfolg

---

## [2026-03-14] AP-08 — Reiseübersicht + Tagesansicht

**Neu (frontend-app/):**
- `lib/server-api.ts`: serverFetch() mit Cookie-Forwarding für Server Components
- `lib/format.ts`: formatDate/ShortDate/DateRange/todayISO — kein Date-Library
- `types/api.ts`: API-Response-Typen (TripListItem, TripDetail, DayListItem, DayDetail, …)
- `components/trips/TripCard.tsx`: Reisekarte mit Datum, Beschreibung, Tage-Count
- `components/days/DayCard.tsx`: Tag-Karte mit Datum, Status-Badge, Content-Count
- `app/(app)/trips/page.tsx`: Reiseübersicht mit echten Daten + Empty State
- `app/(app)/trips/[id]/page.tsx`: Reisedetail mit Etappen-Chips + Tagesliste
- `app/(app)/trips/[id]/days/[dayId]/page.tsx`: Tagesdetail (Notizen, Orte, Buchungen, Medien)
- `app/(app)/heute/page.tsx`: Aktiver Tag / nächster Tag mit Fallback

**AP-07 Nachschärfung:**
- `app/layout.tsx`: maximumScale entfernt (Nutzer-Zoom für Accessibility erlaubt)

---

## [2026-03-14] AP-07 — Frontend-App Grundgerüst

**Neu (frontend-app/):**
- `package.json`: Next.js 15, React 19, Tailwind v4, lucide-react
- `next.config.ts`: Rewrite-Proxy `/api/*` → Backend (löst CORS + Cookie-Domain)
- `public/manifest.json`: PWA-Manifest (standalone, theme-color, icon-refs)
- `app/layout.tsx`: Root-HTML mit PWA-Meta, apple-web-app, viewport fit=cover
- `app/page.tsx`: Redirect → /trips
- `app/login/page.tsx`: Login-Form (Client Component, fetch → /api/auth/login)
- `app/(app)/layout.tsx`: Auth-Guard (Server Component, Cookie → Backend-Check, OWNER only)
- `app/(app)/trips|heute|upload|mehr`: Placeholder-Seiten
- `app/(app)/mehr/page.tsx`: Logout-Funktion enthalten
- `components/BottomNav.tsx`: Mobile Bottom-Nav mit lucide-react Icons, safe-area-inset
- `globals.css`: Tailwind v4, tap-highlight, overscroll-behavior, min-tap-size 44px
- `lib/api.ts`: Fetch-Wrapper für Client Components (ApiError, 204-Handling)
- `.env.local.example`

**AP-06 Nachschärfung:**
- `.gitignore` (root): backend/uploads/ ausgeschlossen

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

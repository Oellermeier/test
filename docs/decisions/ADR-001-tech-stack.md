# ADR-001: Tech-Stack-Entscheidung

**Datum:** 2026-03-14
**Status:** Entschieden (bestätigt nach Architekturvergleich)
**Autor:** Claude (Lead Engineer) + Projektinhaber

---

## Kontext

Persönliches Reisemanagementsystem mit zwei getrennten UX-Oberflächen:
- **Reisenden-App** (Owner, mobil-first, PWA)
- **Zuschauer-Website** (Familie/Öffentlichkeit, magazinartig)

Leitprinzipien: wartungsarm, geringe Infrastrukturkosten, wenige bewegliche Teile,
klare Trennung der Verantwortlichkeiten, einfaches Deployment.

---

## Entschiedener Stack

### Backend: Hono (Node.js)

**Begründung:**
- Leichtgewichtig (~14 kB), TypeScript-nativ, kein Framework-Overhead
- Klare Backend-Grenze: kein Verwischen von "ist das Frontend oder Backend?"
- Middleware-System einfach und verständlich (Visibility-Check, Auth-Guard)
- Portierbar und testbar unabhängig von Next.js

**Alternativen verworfen:**
- Next.js API Routes: gut, aber Backend und App-Frontend im gleichen Build → verwischte Grenzen
- NestJS: mächtig, aber für persönliches Projekt überdimensioniert
- Express: zu minimal, wenig Struktur

**Risiken:**
- Kleinere Community als Express/NestJS, aber sehr aktiv und gut dokumentiert

---

### Datenbank: PostgreSQL + Prisma ORM

**Begründung:**
- PostgreSQL: robust, JSONB-fähig (für GPX-Metadaten, Buchungsinfos), kostenlos selbst hostbar
- Prisma: typsichere Queries, migrations-fähig, hervorragendes DX

**Alternativen verworfen:**
- SQLite: für MVP ausreichend, aber PostgreSQL ist bei gleichzeitigen Reads/Writes stabiler
  und erleichtert spätere Erweiterungen (Volltextsuche, JSONB-Queries)

---

### Frontend App: Next.js 15 (App Router)

**Begründung:**
- App Router: Server Components reduzieren JS-Bundle für mobile Nutzung
- PWA-Unterstützung via Service Worker
- TypeScript durchgehend, gleiche Sprache wie Backend

**Offline-Strategie (bewusst schlank):**
- Service Worker cacht: zuletzt geladene Tagesinfos, Navigationsstruktur, bereits geladene Bilder
- Kein vollständiger Offline-Sync, kein Background Sync im MVP
- Ausbaufähig, aber nicht Priorität

---

### Frontend Site: Astro

**Begründung:**
- Perfekt für Content-Seiten: zero JS by default, extrem schnell
- SSG für öffentliche Seiten (kein Server-Overhead), SSR für geschützte Bereiche
- Astro Islands für dynamische Teile (Kommentare, Login)
- Besseres SEO als Next.js für statische Inhalte

**Alternativen verworfen:**
- Next.js: möglich, aber für Content-lastige Website ist Astro die bessere Wahl
- Hugo/Jekyll: kein dynamisches Login/Kommentar möglich

---

### Authentifizierung: Hono + eigene JWT-Middleware

**Begründung:**
- Da Backend = Hono, kein NextAuth benötigt
- JWT in HTTP-only Cookie (sicher gegen XSS)
- Einfach, kontrollierbar, keine externe Abhängigkeit

**Implementierung:**
- Login-Endpoint im Hono-Backend
- JWT-Middleware schützt alle privaten Routen
- Beide Frontends nutzen dieselben Auth-Endpoints

---

### Medienstrategie: Lokal mit Abstraktionsschicht

**Entscheidung:** Lokaler Upload-Ordner im MVP.

**Abstraktionsschicht** von Anfang an:
```typescript
// storage/storage-provider.ts
interface StorageProvider {
  upload(file: Buffer, path: string, mimeType: string): Promise<string>
  getUrl(path: string): string
  delete(path: string): Promise<void>
}

// Konkrete Implementierungen:
class LocalStorageProvider implements StorageProvider { ... }
class R2StorageProvider implements StorageProvider { ... }  // später
```

Wechsel zu Cloudflare R2 (oder S3-kompatibel) später durch Tausch der
Implementierung — API bleibt unverändert.

**Vorteil:** 0€ Zusatzkosten im MVP, Migration ohne Backend-Änderungen.

---

### Hosting: Hetzner CX21 + Docker Compose

**Begründung:**
- ~6€/Monat für 4 GB RAM — ausreichend für alle 4 Container
- Volle Kontrolle, kein Vendor-Lock-in
- Docker Compose: einfaches lokales Development = Produktion
- Backup via Hetzner-Snapshots (~1€/Monat)

**Container-Setup:**
```
postgres      → Datenbank
backend       → Hono API (Port 3000)
frontend-app  → Next.js (Port 3001)
frontend-site → Astro (Port 3002, statisch via nginx)
nginx         → Reverse Proxy, SSL-Terminierung
```

**Laufende Kosten gesamt:** ~7–10 €/Monat

---

## Zusammenfassung

| Schicht | Technologie |
|---|---|
| Sprache | TypeScript (durchgehend) |
| Backend | Hono (Node.js) |
| ORM | Prisma |
| Datenbank | PostgreSQL |
| Frontend App | Next.js 15 (App Router, PWA) |
| Frontend Site | Astro (SSG/SSR) |
| Auth | JWT + HTTP-only Cookie (Hono-Middleware) |
| Medienspeicher | Lokal (Abstraktion für spätere Migration) |
| Deployment | Docker Compose / Hetzner VPS |
| Kosten MVP | ~7–10 €/Monat |

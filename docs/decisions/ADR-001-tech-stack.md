# ADR-001: Tech-Stack-Entscheidung

**Datum:** 2026-03-14
**Status:** Entschieden
**Autor:** Claude (Lead Engineer)

---

## Kontext

Wir benötigen einen Tech-Stack für:
- Ein gemeinsames Backend (API + Auth + Datenhaltung)
- Eine Reisenden-App (mobil-first, PWA, Offline)
- Eine Zuschauer-Website (magazinartig, SEO-relevant)

Anforderungen: wartbar, modern, kostenbewusst, gute mobile Unterstützung.

---

## Entscheidungen

### Backend: Next.js App Router (API Routes) + Prisma + PostgreSQL

**Begründung:**
- Next.js API Routes ermöglichen eine vollständige Backend-API ohne separaten Server
- Prisma bietet typsichere, migrierbare ORM-Schicht
- PostgreSQL ist robust, JSONB-fähig (für Metadaten), kostenlos selbst hostbar
- Einheitliche Sprache (TypeScript) im gesamten Stack

**Alternativen:**
- NestJS: mächtiger, aber deutlich mehr Overhead für diesen Scope
- Express: zu minimal, wenig Struktur
- Supabase: komfortabel, aber Vendor-Lock-in und Kosten bei Wachstum

**Risiken:**
- Next.js API Routes sind nicht ideal für sehr große APIs (kein eingebautes DI)
- Bei hoher Last müsste auf separaten Express/Hono-Server migriert werden

---

### Frontend-App: Next.js (PWA via next-pwa oder eigener Service Worker)

**Begründung:**
- Gleicher Stack wie Backend → Code-Sharing via `shared/`
- PWA-Unterstützung mit next-pwa oder manuell implementierbar
- App Router unterstützt offline-fähige Layouts
- Gute Mobile-Performance mit Server Components + Client Components

**Alternativen:**
- React Native: echte native App, aber massiv höherer Aufwand
- Expo: interessant für echte App-Store-Distribution, aber überdimensioniert für MVP
- SvelteKit: sehr schlank, aber kleineres Ökosystem

**Risiken:**
- PWA auf iOS (Safari) hat Einschränkungen (Push Notifications, Storage-Limits)
- Offline-Strategie muss früh konkret geplant werden

---

### Frontend-Site: Next.js (separates Deployment)

**Begründung:**
- Klare Trennung: zwei unabhängige Next.js-Apps
- SSG/ISR für öffentliche Seiten → SEO + Performance
- Gemeinsame Typen via `shared/`

**Alternativen:**
- Astro: sehr gut für Content-Seiten, aber weniger flexibel für dynamische Teile
- Nuxt.js: Vue-basiert, andere Sprache als Rest des Stacks

---

### Authentifizierung: NextAuth.js (Auth.js)

**Begründung:**
- Bewährt, gut dokumentiert, unterstützt Credentials + OAuth
- Integriert sich nahtlos in Next.js
- JWT + HTTP-only Cookies

**Alternativen:**
- Clerk: sehr komfortabel, aber Kosten bei Wachstum
- Custom JWT: mehr Kontrolle, aber mehr Wartungsaufwand

---

### Medienspeicher: Lokal (MVP) → S3-kompatibel (später)

**Begründung:**
- MVP: lokaler Upload-Ordner, einfach und kostenfrei
- Migration zu S3/Cloudflare R2 später ohne API-Änderung (Abstraktionsschicht)

---

### Deployment: Docker Compose (VPS)

**Begründung:**
- Volle Kontrolle, keine Vendor-Abhängigkeit
- Kostengünstig (1 VPS reicht für MVP)
- Einfache lokale Entwicklung

**Alternativen:**
- Vercel: sehr komfortabel für Next.js, aber Kosten + kein persistenter Storage
- Railway: komfortabel, moderate Kosten

---

## Zusammenfassung Stack

| Bereich | Technologie |
|---|---|
| Sprache | TypeScript |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Datenbank | PostgreSQL |
| Frontend App | Next.js + PWA |
| Frontend Site | Next.js (SSG/ISR) |
| Auth | NextAuth.js (Auth.js v5) |
| Medienspeicher | Lokal → S3-kompatibel |
| Deployment | Docker Compose / VPS |
| Shared | TypeScript types |

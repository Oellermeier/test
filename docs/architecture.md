# Architektur

## Systemübersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │   Reisenden-App     │    │   Zuschauer-Website     │    │
│  │   (frontend-app)    │    │   (frontend-site)       │    │
│  │                     │    │                         │    │
│  │  - PWA / mobil-first│    │  - Magazinartig         │    │
│  │  - Offline-Support  │    │  - Lesefreundlich       │    │
│  │  - Owner only       │    │  - Familie + Public     │    │
│  └─────────┬───────────┘    └────────────┬────────────┘    │
│            │                             │                  │
└────────────┼─────────────────────────────┼──────────────────┘
             │              API             │
             ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Auth   │  │  API Routes  │  │  Visibility-Check   │  │
│  │  (JWT)   │  │  (REST/tRPC) │  │  (Middleware)       │  │
│  └──────────┘  └──────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Services                            │  │
│  │  - TripService  - StageService  - DayService         │  │
│  │  - MediaService - CommentService                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────┐    ┌─────────────────────────────┐  │
│  │    PostgreSQL    │    │   Dateispeicher              │  │
│  │    (Prisma ORM)  │    │   (lokal / S3-kompatibel)   │  │
│  └──────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Kernprinzipien

1. **Getrennte Frontends** — App und Website sind verschiedene Next.js-Apps
2. **Gemeinsames Backend** — Eine API, eine Datenbank
3. **Visibility-First** — Sichtbarkeitslogik als Middleware, nicht als Nachgedanke
4. **Mobile-First** — App ist primär für iPhone/iPad konzipiert
5. **PWA-Grundlage** — Service Worker, Manifest, Offline-Cache von Anfang an einplanen

## Deployment-Konzept (MVP)

```
Docker Compose (lokal / VPS):
  - backend (Node.js/Next.js API)
  - frontend-app (Next.js)
  - frontend-site (Next.js)
  - postgres
  - (optional) nginx als Reverse Proxy
```

## Schnittstellen

- Backend stellt REST-API bereit
- Beide Frontends konsumieren dieselbe API
- Auth via JWT (HTTP-only Cookie)
- Medien-Upload via Multipart Form Data

## Upload-Strategie (MVP)

Lokale Speicherung unter `./uploads/{images,documents,gpx}/`.
- Dateiname im Storage: UUID + bereinigte Extension (kein Nutzer-Input im Pfad)
- Originalname in DB gespeichert (nur zur Anzeige)
- Auslieferung Dev: Node.js `serveStatic`; Prod: nginx direkt (kein Node.js-Overhead)
- Zukünftige Migration zu R2/S3: `saveFile()` + `removeFile()` in `lib/storage.ts` austauschen

Limits: Images 20 MB, Dokumente/PDFs 50 MB, GPX 10 MB.

## Date-Handling

`Day.date` wird als `YYYY-MM-DD` string vom Frontend gesendet und als `new Date(date)`
(UTC Midnight) in PostgreSQL `@db.Date` gespeichert. Frontends müssen konsistent
UTC-Dates senden (kein lokales Timezone-Offset). Für Reisedaten ohne Uhrzeitanteil ist
das unkritisch.

## Sicherheit

- Visibility-Check auf **jedem** API-Endpunkt
- Owner-Operationen (Schreiben, Freigabe) nur mit Owner-Role
- Zuschauer können nur lesen, gefiltert nach ihrer Sichtbarkeitsstufe

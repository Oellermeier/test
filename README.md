# Travel Project

Ein privates Reisemanagementsystem mit zwei getrennten Frontends auf gemeinsamer Datenbasis.

## Übersicht

| Frontend | Zielgruppe | Zweck |
|---|---|---|
| `frontend-app/` | Reisender (Owner) | Planung, Eingabe, Upload, Freigabe — mobil-first PWA |
| `frontend-site/` | Familie & Öffentlichkeit | Lesefreundliche Darstellung — magazinartig |

Gemeinsame Basis: `backend/` mit einheitlicher Datenbank, Auth und Sichtbarkeitslogik.

## Projektstruktur

```
travel-project/
├── backend/           # API, Auth, Upload, Datenbankschema
├── frontend-app/      # Reisenden-App (PWA, mobil-first)
├── frontend-site/     # Zuschauer-Website
├── shared/            # Geteilte Typen und Konstanten
├── docs/              # Architektur, ADRs, Datenmodell
├── scripts/           # Hilfsskripte
└── infra/             # Docker, Deployment
```

## Dokumentation

- [Architektur](docs/architecture.md)
- [MVP-Scope](docs/mvp-scope.md)
- [Datenmodell](docs/data-model.md)
- [Rollen & Sichtbarkeit](docs/roles-and-visibility.md)
- [Tech-Stack-Entscheidung](docs/decisions/ADR-001-tech-stack.md)

## Status

Siehe [PROJECT_STATUS.md](PROJECT_STATUS.md)

## Lokaler Start

**Voraussetzungen:** Node.js 20+, Docker

### Erster Start

```bash
# 1. Abhängigkeiten für alle Services installieren
npm install          # root (concurrently)
npm run install:all  # backend + frontend-app + frontend-site

# 2. Umgebungsvariablen anlegen
cp backend/.env.example backend/.env
cp frontend-app/.env.local.example frontend-app/.env.local
cp frontend-site/.env.example frontend-site/.env
# → Werte in den .env-Dateien anpassen (siehe Abschnitt "Umgebungsvariablen")

# 3. Datenbank starten
docker compose up -d  # startet nur PostgreSQL (root docker-compose.yml)

# 4. Datenbankschema anlegen
npm run db:migrate    # prisma migrate dev (erstellt Tabellen)

# 5. Testdaten einspielen (optional)
npm run db:seed

# 6. Alle Services starten
npm run dev:all
```

Danach erreichbar unter:

| Service | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Reisenden-App | http://localhost:3001 |
| Zuschauer-Website | http://localhost:3002 |

### Einzelne Services

```bash
npm run dev:backend   # nur Backend (Port 3000)
npm run dev:app       # nur Reisenden-App (Port 3001)
npm run dev:site      # nur Zuschauer-Website (Port 3002)
```

### Datenbank

```bash
npm run db:migrate    # Migration ausführen (nach Schema-Änderungen)
npm run db:seed       # Testdaten einspielen
npm run db:studio     # Prisma Studio öffnen (Datenbank-Browser)
```

### Umgebungsvariablen

**`backend/.env`** (aus `backend/.env.example`):

| Variable | Beschreibung | Standard |
|---|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindung | `postgresql://travel:dev_changeme@localhost:5432/traveldb` |
| `JWT_SECRET` | Token-Signing-Key | `dev-secret-change-in-production` |
| `PORT` | Backend-Port | `3000` |
| `APP_ORIGIN` | CORS für Reisenden-App | `http://localhost:3001` |
| `SITE_ORIGIN` | CORS für Zuschauer-Site | `http://localhost:3002` |
| `STORAGE_PATH` | Upload-Verzeichnis | `./uploads` |

**`frontend-app/.env.local`** (aus `frontend-app/.env.local.example`):

| Variable | Beschreibung |
|---|---|
| `API_URL` | Backend-URL für Server Components (direkt) |
| `NEXT_PUBLIC_API_URL` | Backend-URL für Client Components |

**`frontend-site/.env`** (aus `frontend-site/.env.example`):

| Variable | Beschreibung |
|---|---|
| `API_URL` | Backend-URL (server-seitig) |
| `FAMILY_PASSWORD` | Gemeinsames Passwort für Familienbereich |
| `FAMILY_JWT` | Langlebiger Backend-JWT mit Rolle `FAMILY_EXTENDED` |

> **`FAMILY_JWT` generieren:** Owner einloggen → Token aus Cookie `travel_token` kopieren → in `.env` eintragen.

### Produktion / Staging

Vollständiges Docker-Setup (alle Services als Container) in `infra/docker-compose.yml`.
Benötigt: `POSTGRES_PASSWORD`, `JWT_SECRET`, `FAMILY_PASSWORD` als Umgebungsvariablen oder `.env`-Datei.

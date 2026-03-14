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

## Entwicklung

Voraussetzungen: Node.js 20+, Docker

```bash
# Backend starten
cd backend && npm install && npm run dev

# App starten
cd frontend-app && npm install && npm run dev

# Website starten
cd frontend-site && npm install && npm run dev
```

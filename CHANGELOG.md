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

## [2026-03-14] AP-02 — Tech-Stack-Entscheidung

**Erledigt:**
- ADR-001 dokumentiert mit Begründungen und Alternativen

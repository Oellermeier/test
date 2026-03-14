# Project Status

Zuletzt aktualisiert: 2026-03-14

## Aktueller Stand

**Phase:** AP-01 abgeschlossen — Projektstruktur und Dokumentation

## Arbeitspakete

| AP | Bezeichnung | Status |
|---|---|---|
| AP-01 | Projektstruktur & Dokumentation | ✅ Erledigt |
| AP-02 | Tech-Stack-Entscheidung (ADR-001) | ✅ Erledigt |
| AP-03 | Datenbankschema (Prisma) | 🔜 Offen |
| AP-04 | Backend: Auth + Visibility-Middleware | 🔜 Offen |
| AP-05 | Backend: Reise/Etappen/Tages-API (CRUD) | 🔜 Offen |
| AP-06 | Backend: Upload-API (Bild, PDF, GPX) | 🔜 Offen |
| AP-07 | Frontend-App: Grundgerüst + Navigation | 🔜 Offen |
| AP-08 | Frontend-App: Reiseübersicht + Tagesansicht | 🔜 Offen |
| AP-09 | Frontend-App: Upload-Flows | 🔜 Offen |
| AP-10 | Frontend-App: Freigabe-Steuerung + PWA/Offline | 🔜 Offen |
| AP-11 | Frontend-Site: Grundgerüst + Reiseübersicht | 🔜 Offen |
| AP-12 | Frontend-Site: Tagesdetail + Galerie + Kommentare | 🔜 Offen |
| AP-13 | Integrations-Test + Review | 🔜 Offen |

## Bekannte Risiken

- Offline-Strategie für PWA muss früh konkretisiert werden (Service Worker Scope)
- Medienstrategie (lokaler Upload vs. externe Referenzen) beeinflusst Backend-Design
- Sichtbarkeitslogik muss auf beiden Frontends konsequent durchgesetzt werden

## Nächster Schritt

AP-03: Prisma-Schema definieren (Reise, Etappe, Tag, Medien, Sichtbarkeit)

# MVP-Scope

## Ziel des MVP

Ein funktionsfähiges System, das dem Reisenden erlaubt, Reisen zu verwalten und
ausgewählte Inhalte für Familie und Öffentlichkeit zu veröffentlichen.

## Im MVP enthalten

### Datenverwaltung
- [ ] Mehrere Reisen anlegen und verwalten
- [ ] Reise nach Etappen/Regionen strukturieren
- [ ] Reise nach Tagen strukturieren
- [ ] Verknüpfung Tag ↔ Etappe

### Reisenden-App (frontend-app)
- [ ] Login für Owner
- [ ] Reiseübersicht (Liste aller Reisen)
- [ ] Reisedetail mit Etappen und Tagen
- [ ] Tagesdetail mit Notizen
- [ ] Bild-Upload
- [ ] PDF/Dokument-Upload
- [ ] GPX-Upload
- [ ] Google Maps Links hinterlegen
- [ ] Buchungsinfos und Kontakte erfassen
- [ ] Sichtbarkeit pro Inhalt / Tag / Reise setzen
- [ ] PWA-Grundlage (Manifest, Service Worker)
- [ ] Basis-Offline: Tagesinfos cachen

### Zuschauer-Website (frontend-site)
- [ ] Öffentliche Reiseübersicht
- [ ] Tagesdetailseite
- [ ] Bildergalerie
- [ ] Kommentare (für angemeldete Zuschauer)
- [ ] Login für Familienmitglieder
- [ ] Gefilterte Anzeige nach Sichtbarkeitsstufe

### Auth & Rechte
- [ ] Owner-Login (App)
- [ ] Zuschauer-Login (Kernfamilie, erweiterte Familie)
- [ ] Öffentliche Inhalte ohne Login sichtbar
- [ ] Sichtbarkeitsstufen: privat / Kernfamilie / erw. Familie / öffentlich

## Nicht im MVP

- Komplexe Videoverarbeitung (Transcoding, Streaming)
- Apple Watch Import
- KI-gestützte Texterzeugung oder automatische Veröffentlichung
- Echtzeit-Kollaboration
- Tiefe Drittanbieter-Integrationen
- Multi-Owner / Team-Features
- Erweiterte Suchfunktion

## Erfolgskriterien MVP

1. Reisender kann unterwegs vom iPhone aus Tagesnotizen + Bilder hinzufügen
2. Inhalte sind nach Sichtbarkeit korrekt gefiltert
3. Familie kann auf der Website freigegebene Inhalte lesen
4. PWA ist auf iPhone zum Homescreen hinzufügbar
5. Wichtige Tagesinfos sind offline verfügbar

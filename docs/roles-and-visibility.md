# Rollen und Sichtbarkeit

## Benutzerrollen

| Rolle | Beschreibung | Zugang |
|---|---|---|
| `OWNER` | Der Reisende selbst | Voller Zugriff: Lesen, Schreiben, Freigabe |
| `FAMILY_CORE` | Kernfamilie (z.B. Partner, Kinder) | Lesen: FAMILY_CORE, FAMILY_EXTENDED, PUBLIC |
| `FAMILY_EXTENDED` | Erweiterte Familie, Freunde | Lesen: FAMILY_EXTENDED, PUBLIC |
| `PUBLIC` | Nicht eingeloggter Besucher | Lesen: nur PUBLIC |

## Sichtbarkeitsstufen

```
PRIVATE          → nur OWNER sieht es
FAMILY_CORE      → OWNER + FAMILY_CORE
FAMILY_EXTENDED  → OWNER + FAMILY_CORE + FAMILY_EXTENDED
PUBLIC           → alle (auch ohne Login)
```

## Sichtbarkeits-Matrix

| Inhalt \ Nutzer | OWNER | FAMILY_CORE | FAMILY_EXTENDED | PUBLIC |
|---|:---:|:---:|:---:|:---:|
| PRIVATE         | ✅ | ❌ | ❌ | ❌ |
| FAMILY_CORE     | ✅ | ✅ | ❌ | ❌ |
| FAMILY_EXTENDED | ✅ | ✅ | ✅ | ❌ |
| PUBLIC          | ✅ | ✅ | ✅ | ✅ |

## Schreibrechte

Nur `OWNER` kann Inhalte erstellen, bearbeiten, löschen und Sichtbarkeit setzen.
Zuschauer (`FAMILY_CORE`, `FAMILY_EXTENDED`, `PUBLIC`) können nur kommentieren (wo erlaubt).

## Kommentare

Kommentare sind möglich für: `FAMILY_CORE`, `FAMILY_EXTENDED` (sofern der Tag für sie sichtbar ist).
Öffentliche Kommentare: optional, im MVP nicht aktiviert (Spam-Risiko).

## Implementierung

**Backend:** Visibility-Middleware prüft bei **jedem** API-Request:
1. Ist der Nutzer authentifiziert? → Rolle bestimmen
2. Nicht authentifiziert → Rolle = PUBLIC
3. Inhalt-Visibility ≤ Nutzer-Rolle? → Zugriff erlaubt

**Wichtig:** Nie im Frontend entscheiden, ob etwas sichtbar ist.
Das Backend gibt immer nur zurück, was der anfragende Nutzer sehen darf.

## Vererbung

Ein Inhalt darf nie sichtbarer sein als sein Elternobjekt:

```
Trip.visibility = FAMILY_CORE
  → Day.visibility kann maximal FAMILY_CORE sein
  → Media.visibility kann maximal FAMILY_CORE sein
```

Bei Widerspruch gewinnt immer die restriktivere Stufe.

## Freigabe-Workflow (App)

1. Owner erstellt Inhalt (Standard: PRIVATE)
2. Owner setzt Sichtbarkeit auf gewünschte Stufe
3. Inhalt wird sofort entsprechend sichtbar (kein Approval-Prozess im MVP)

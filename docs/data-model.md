# Datenmodell

## Entitäten-Übersicht

```
User
 └── Trip (Reise)
      ├── Stage (Etappe/Region)
      │    └── Day (Tag) ──── verknüpft
      └── Day (Tag)
           ├── Note (Tagesnotiz)
           ├── Media (Bild, PDF, GPX, Video-Referenz)
           ├── Location (Ort, Maps-Link)
           ├── Booking (Buchungsinfo)
           └── Comment (Kommentar von Zuschauern)
```

## Entitäten im Detail

### User
```
id          UUID
email       String (unique)
role        Enum: OWNER | FAMILY_CORE | FAMILY_EXTENDED | PUBLIC
name        String
createdAt   DateTime
```

### Trip (Reise)
```
id            UUID
ownerId       FK → User
title         String
description   String?
startDate     Date?
endDate       Date?
coverImageId  FK → Media?
visibility    Enum: PRIVATE | FAMILY_CORE | FAMILY_EXTENDED | PUBLIC
createdAt     DateTime
updatedAt     DateTime
```

### Stage (Etappe / Region)
```
id          UUID
tripId      FK → Trip
title       String
description String?
order       Int
startDate   Date?
endDate     Date?
visibility  Enum (inherits from Trip wenn nicht gesetzt)
createdAt   DateTime
```

### Day (Tag)
```
id          UUID
tripId      FK → Trip
stageId     FK → Stage? (optional)
date        Date
title       String?
summary     String?
visibility  Enum
createdAt   DateTime
updatedAt   DateTime
```

### Note (Tagesnotiz)
```
id          UUID
dayId       FK → Day
content     Text
visibility  Enum
createdAt   DateTime
updatedAt   DateTime
```

### Media (Medien)
```
id           UUID
dayId        FK → Day?
tripId       FK → Trip?
type         Enum: IMAGE | PDF | GPX | VIDEO_REF | DOCUMENT
filename     String
mimeType     String
storageUrl   String          # lokaler Pfad oder externer URL
thumbnailUrl String?
size         Int?            # Bytes
metadata     Json?           # EXIF, GPX-Daten etc.
visibility   Enum
order        Int?
createdAt    DateTime
```

### Location (Ort / Maps-Link)
```
id          UUID
dayId       FK → Day?
tripId      FK → Trip?
stageId     FK → Stage?
label       String
mapsUrl     String?
lat         Float?
lng         Float?
address     String?
visibility  Enum
```

### Booking (Buchungsinfo)
```
id          UUID
tripId      FK → Trip
dayId       FK → Day?
title       String
type        Enum: FLIGHT | HOTEL | TRANSPORT | OTHER
reference   String?
date        DateTime?
notes       String?
mediaId     FK → Media?  # Ticket-PDF etc.
visibility  Enum
```

### Comment (Kommentar)
```
id          UUID
authorId    FK → User
dayId       FK → Day
content     Text
createdAt   DateTime
updatedAt   DateTime
```

## Sichtbarkeits-Vererbung

Hierarchie: Trip → Stage → Day → Note/Media/Location/Booking

Regel: Ein Inhalt ist nie sichtbarer als sein Elternobjekt.
Konkrete Auflösung im Backend (Visibility-Service), nicht im Frontend.

## Visibility Enum (global)

```
PRIVATE          → nur Owner
FAMILY_CORE      → Owner + Kernfamilie
FAMILY_EXTENDED  → Owner + Kernfamilie + erweiterte Familie
PUBLIC           → alle
```

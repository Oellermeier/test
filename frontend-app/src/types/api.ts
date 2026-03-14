// API-Response-Typen für die Reisenden-App
// Spiegeln die Backend-Responses wider (Prisma-Modelle nach JSON-Serialisierung)

export type Visibility = 'PRIVATE' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC'
export type DayStatus  = 'PLANNED' | 'ACTIVE' | 'DONE'
export type MediaType  = 'IMAGE' | 'PDF' | 'GPX' | 'VIDEO_REF' | 'DOCUMENT'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface TripListItem {
  id: string
  title: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  visibility: Visibility
  createdAt: string
  _count: { days: number; stages: number }
}

export interface StageItem {
  id: string
  title: string
  order: number
  startDate?: string | null
  endDate?: string | null
  visibility: Visibility
}

export interface DayListItem {
  id: string
  date: string
  title?: string | null
  summary?: string | null
  status: DayStatus
  stageId?: string | null
  position?: number | null
  visibility: Visibility
  _count: { media: number; notes: number }
}

export interface TripDetail extends TripListItem {
  stages: StageItem[]
  days: DayListItem[]
}

export interface NoteItem {
  id: string
  content: string
  visibility: Visibility
  createdAt: string
}

export interface LocationItem {
  id: string
  label: string
  mapsUrl?: string | null
  address?: string | null
  visibility: Visibility
}

export interface BookingItem {
  id: string
  title: string
  type: string
  reference?: string | null
  bookingDate?: string | null
  notes?: string | null
  visibility: Visibility
}

export interface MediaItem {
  id: string
  type: MediaType
  filename: string
  storageUrl: string
  mimeType: string
  size?: number | null
  visibility: Visibility
  order?: number | null
}

export interface DayDetail extends DayListItem {
  stage?: { id: string; title: string } | null
  notes: NoteItem[]
  locations: LocationItem[]
  bookings: BookingItem[]
  media: MediaItem[]
}

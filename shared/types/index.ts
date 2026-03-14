// Geteilte Typen für frontend-app, frontend-site und backend

export type Visibility = 'PRIVATE' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC';

export type UserRole = 'OWNER' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC';

export type MediaType = 'IMAGE' | 'PDF' | 'GPX' | 'VIDEO_REF' | 'DOCUMENT';

export type BookingType = 'FLIGHT' | 'HOTEL' | 'TRANSPORT' | 'OTHER';

export type DayStatus = 'PLANNED' | 'ACTIVE' | 'DONE';

// API-Typen (Responses)
// Sichtbarkeitslogik (canView, visibilityFilter) liegt im Backend: backend/src/lib/visibility.ts

export interface TripSummary {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  coverImageUrl?: string;
  visibility: Visibility;
}

export interface TripDetail extends TripSummary {
  stages: StageSummary[];
  days: DaySummary[];
}

export interface StageSummary {
  id: string;
  title: string;
  description?: string;
  order: number;
  startDate?: string;
  endDate?: string;
  visibility: Visibility;
}

export interface DaySummary {
  id: string;
  date: string;
  title?: string;
  summary?: string;
  status: DayStatus;
  stageId?: string;
  position?: number;
  visibility: Visibility;
  mediaCount: number;
}

export interface DayDetail extends DaySummary {
  notes: Note[];
  media: Media[];
  locations: Location[];
  bookings: Booking[];
  comments: Comment[];
}

export interface Note {
  id: string;
  content: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  type: MediaType;
  filename: string;
  storageUrl: string;
  thumbnailUrl?: string;
  visibility: Visibility;
  order?: number;
  createdAt: string;
}

export interface Location {
  id: string;
  label: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
  address?: string;
  visibility: Visibility;
}

export interface Booking {
  id: string;
  title: string;
  type: BookingType;
  reference?: string;
  date?: string;
  notes?: string;
  visibility: Visibility;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

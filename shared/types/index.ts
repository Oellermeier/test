// Geteilte Typen für frontend-app, frontend-site und backend

export type Visibility = 'PRIVATE' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC';

export type UserRole = 'OWNER' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC';

export type MediaType = 'IMAGE' | 'PDF' | 'GPX' | 'VIDEO_REF' | 'DOCUMENT';

export type BookingType = 'FLIGHT' | 'HOTEL' | 'TRANSPORT' | 'OTHER';

// Sichtbarkeits-Hierarchie (höherer Index = restriktiver)
export const VISIBILITY_LEVELS: Record<Visibility, number> = {
  PUBLIC: 0,
  FAMILY_EXTENDED: 1,
  FAMILY_CORE: 2,
  PRIVATE: 3,
};

// Prüft ob ein Nutzer mit gegebener Rolle einen Inhalt mit gegebener Visibility sehen darf
export function canView(userRole: UserRole, visibility: Visibility): boolean {
  if (userRole === 'OWNER') return true;
  switch (visibility) {
    case 'PUBLIC': return true;
    case 'FAMILY_EXTENDED': return userRole === 'FAMILY_CORE' || userRole === 'FAMILY_EXTENDED';
    case 'FAMILY_CORE': return userRole === 'FAMILY_CORE';
    case 'PRIVATE': return false;
  }
}

// API-Typen (Responses)

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
  stageId?: string;
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

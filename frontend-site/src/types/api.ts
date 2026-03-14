export type Visibility = 'PRIVATE' | 'FAMILY_CORE' | 'FAMILY_EXTENDED' | 'PUBLIC'
export type DayStatus  = 'PLANNED' | 'ACTIVE' | 'DONE'

export interface TripListItem {
  id:          string
  title:       string
  description: string | null
  startDate:   string
  endDate:     string
  coverImage:  string | null
  visibility:  Visibility
  _count: { days: number }
}

export interface PaginatedResponse<T> {
  items:  T[]
  total:  number
  limit:  number
  offset: number
}

export interface StageItem {
  id:        string
  title:     string
  order:     number
  startDate: string | null
  endDate:   string | null
  visibility: Visibility
}

export interface DayListItem {
  id:         string
  date:       string
  title:      string | null
  summary:    string | null
  status:     DayStatus
  stageId:    string | null
  position:   number | null
  visibility: Visibility
  _count: { media: number; notes: number }
}

export interface TripDetail extends TripListItem {
  stages: StageItem[]
  days:   DayListItem[]
}

export type MediaType = 'IMAGE' | 'DOCUMENT' | 'GPX'

export interface MediaItem {
  id:           string
  type:         MediaType
  filename:     string
  storageUrl:   string
  thumbnailUrl: string | null
  visibility:   Visibility
  order:        number
}

export interface NoteItem {
  id:        string
  content:   string
  createdAt: string
}

export interface LocationItem {
  id:   string
  name: string
  lat:  number | null
  lon:  number | null
}

export interface DayDetail {
  id:         string
  date:       string
  title:      string | null
  summary:    string | null
  status:     DayStatus
  visibility: Visibility
  tripId:     string
  stage:      Pick<StageItem, 'id' | 'title'> | null
  notes:      NoteItem[]
  locations:  LocationItem[]
  media:      MediaItem[]
}

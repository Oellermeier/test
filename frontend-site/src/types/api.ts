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

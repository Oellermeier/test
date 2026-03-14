import Link from 'next/link'
import { Calendar, Sun } from 'lucide-react'
import { formatDateRange } from '@/lib/format'
import type { TripListItem } from '@/types/api'

export default function TripCard({ trip }: { trip: TripListItem }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
    >
      <h2 className="font-semibold text-lg text-gray-900 leading-tight">{trip.title}</h2>

      {(trip.startDate || trip.endDate) && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
          <Calendar size={13} className="shrink-0" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>
      )}

      {trip.description && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{trip.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-3">
        <Sun size={12} />
        <span>{trip._count.days} {trip._count.days === 1 ? 'Tag' : 'Tage'}</span>
        {trip._count.stages > 0 && (
          <span className="ml-1">· {trip._count.stages} Etappen</span>
        )}
      </div>
    </Link>
  )
}

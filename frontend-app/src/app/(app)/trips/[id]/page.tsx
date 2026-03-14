import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CalendarDays } from 'lucide-react'
import { serverFetch } from '@/lib/server-api'
import { formatDateRange } from '@/lib/format'
import DayCard from '@/components/days/DayCard'
import type { TripDetail } from '@/types/api'

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await serverFetch<TripDetail>(`/trips/${id}`)
  if (!trip) notFound()

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-4">
        <Link href="/trips" className="inline-flex items-center gap-1 text-blue-600 text-sm mb-3">
          <ChevronLeft size={16} />
          Alle Reisen
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
        {(trip.startDate || trip.endDate) && (
          <p className="text-gray-500 text-sm mt-1">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        )}
        {trip.description && (
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">{trip.description}</p>
        )}
      </div>

      {/* Etappen-Chips (horizontal scrollbar) */}
      {trip.stages.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Etappen
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {trip.stages.map((s) => (
              <span
                key={s.id}
                className="shrink-0 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium"
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tagesliste */}
      <div className="px-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Tage ({trip.days.length})
        </p>

        {trip.days.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <CalendarDays size={32} className="text-gray-300" />
            <p className="text-gray-500 text-sm">Noch keine Tage geplant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trip.days.map((day) => (
              <DayCard key={day.id} day={day} tripId={trip.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

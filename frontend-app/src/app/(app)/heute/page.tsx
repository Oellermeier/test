import Link from 'next/link'
import { CalendarDays, Plane } from 'lucide-react'
import { serverFetch } from '@/lib/server-api'
import { formatDate, todayISO } from '@/lib/format'
import DayCard from '@/components/days/DayCard'
import type { PaginatedResponse, TripListItem, DayListItem } from '@/types/api'

export default async function HeutePage() {
  const today = todayISO()

  const tripsData = await serverFetch<PaginatedResponse<TripListItem>>('/trips?limit=20&offset=0')
  const trips = tripsData?.items ?? []

  if (trips.length === 0) {
    return (
      <div className="px-4 pt-6 flex flex-col items-center py-20 gap-3 text-center">
        <Plane size={40} className="text-gray-300" />
        <p className="font-medium text-gray-600">Keine Reisen vorhanden</p>
        <Link href="/trips" className="text-blue-600 text-sm">Reisen ansehen</Link>
      </div>
    )
  }

  // Aktive Reise: today liegt im Datumsbereich
  const activeTrip = trips.find(
    (t) => t.startDate && t.endDate &&
      t.startDate.slice(0, 10) <= today &&
      t.endDate.slice(0, 10) >= today,
  ) ?? trips[0] // Fallback: neueste Reise

  const daysData = await serverFetch<PaginatedResponse<DayListItem>>(
    `/days?tripId=${activeTrip.id}&limit=100&offset=0`,
  )
  const days = daysData?.items ?? []

  const todayDay = days.find((d) => d.date.slice(0, 10) === today)
  const nextDay  = days.find((d) => d.date.slice(0, 10) > today)
  const shown    = todayDay ?? nextDay

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Kontext */}
      <div>
        <p className="text-gray-500 text-sm">{formatDate(today + 'T00:00:00.000Z')}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Heute</h1>
        <Link href={`/trips/${activeTrip.id}`} className="text-blue-600 text-sm">
          {activeTrip.title} &rarr;
        </Link>
      </div>

      {shown ? (
        <div className="space-y-3">
          {!todayDay && (
            <p className="text-xs text-gray-400">
              Kein Eintrag für heute — nächster geplanter Tag:
            </p>
          )}

          <DayCard day={shown} tripId={activeTrip.id} />

          <Link
            href={`/trips/${activeTrip.id}/days/${shown.id}`}
            className="block w-full py-3.5 text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl text-base transition-colors"
          >
            Tagesansicht öffnen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center py-14 gap-3 text-center">
          <CalendarDays size={36} className="text-gray-300" />
          <p className="text-gray-500 text-sm">Keine Tage für diese Reise geplant</p>
          <Link href={`/trips/${activeTrip.id}`} className="text-blue-600 text-sm">
            Zur Reise
          </Link>
        </div>
      )}
    </div>
  )
}

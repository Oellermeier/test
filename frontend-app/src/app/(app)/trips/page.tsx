import { Plane } from 'lucide-react'
import { serverFetch } from '@/lib/server-api'
import TripCard from '@/components/trips/TripCard'
import type { PaginatedResponse, TripListItem } from '@/types/api'

export default async function TripsPage() {
  const data = await serverFetch<PaginatedResponse<TripListItem>>('/trips?limit=20&offset=0')
  const trips = data?.items ?? []

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Meine Reisen</h1>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Plane size={40} className="text-gray-300" />
          <p className="font-medium text-gray-600">Noch keine Reisen vorhanden</p>
          <p className="text-sm text-gray-400">Neue Reisen können über die API angelegt werden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

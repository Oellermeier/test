import { serverFetch } from '@/lib/server-api'
import UploadForm from '@/components/upload/UploadForm'
import type { PaginatedResponse, TripListItem } from '@/types/api'

export default async function UploadPage() {
  const data = await serverFetch<PaginatedResponse<TripListItem>>('/trips?limit=20&offset=0')
  const trips = data?.items ?? []

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Upload</h1>

      {trips.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">
          Bitte zuerst eine Reise anlegen, bevor du Inhalte hochlädst.
        </p>
      ) : (
        <UploadForm trips={trips} />
      )}
    </div>
  )
}

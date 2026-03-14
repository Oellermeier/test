import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, ExternalLink, FileText, CalendarDays } from 'lucide-react'
import { serverFetch } from '@/lib/server-api'
import { formatDate } from '@/lib/format'
import VisibilityEditor from '@/components/days/VisibilityEditor'
import type { DayDetail, DayStatus } from '@/types/api'

const STATUS: Record<DayStatus, { label: string; cls: string }> = {
  PLANNED: { label: 'Geplant',  cls: 'bg-gray-100 text-gray-600' },
  ACTIVE:  { label: 'Aktiv',    cls: 'bg-blue-100 text-blue-700' },
  DONE:    { label: 'Erledigt', cls: 'bg-green-100 text-green-700' },
}

export default async function DayDetailPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>
}) {
  const { id: tripId, dayId } = await params
  const day = await serverFetch<DayDetail>(`/days/${dayId}`)
  if (!day) notFound()

  const { label, cls } = STATUS[day.status]
  const images   = day.media.filter((m) => m.type === 'IMAGE')
  const files    = day.media.filter((m) => m.type !== 'IMAGE')
  const isEmpty  = !day.summary && day.notes.length === 0 && day.locations.length === 0 &&
                   day.bookings.length === 0 && day.media.length === 0

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-5">
        <Link href={`/trips/${tripId}`} className="inline-flex items-center gap-1 text-blue-600 text-sm mb-3">
          <ChevronLeft size={16} />
          Zurück zur Reise
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-gray-500 text-sm">{formatDate(day.date)}</p>
            {day.title && (
              <h1 className="text-xl font-bold text-gray-900 mt-0.5 leading-tight">{day.title}</h1>
            )}
            {day.stage && (
              <p className="text-sm text-gray-400 mt-1">Etappe: {day.stage.title}</p>
            )}
            <VisibilityEditor dayId={day.id} initialVisibility={day.visibility} />
          </div>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium mt-0.5 ${cls}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Summary */}
      {day.summary && (
        <section className="px-4 pb-5">
          <p className="text-gray-700 leading-relaxed">{day.summary}</p>
        </section>
      )}

      {/* Notizen */}
      {day.notes.length > 0 && (
        <section className="px-4 pb-5 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notizen</h2>
          {day.notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Orte */}
      {day.locations.length > 0 && (
        <section className="px-4 pb-5 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Orte</h2>
          {day.locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl p-4 border border-gray-100 flex gap-3">
              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm">{loc.label}</p>
                {loc.address && (
                  <p className="text-gray-500 text-xs mt-0.5">{loc.address}</p>
                )}
                {loc.mapsUrl && (
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-xs mt-1.5"
                  >
                    In Maps öffnen <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Buchungen */}
      {day.bookings.length > 0 && (
        <section className="px-4 pb-5 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buchungen</h2>
          {day.bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-medium text-gray-900 text-sm">{b.title}</p>
              {b.reference && (
                <p className="text-gray-500 text-xs mt-0.5">Ref: {b.reference}</p>
              )}
              {b.notes && (
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{b.notes}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Bilder */}
      {images.length > 0 && (
        <section className="px-4 pb-5 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Bilder ({images.length})
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {images.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.storageUrl}
                alt={m.filename}
                className="w-full aspect-square object-cover rounded-xl bg-gray-100"
              />
            ))}
          </div>
        </section>
      )}

      {/* Dokumente & GPX */}
      {files.length > 0 && (
        <section className="px-4 pb-5 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dateien</h2>
          {files.map((m) => (
            <a
              key={m.id}
              href={m.storageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100"
            >
              <FileText size={18} className="text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{m.filename}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.type}</p>
              </div>
              <ExternalLink size={14} className="text-gray-300 shrink-0 ml-auto" />
            </a>
          ))}
        </section>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center py-14 px-4 gap-3 text-center">
          <CalendarDays size={36} className="text-gray-300" />
          <p className="text-gray-500 text-sm">Noch keine Inhalte für diesen Tag</p>
          <p className="text-gray-400 text-xs">Notizen und Medien können über Upload hinzugefügt werden</p>
        </div>
      )}
    </div>
  )
}

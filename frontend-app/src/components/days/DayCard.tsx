import Link from 'next/link'
import { formatShortDate } from '@/lib/format'
import type { DayListItem, DayStatus } from '@/types/api'

const STATUS: Record<DayStatus, { label: string; cls: string }> = {
  PLANNED: { label: 'Geplant',  cls: 'bg-gray-100 text-gray-600' },
  ACTIVE:  { label: 'Aktiv',    cls: 'bg-blue-100 text-blue-700' },
  DONE:    { label: 'Erledigt', cls: 'bg-green-100 text-green-700' },
}

export default function DayCard({ day, tripId }: { day: DayListItem; tripId: string }) {
  const { label, cls } = STATUS[day.status]

  return (
    <Link
      href={`/trips/${tripId}/days/${day.id}`}
      className="block bg-white rounded-xl px-4 py-3.5 border border-gray-100 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 shrink-0">
              {formatShortDate(day.date)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
              {label}
            </span>
          </div>
          {day.title && (
            <p className="text-gray-900 font-medium mt-1 truncate">{day.title}</p>
          )}
          {day.summary && (
            <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{day.summary}</p>
          )}
        </div>

        {(day._count.notes > 0 || day._count.media > 0) && (
          <div className="text-xs text-gray-400 shrink-0 text-right space-y-0.5 pt-0.5">
            {day._count.notes > 0 && (
              <div>{day._count.notes} Notiz{day._count.notes !== 1 ? 'en' : ''}</div>
            )}
            {day._count.media > 0 && (
              <div>{day._count.media} Medien</div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

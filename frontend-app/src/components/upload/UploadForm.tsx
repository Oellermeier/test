'use client'

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Upload, CheckCircle, AlertCircle, Image, FileText, MapPin, X } from 'lucide-react'
import { formatShortDate } from '@/lib/format'
import type { TripListItem, DayListItem, Visibility } from '@/types/api'

// ── Konfiguration ────────────────────────────────────────────────────────────

const VISIBILITY_OPTIONS: { value: Visibility; label: string; desc: string }[] = [
  { value: 'PRIVATE',         label: 'Privat',        desc: 'Nur ich' },
  { value: 'FAMILY_CORE',     label: 'Kernfamilie',   desc: 'Enge Familie' },
  { value: 'FAMILY_EXTENDED', label: 'Erw. Familie',  desc: 'Alle Familie' },
  { value: 'PUBLIC',          label: 'Öffentlich',    desc: 'Alle sehen es' },
]

// Primär Extension, dann MIME — iOS/Safari liefert für GPX oft text/plain
function getEndpoint(file: File): string | null {
  const name = file.name.toLowerCase()
  const mime = file.type
  if (name.endsWith('.gpx')) return '/api/uploads/gpx'
  if (['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) {
    return '/api/uploads/images'
  }
  if (mime === 'application/pdf') return '/api/uploads/documents'
  return null
}

function FileTypeBadge({ file }: { file: File }) {
  const name = file.name.toLowerCase()
  const mime = file.type
  if (name.endsWith('.gpx')) {
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700"><MapPin size={11} />GPX</span>
  }
  if (['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) {
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"><Image size={11} />Bild</span>
  }
  if (mime === 'application/pdf') {
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700"><FileText size={11} />PDF</span>
  }
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700"><AlertCircle size={11} />Nicht unterstützt</span>
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadForm({ trips }: { trips: TripListItem[] }) {
  const [file,       setFile]       = useState<File | null>(null)
  const [tripId,     setTripId]     = useState(trips[0]?.id ?? '')
  const [dayId,      setDayId]      = useState('')
  const [visibility, setVisibility] = useState<Visibility>('PRIVATE')
  const [days,       setDays]       = useState<DayListItem[]>([])
  const [loadingDays, setLoadingDays] = useState(false)
  const [status,     setStatus]     = useState<UploadStatus>('idle')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [lastFile,   setLastFile]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Days laden wenn Trip sich ändert
  useEffect(() => {
    if (!tripId) { setDays([]); return }
    setLoadingDays(true)
    setDayId('')
    fetch(`/api/days?tripId=${tripId}&limit=100&offset=0`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setDays(d?.items ?? []))
      .catch(() => setDays([]))
      .finally(() => setLoadingDays(false))
  }, [tripId])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setStatus('idle')
    setErrorMsg('')
  }

  function reset() {
    setFile(null)
    setDayId('')
    setStatus('idle')
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || !tripId) return

    const endpoint = getEndpoint(file)
    if (!endpoint) {
      setStatus('error')
      setErrorMsg(`Dateityp nicht unterstützt: ${file.name}`)
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    const form = new FormData()
    form.append('file', file)
    form.append('tripId', tripId)
    if (dayId) form.append('dayId', dayId)
    form.append('visibility', visibility)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: form,
        // Content-Type NICHT setzen — Browser setzt Multipart-Boundary automatisch
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Fehler ${res.status}`)
      }
      setLastFile(file.name)
      setStatus('success')
      reset()
      setTimeout(() => setStatus('idle'), 6000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    }
  }

  const canSubmit = !!file && !!tripId && getEndpoint(file) !== null && status !== 'uploading'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Datei ── */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Datei</label>

        <label
          htmlFor="file-input"
          className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer active:bg-gray-50 transition-colors"
        >
          <Upload size={28} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            Tippen zum Auswählen
          </span>
          <span className="text-xs text-gray-400">Bilder, PDFs, GPX-Dateien</span>
        </label>
        <input
          id="file-input"
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.gpx,application/gpx+xml,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
        />

        {file && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
            <FileTypeBadge file={file} />
            <span className="text-sm text-gray-800 truncate flex-1">{file.name}</span>
            <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Trip ── */}
      <div className="space-y-1.5">
        <label htmlFor="trip-select" className="block text-sm font-semibold text-gray-700">
          Reise <span className="text-red-500">*</span>
        </label>
        <select
          id="trip-select"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* ── Day (optional) ── */}
      <div className="space-y-1.5">
        <label htmlFor="day-select" className="block text-sm font-semibold text-gray-700">
          Tag <span className="text-gray-400 font-normal text-xs">(optional)</span>
        </label>
        <select
          id="day-select"
          value={dayId}
          onChange={(e) => setDayId(e.target.value)}
          disabled={loadingDays || days.length === 0}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-gray-400 disabled:bg-gray-50"
        >
          <option value="">
            {loadingDays ? 'Lädt…' : days.length === 0 ? 'Keine Tage vorhanden' : 'Keinen Tag zuordnen'}
          </option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {formatShortDate(d.date)}{d.title ? ` – ${d.title}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── Visibility ── */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Sichtbarkeit</p>
        <div className="grid grid-cols-2 gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              className={`py-3 px-3 rounded-xl border-2 text-left transition-colors ${
                visibility === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <p className={`text-sm font-semibold ${visibility === opt.value ? 'text-blue-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fehler ── */}
      {status === 'error' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* ── Erfolg ── */}
      {status === 'success' && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            <span className="font-medium">{lastFile}</span> erfolgreich hochgeladen
          </p>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'uploading' ? 'Wird hochgeladen…' : 'Hochladen'}
      </button>

    </form>
  )
}

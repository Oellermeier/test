'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Lock, Heart, Users, Globe, Loader2 } from 'lucide-react'
import type { Visibility } from '@/types/api'

const OPTIONS: {
  value: Visibility
  label: string
  desc: string
  Icon: React.ElementType
  chip: string   // Farben für den kompakten Chip
  btn: string    // Farben für die Auswahl-Schaltfläche
}[] = [
  {
    value: 'PRIVATE',
    label: 'Privat',
    desc: 'Nur du siehst das',
    Icon: Lock,
    chip: 'bg-gray-100 text-gray-600',
    btn:  'border-gray-200 text-gray-700',
  },
  {
    value: 'FAMILY_CORE',
    label: 'Kernfamilie',
    desc: 'Enge Familie',
    Icon: Heart,
    chip: 'bg-purple-100 text-purple-700',
    btn:  'border-purple-200 text-purple-700',
  },
  {
    value: 'FAMILY_EXTENDED',
    label: 'Erw. Familie',
    desc: 'Alle Familie & Freunde',
    Icon: Users,
    chip: 'bg-amber-100 text-amber-700',
    btn:  'border-amber-200 text-amber-700',
  },
  {
    value: 'PUBLIC',
    label: 'Öffentlich',
    desc: 'Alle können das sehen',
    Icon: Globe,
    chip: 'bg-green-100 text-green-700',
    btn:  'border-green-200 text-green-700',
  },
]

export default function VisibilityEditor({
  dayId,
  initialVisibility,
}: {
  dayId: string
  initialVisibility: Visibility
}) {
  const router = useRouter()
  const [current, setCurrent] = useState(initialVisibility)
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const active = OPTIONS.find((o) => o.value === current)!

  async function select(v: Visibility) {
    if (v === current) { setOpen(false); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/days/${dayId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: v }),
      })
      if (!res.ok) throw new Error()
      setCurrent(v)
      setOpen(false)
      router.refresh()
    } catch {
      setError('Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2">
      {/* Kompakter Chip — zeigt aktuelle Visibility, Tap öffnet Picker */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setError('') }}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-opacity ${active.chip} ${saving ? 'opacity-50' : ''}`}
      >
        {saving
          ? <Loader2 size={11} className="animate-spin" />
          : <active.Icon size={11} />
        }
        {active.label}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Inline-Picker */}
      {open && (
        <div className="mt-2 space-y-1.5">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              disabled={saving}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-colors ${
                current === opt.value
                  ? `${opt.btn} border-current bg-white`
                  : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
              }`}
            >
              <opt.Icon size={16} className="shrink-0" />
              <div>
                <p className="text-sm font-medium leading-tight">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
              {current === opt.value && (
                <span className="ml-auto text-xs font-semibold">Aktiv</span>
              )}
            </button>
          ))}
          {error && <p className="text-xs text-red-600 px-1">{error}</p>}
        </div>
      )}
    </div>
  )
}

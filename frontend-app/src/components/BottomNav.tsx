'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, CalendarDays, Upload, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/trips',  label: 'Reisen',  Icon: Map           },
  { href: '/heute',  label: 'Heute',   Icon: CalendarDays  },
  { href: '/upload', label: 'Upload',  Icon: Upload        },
  { href: '/mehr',   label: 'Mehr',    Icon: MoreHorizontal},
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 gap-0.5 transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

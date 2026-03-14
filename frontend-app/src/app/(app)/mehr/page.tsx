'use client'

import { useRouter } from 'next/navigation'

export default function MehrPage() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mehr</h1>

      <button
        onClick={handleLogout}
        className="w-full py-3 text-left px-4 bg-white rounded-xl border border-gray-200 text-red-600 font-medium"
      >
        Abmelden
      </button>
    </div>
  )
}

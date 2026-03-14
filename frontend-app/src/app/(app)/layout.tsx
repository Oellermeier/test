import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

// Server-seitiger Auth-Check: liest Cookie und fragt Backend
async function verifySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('travel_token')
  if (!token) return null

  try {
    // Direkte Backend-URL für Server Components (nicht über Rewrite-Proxy)
    const apiUrl = process.env.API_URL ?? 'http://localhost:3000'
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Cookie: `travel_token=${token.value}` },
      cache:   'no-store',
    })
    if (!res.ok) return null
    const { user } = await res.json()
    return user as { id: string; role: string } | null
  } catch {
    return null
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession()

  // Nur Owner darf die App nutzen
  if (!user || user.role !== 'OWNER') redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hauptinhalt — Platz für Bottom-Nav lassen */}
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

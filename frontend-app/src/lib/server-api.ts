import { cookies } from 'next/headers'

const API_URL = process.env.API_URL ?? 'http://localhost:3000'

/**
 * Server-seitiger Fetch mit Cookie-Forwarding.
 * Nur in Server Components verwenden — nutzt next/headers.
 * Für Client Components: lib/api.ts (via /api Rewrite-Proxy).
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('travel_token')

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Cookie: `travel_token=${token.value}` } : {},
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

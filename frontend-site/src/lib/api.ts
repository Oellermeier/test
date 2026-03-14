// Server-side fetch zur Backend-API (kein Cookie-Forwarding nötig — nur PUBLIC-Daten)
const API_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

export async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

const API_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

export { API_URL }

export async function apiFetch<T>(path: string, extraHeaders?: HeadersInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json', ...extraHeaders },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

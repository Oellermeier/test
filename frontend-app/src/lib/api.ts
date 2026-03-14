/**
 * Einfacher API-Client für Client Components.
 * Nutzt den Next.js Rewrite-Proxy (/api/* → Backend).
 * Für Server Components: fetch direkt mit process.env.API_URL
 */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error ?? 'Unbekannter Fehler')
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

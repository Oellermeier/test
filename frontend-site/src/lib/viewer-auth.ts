import type { AstroCookies } from 'astro'

// Gibt Auth-Header zurück, wenn der Besucher als Familienmitglied eingeloggt ist.
// FAMILY_JWT = langlebiger Backend-JWT mit Rolle FAMILY_EXTENDED (einmalig generiert).
export function familyHeaders(cookies: AstroCookies): HeadersInit {
  if (!isFamilyMember(cookies)) return {}
  const jwt = import.meta.env.FAMILY_JWT
  if (!jwt) return {}
  return { Cookie: `travel_token=${jwt}` }
}

export function isFamilyMember(cookies: AstroCookies): boolean {
  return cookies.get('family_ok')?.value === '1'
}

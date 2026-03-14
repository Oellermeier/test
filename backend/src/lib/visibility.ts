import type { UserRole, Visibility } from '@prisma/client'

/**
 * Prüft ob ein Nutzer mit gegebener Rolle einen Inhalt sehen darf.
 * Owner sieht immer alles.
 */
export function canView(role: UserRole, visibility: Visibility): boolean {
  if (role === 'OWNER') return true
  switch (visibility) {
    case 'PUBLIC':          return true
    case 'FAMILY_EXTENDED': return role === 'FAMILY_CORE' || role === 'FAMILY_EXTENDED'
    case 'FAMILY_CORE':     return role === 'FAMILY_CORE'
    case 'PRIVATE':         return false
  }
}

/**
 * Gibt die erlaubten Visibility-Werte für eine Rolle zurück.
 * Wird als Prisma-WHERE-Fragment verwendet: { visibility: { in: visibilityFilter(role) } }
 */
export function visibilityFilter(role: UserRole): Visibility[] {
  switch (role) {
    case 'OWNER':           return ['PRIVATE', 'FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC']
    case 'FAMILY_CORE':     return ['FAMILY_CORE', 'FAMILY_EXTENDED', 'PUBLIC']
    case 'FAMILY_EXTENDED': return ['FAMILY_EXTENDED', 'PUBLIC']
    case 'PUBLIC':          return ['PUBLIC']
  }
}

/**
 * Erzeugt einen langlebigen JWT mit Rolle FAMILY_EXTENDED für die Zuschauer-Website.
 * Den ausgegebenen Token als FAMILY_JWT in frontend-site/.env eintragen.
 *
 * Aufruf:
 *   cd backend && npm run family:jwt
 *
 * Sicherheitshinweis:
 * - Dieser Token gibt Lesezugriff auf FAMILY_CORE + FAMILY_EXTENDED + PUBLIC Inhalte.
 * - Er läuft nach 1 Jahr ab. Bei Kompromittierung: neues JWT generieren + FAMILY_JWT in .env ersetzen.
 * - JWT_SECRET muss mit dem laufenden Backend übereinstimmen.
 * - Kein Schreibzugriff möglich (requireOwner blockiert alle Mutationen).
 */
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'

config()  // liest backend/.env

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('Fehler: JWT_SECRET nicht gesetzt. backend/.env prüfen.')
  process.exit(1)
}
if (JWT_SECRET === 'dev-secret-change-in-production') {
  console.warn('Warnung: Dev-JWT_SECRET wird verwendet. In Produktion unbedingt ändern.')
}

const payload = { userId: randomUUID(), role: 'FAMILY_EXTENDED' }
const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '365d' })
const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')

console.log('\nFAMILY_JWT (gültig 1 Jahr, bis ' + expires + '):\n')
console.log('FAMILY_JWT=' + token)
console.log('\n→ In frontend-site/.env eintragen.\n')

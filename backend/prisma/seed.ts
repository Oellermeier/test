/**
 * Seed: Legt den Owner-Account an, sofern noch nicht vorhanden.
 * Wird via `npm run db:seed` ausgeführt.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.OWNER_EMAIL
  const password = process.env.OWNER_PASSWORD
  const name = process.env.OWNER_NAME ?? 'Owner'

  if (!email || !password) {
    throw new Error('OWNER_EMAIL und OWNER_PASSWORD müssen in .env gesetzt sein')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Owner bereits vorhanden: ${email}`)
    return
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hash, name, role: 'OWNER' },
  })
  console.log(`Owner erstellt: ${user.email} (id: ${user.id})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

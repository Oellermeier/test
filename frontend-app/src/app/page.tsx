import { redirect } from 'next/navigation'

// Root → direkt zu /trips (oder /login wenn nicht auth — handled by (app)/layout)
export default function RootPage() {
  redirect('/trips')
}

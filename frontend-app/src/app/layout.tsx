import type { Metadata, Viewport } from 'next'
import SwRegister from '@/components/SwRegister'
import './globals.css'

export const metadata: Metadata = {
  title:       'Reise-App',
  description: 'Dein persönlicher Reisebegleiter',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:       true,
    statusBarStyle: 'default',
    title:          'Reise-App',
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  // maximumScale bewusst nicht gesetzt → Nutzer-Zoom erlaubt (Accessibility)
  viewportFit:  'cover', // iPhone Notch / Dynamic Island
  themeColor:   '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* iOS-spezifische PWA-Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <SwRegister />
        {children}
      </body>
    </html>
  )
}

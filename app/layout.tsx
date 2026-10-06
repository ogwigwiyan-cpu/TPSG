import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TPSG - The People Shall Govern',
  description: 'A privacy-safe civic participation and accountability foundation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}

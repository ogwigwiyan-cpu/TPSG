import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TPSG - The People Shall Govern',
  description: 'Permanent Civic Accountability & Participation System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}

import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-black tracking-tight text-amber-400">
            TPSG
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/dashboard" className="hover:text-white">Overview</Link>
            <Link href="/auth" className="hover:text-white">Authentication</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}

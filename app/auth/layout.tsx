import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-black tracking-tight text-amber-400">
            TPSG
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl items-center justify-center px-6 py-16">{children}</main>
    </div>
  )
}

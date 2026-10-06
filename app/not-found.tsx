import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">404</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Page not found</h1>
        <p className="mt-4 text-slate-300">
          The page you requested is not available in the TPSG foundation yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Return home
        </Link>
      </div>
    </main>
  )
}

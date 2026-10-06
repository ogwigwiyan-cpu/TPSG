import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex-1 bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            TPSG foundation
          </div>

          <h1 className="text-5xl font-black tracking-tight text-amber-400 sm:text-6xl lg:text-7xl">
            THE PEOPLE SHALL GOVERN.
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl">
            TPSG is building a privacy-safe civic participation system designed to give citizens
            trustworthy, accountable, and verifiable power in public decision-making.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Open dashboard
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

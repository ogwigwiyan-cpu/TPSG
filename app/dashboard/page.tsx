import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Civic operations overview</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          A secure foundation for participation, governance, verification, and accountability.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Participation', 'Anonymous aggregate participation is tracked without exposing private relationships.'],
          ['Decision readiness', 'Eligibility and geographic scope are prepared for future civic coordination.'],
          ['Governance auditability', 'Decision history and accountability are structured for traceability.'],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">System status</h2>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            Ready
          </span>
        </div>
        <ul className="mt-5 space-y-3 text-sm text-slate-300">
          <li>• Application shell is active and responsive.</li>
          <li>• Supabase foundation is prepared for browser and server usage.</li>
          <li>• Power domain model is scoped for privacy-safe aggregation.</li>
        </ul>
      </section>

      <div className="pb-6">
        <Link href="/" className="text-sm font-medium text-amber-300 hover:text-amber-200">
          ← Return home
        </Link>
      </div>
    </div>
  )
}

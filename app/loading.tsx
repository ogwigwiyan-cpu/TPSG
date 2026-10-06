export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="flex items-center gap-4 rounded-full border border-slate-700 bg-slate-900 px-6 py-4 text-slate-200">
        <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400" />
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
          Loading TPSG
        </span>
      </div>
    </main>
  )
}

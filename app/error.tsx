'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-lg rounded-2xl border border-rose-500/40 bg-slate-900 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-300">Error</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Something went wrong.</h1>
        <p className="mt-4 text-slate-300">
          TPSG encountered an application error while loading this section.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-lg bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-400"
        >
          Try again
        </button>
        <p className="mt-4 text-xs text-slate-400">{error.message}</p>
      </div>
    </main>
  )
}

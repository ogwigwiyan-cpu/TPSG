export default function AuthPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Authentication</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Secure access</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        This shell prepares the application for future sign-in flows while protecting privacy and
        respecting civic accountability principles.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
          <p className="font-medium text-white">Current status</p>
          <p className="mt-1 text-slate-400">No user session is active.</p>
        </div>
        <button
          type="button"
          className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Continue securely
        </button>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-amber-500 sm:text-6xl">
          THE PEOPLE SHALL GOVERN.
        </h1>
        <p className="text-xl text-slate-300">
          TPSG exists to give citizens their political power back.
        </p>
        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-lg shadow-lg transition-colors text-lg"
          >
            TAKE BACK YOUR POWER
          </Link>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardAuth } from '@/components/dashboard-auth'
import { getDisplayName } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, surname')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = getDisplayName(
    profile ?? {
      first_name: user.user_metadata?.first_name,
      surname: user.user_metadata?.surname,
      full_name: user.user_metadata?.full_name,
    },
    'TPSG User'
  )

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Welcome to TPSG</h1>
          </div>
          <DashboardAuth />
        </div>

        <p className="mt-4 max-w-2xl text-slate-300">
          You are signed in. Your private TPSG account is ready for secure identity and future civic workflows.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">Your TPSG account</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-medium text-white">Name:</span> {displayName}
          </p>
          <p>
            <span className="font-medium text-white">Status:</span> Authenticated
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Tell us what you want', 'Future onboarding and account preferences are prepared for secure, private next steps.'],
          ['How can you help?', 'Participation and contribution areas will be structured later without exposing private identity details.'],
          ['Your community', 'Geographic and civic engagement flows are intentionally deferred to future builds.'],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </div>

      <div className="pb-6">
        <Link href="/" className="text-sm font-medium text-amber-300 hover:text-amber-200">
          ← Return home
        </Link>
      </div>
    </div>
  )
}

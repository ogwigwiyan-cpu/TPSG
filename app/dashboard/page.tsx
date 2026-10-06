import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardAuth } from '@/components/dashboard-auth'
import { calculateProfileCompletion, getDisplayName } from '@/lib/auth'
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
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.onboarding_state !== 'COMPLETED') {
    redirect('/onboarding')
  }

  const completion = calculateProfileCompletion(profile)
  const displayName = getDisplayName(
    profile ?? {
      first_name: user.user_metadata?.first_name,
      surname: user.user_metadata?.surname,
      full_name: user.user_metadata?.full_name,
    },
    'TPSG User'
  )

  const sections = [
    ['Personal information', profile.first_name && profile.surname ? '✓' : 'incomplete'],
    ['Location', profile.province || profile.municipality || profile.ward ? '✓' : 'incomplete'],
    ['How you can help', profile.profile_visibility ? '✓' : 'incomplete'],
    ['Privacy', profile.privacy_level ? '✓' : 'incomplete'],
  ]

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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Your TPSG account</h2>
          <Link href="/onboarding" className="text-sm font-medium text-amber-300 hover:text-amber-200">
            Edit profile
          </Link>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-medium text-white">Name:</span> {displayName}
          </p>
          <p>
            <span className="font-medium text-white">Status:</span> Authenticated
          </p>
          <p>
            <span className="font-medium text-white">Profile completion:</span> {completion.progressPercent}%
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">Your TPSG profile</h2>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${completion.progressPercent}%` }} />
        </div>
        <div className="mt-5 space-y-3">
          {sections.map(([label, state]) => (
            <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
              <span>{label}</span>
              <span className={state === '✓' ? 'text-emerald-300' : 'text-amber-300'}>{state}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Tell us what you want', 'This onboarding flow keeps personal identity, location, and capability information private while preparing future civic workflows.'],
          ['How can you help?', 'Your declared capabilities are stored privately and can be used later for managed civic coordination.'],
          ['Your community', 'Location context is recorded in a privacy-aware way without exposing exact address details.'],
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

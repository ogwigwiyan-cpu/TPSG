'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AGE_BANDS,
  CONTRIBUTION_CAPABILITIES,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  PRIVACY_LEVELS,
  formatCapabilityLabel,
  getOnboardingState,
  validateProfileInput,
} from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type ProfileFormState = {
  first_name: string
  surname: string
  mobile_number: string
  preferred_language: string
  age_band: string
  gender: string
  employment_status: string
  province: string
  municipality: string
  ward: string
  community: string
  street_locality: string
  privacy_level: string
  exact_location_private: boolean
  profile_visibility: string
  onboarding_state: string
  accepted_policy_version: string
  accepted_at: string
}

const defaultProfileState: ProfileFormState = {
  first_name: '',
  surname: '',
  mobile_number: '',
  preferred_language: 'English',
  age_band: '',
  gender: 'NOT_PROVIDED',
  employment_status: 'NOT_PROVIDED',
  province: '',
  municipality: '',
  ward: '',
  community: '',
  street_locality: '',
  privacy_level: 'EXACT_LOCATION_PRIVATE',
  exact_location_private: true,
  profile_visibility: 'PRIVATE',
  onboarding_state: 'NOT_STARTED',
  accepted_policy_version: '2026-private-profile-v1',
  accepted_at: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profile, setProfile] = useState<ProfileFormState>(defaultProfileState)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])

  useEffect(() => {
    const client = getSupabaseBrowserClient()

    if (!client) {
      setStatus({ type: 'error', text: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.' })
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      const { data: userData } = await client.auth.getUser()
      const user = userData.user

      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profileData } = await client.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      const { data: capabilityRows } = await client.from('profile_capabilities').select('capability').eq('user_id', user.id)

      setProfile({
        ...defaultProfileState,
        first_name: profileData?.first_name ?? user.user_metadata?.first_name ?? '',
        surname: profileData?.surname ?? user.user_metadata?.surname ?? '',
        mobile_number: profileData?.mobile_number ?? '',
        preferred_language: profileData?.preferred_language ?? 'English',
        age_band: profileData?.age_band ?? '',
        gender: profileData?.gender ?? 'NOT_PROVIDED',
        employment_status: profileData?.employment_status ?? 'NOT_PROVIDED',
        province: profileData?.province ?? '',
        municipality: profileData?.municipality ?? '',
        ward: profileData?.ward ?? '',
        community: profileData?.community ?? '',
        street_locality: profileData?.street_locality ?? '',
        privacy_level: profileData?.privacy_level ?? 'EXACT_LOCATION_PRIVATE',
        exact_location_private: profileData?.exact_location_private ?? true,
        profile_visibility: profileData?.profile_visibility ?? 'PRIVATE',
        onboarding_state: profileData?.onboarding_state ?? 'NOT_STARTED',
        accepted_policy_version: profileData?.accepted_policy_version ?? '2026-private-profile-v1',
        accepted_at: profileData?.accepted_at ?? '',
      })

      setSelectedCapabilities(capabilityRows?.map((entry) => entry.capability) ?? [])
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const completionSummary = useMemo(() => {
    const requiredFields = [profile.first_name, profile.surname]
    const optionalFields = [
      profile.mobile_number,
      profile.preferred_language,
      profile.age_band,
      profile.gender,
      profile.employment_status,
      profile.province,
      profile.municipality,
      profile.ward,
      profile.community,
      profile.street_locality,
      profile.privacy_level,
    ]

    const completed = requiredFields.filter(Boolean).length + optionalFields.filter((value) => value && String(value).trim().length > 0).length
    const total = requiredFields.length + optionalFields.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }, [profile])

  const updateField = <K extends keyof ProfileFormState>(fieldName: K, value: ProfileFormState[K]) => {
    setProfile((current) => ({ ...current, [fieldName]: value }))
  }

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((current) =>
      current.includes(capability) ? current.filter((item) => item !== capability) : [...current, capability],
    )
  }

  const saveProfile = async (complete = false) => {
    const client = getSupabaseBrowserClient()

    if (!client) {
      setStatus({ type: 'error', text: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.' })
      return
    }

    const validation = validateProfileInput(profile)
    const validationErrors = Object.fromEntries(Object.entries(validation.errors)) as Record<string, string>
    setFieldErrors(validationErrors)

    if (!validation.isValid) {
      setStatus({ type: 'error', text: 'Please complete the required profile fields before saving.' })
      return
    }

    const { data: userData } = await client.auth.getUser()
    const user = userData.user

    if (!user) {
      router.push('/auth')
      return
    }

    setSaving(true)
    setStatus(null)

    const nextState = complete ? 'COMPLETED' : getOnboardingState(profile)
    const profilePayload = {
      user_id: user.id,
      first_name: profile.first_name.trim(),
      surname: profile.surname.trim(),
      mobile_number: profile.mobile_number.trim() || null,
      preferred_language: profile.preferred_language || null,
      age_band: profile.age_band || null,
      gender: profile.gender || 'NOT_PROVIDED',
      employment_status: profile.employment_status || 'NOT_PROVIDED',
      province: profile.province.trim() || null,
      municipality: profile.municipality.trim() || null,
      ward: profile.ward.trim() || null,
      community: profile.community.trim() || null,
      street_locality: profile.street_locality.trim() || null,
      privacy_level: profile.privacy_level || 'EXACT_LOCATION_PRIVATE',
      exact_location_private: profile.exact_location_private,
      profile_visibility: 'PRIVATE',
      onboarding_state: nextState,
      accepted_policy_version: profile.accepted_policy_version || '2026-private-profile-v1',
      accepted_at: profile.accepted_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: profileError } = await client.from('profiles').upsert(profilePayload, { onConflict: 'user_id' })

    if (profileError) {
      setSaving(false)
      setStatus({ type: 'error', text: 'Unable to save your profile. Please try again.' })
      return
    }

    await client.from('profile_capabilities').delete().eq('user_id', user.id)
    if (selectedCapabilities.length > 0) {
      const inserts = selectedCapabilities.map((capability) => ({ user_id: user.id, capability }))
      await client.from('profile_capabilities').insert(inserts)
    }

    setSaving(false)
    setStatus({ type: 'success', text: complete ? 'Onboarding complete. Redirecting to your dashboard...' : 'Your profile progress has been saved.' })

    if (complete) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-slate-200">
        <p>Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300">Citizen onboarding</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Complete your profile</h1>
          </div>
          <div className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200">
            {completionSummary.percentage}% complete
          </div>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${completionSummary.percentage}%` }} />
        </div>

        {status ? (
          <div
            className={`mt-5 rounded-xl border p-4 text-sm ${
              status.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/40 bg-red-500/10 text-red-200'
            }`}
          >
            {status.text}
          </div>
        ) : null}
      </div>

      <form className="space-y-8" onSubmit={(event) => { event.preventDefault(); void saveProfile(false) }}>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Personal information</h2>
          <p className="mt-1 text-sm text-slate-400">Required: first name and surname. Optional: mobile number, language, age band, gender, and employment status.</p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-slate-200">First name *</label>
              <input id="first_name" value={profile.first_name} onChange={(event) => updateField('first_name', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" />
              {fieldErrors.first_name ? <p className="mt-2 text-xs text-red-300">{fieldErrors.first_name}</p> : null}
            </div>

            <div>
              <label htmlFor="surname" className="mb-2 block text-sm font-medium text-slate-200">Surname *</label>
              <input id="surname" value={profile.surname} onChange={(event) => updateField('surname', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" />
              {fieldErrors.surname ? <p className="mt-2 text-xs text-red-300">{fieldErrors.surname}</p> : null}
            </div>

            <div>
              <label htmlFor="mobile_number" className="mb-2 block text-sm font-medium text-slate-200">Mobile number</label>
              <input id="mobile_number" value={profile.mobile_number} onChange={(event) => updateField('mobile_number', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="+27 82 123 4567" />
              {fieldErrors.mobile_number ? <p className="mt-2 text-xs text-red-300">{fieldErrors.mobile_number}</p> : null}
            </div>

            <div>
              <label htmlFor="preferred_language" className="mb-2 block text-sm font-medium text-slate-200">Preferred language</label>
              <select id="preferred_language" value={profile.preferred_language} onChange={(event) => updateField('preferred_language', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100">
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="age_band" className="mb-2 block text-sm font-medium text-slate-200">Age band</label>
              <select id="age_band" value={profile.age_band} onChange={(event) => updateField('age_band', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100">
                <option value="">Not provided</option>
                {AGE_BANDS.map((option) => (
                  <option key={option} value={option}>{option.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-medium text-slate-200">Gender</label>
              <select id="gender" value={profile.gender} onChange={(event) => updateField('gender', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100">
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="employment_status" className="mb-2 block text-sm font-medium text-slate-200">Employment status</label>
              <select id="employment_status" value={profile.employment_status} onChange={(event) => updateField('employment_status', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100">
                {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Location foundation</h2>
          <p className="mt-1 text-sm text-slate-400">This is privacy-sensitive context only. Exact location is private by default and is not exposed to public profile views.</p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="province" className="mb-2 block text-sm font-medium text-slate-200">Province</label>
              <input id="province" value={profile.province} onChange={(event) => updateField('province', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="Province" />
            </div>
            <div>
              <label htmlFor="municipality" className="mb-2 block text-sm font-medium text-slate-200">Municipality / Metro</label>
              <input id="municipality" value={profile.municipality} onChange={(event) => updateField('municipality', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="Municipality" />
            </div>
            <div>
              <label htmlFor="ward" className="mb-2 block text-sm font-medium text-slate-200">Ward</label>
              <input id="ward" value={profile.ward} onChange={(event) => updateField('ward', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="Ward" />
            </div>
            <div>
              <label htmlFor="community" className="mb-2 block text-sm font-medium text-slate-200">Community / Area</label>
              <input id="community" value={profile.community} onChange={(event) => updateField('community', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="Community / area" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="street_locality" className="mb-2 block text-sm font-medium text-slate-200">Street / Locality</label>
              <input id="street_locality" value={profile.street_locality} onChange={(event) => updateField('street_locality', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100" placeholder="Private street or locality" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">How can I help?</h2>
          <p className="mt-1 text-sm text-slate-400">Select any capabilities that match your willingness to contribute. This is private and does not create tasks or commitments.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRIBUTION_CAPABILITIES.map((capability) => {
              const checked = selectedCapabilities.includes(capability)
              return (
                <button
                  key={capability}
                  type="button"
                  onClick={() => toggleCapability(capability)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    checked ? 'border-amber-500 bg-amber-500/10 text-amber-100' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {formatCapabilityLabel(capability)}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Privacy</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="privacy_level" className="mb-2 block text-sm font-medium text-slate-200">Location privacy level</label>
              <select id="privacy_level" value={profile.privacy_level} onChange={(event) => updateField('privacy_level', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100">
                {PRIVACY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={profile.exact_location_private}
                onChange={(event) => updateField('exact_location_private', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400"
              />
              <span>
                Exact location is private by default. TPSG may use protected aggregate information where appropriate, but individual location details remain private.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(profile.accepted_at)}
                onChange={(event) => updateField('accepted_at', event.target.checked ? new Date().toISOString() : '')}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400"
              />
              <span>
                I understand that private personal information remains private. I accept the TPSG private-profile acknowledgement for this onboarding version.
              </span>
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => void saveProfile(false)} disabled={saving} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-100 transition hover:border-slate-500 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save progress'}
          </button>
          <button type="button" onClick={() => void saveProfile(true)} disabled={saving} className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
            {saving ? 'Completing…' : 'Complete onboarding'}
          </button>
        </div>
      </form>
    </div>
  )
}

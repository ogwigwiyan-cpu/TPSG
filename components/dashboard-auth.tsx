'use client'

import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function DashboardAuth() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      router.push('/auth')
      return
    }

    const { error } = await supabase.auth.signOut()

    if (!error) {
      router.push('/auth')
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
    >
      Sign out
    </button>
  )
}

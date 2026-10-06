import { createClient } from '@supabase/supabase-js'

const placeholderUrl = 'https://your-project.supabase.co'
const placeholderKey = 'placeholder-supabase-publishable-key'

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey || url === placeholderUrl || publishableKey === placeholderKey) {
    return null
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export function createSupabaseBrowserClient() {
  const client = getSupabaseBrowserClient()

  if (!client) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }

  return client
}

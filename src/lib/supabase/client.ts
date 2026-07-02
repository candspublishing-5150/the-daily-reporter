import { createBrowserClient } from '@supabase/ssr'

// Strip BOM and any non-Latin-1 characters that break fetch header encoding
const clean = (s: string | undefined) => (s ?? '').replace(/[^\x20-\x7E]/g, '')

export function createClient() {
  return createBrowserClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

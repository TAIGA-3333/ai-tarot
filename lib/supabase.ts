import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * クリック計測など「落ちても本体機能を壊してはいけない」用途のための
 * Supabaseクライアント。環境変数が未設定、または接続不能な場合はnullを返し、
 * 呼び出し側が計測をスキップできるようにする（例外を投げない）。
 */
let cachedClient: SupabaseClient | null | undefined

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    cachedClient = null
    return null
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    })
  } catch (error: unknown) {
    console.error('[supabase] client init failed:', error instanceof Error ? error.message : error)
    cachedClient = null
  }

  return cachedClient
}

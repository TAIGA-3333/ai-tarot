import { getSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type TrackingHealth = {
  ok: boolean
  urlConfigured: boolean
  keyConfigured: boolean
  hostPrefix: string | null
  tableReachable: boolean
  hasRows: boolean | null
  error: string | null
  checkedAt: string
}

function getHost(url: string | undefined): string | null {
  if (!url) {
    return null
  }

  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function redactError(message: string): string {
  return message.slice(0, 200)
}

export async function GET() {
  const checkedAt = new Date().toISOString()
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const urlConfigured = typeof supabaseUrl === 'string' && supabaseUrl.length > 0
  const keyConfigured = typeof anonKey === 'string' && anonKey.length > 0
  const hostPrefix = getHost(supabaseUrl)?.slice(0, 6) ?? null

  try {
    let tableReachable = false
    let hasRows: boolean | null = null
    let error: string | null = null

    if (urlConfigured && keyConfigured) {
      const supabase = getSupabaseClient()

      if (!supabase) {
        error = 'Supabase client is not configured'
      } else {
        // SELECT success does not guarantee INSERT success; anon INSERT may still fail RLS with 42501.
        const { count, error: queryError } = await supabase
          .from('oracle_clicks')
          .select('*', { count: 'exact', head: true })

        if (queryError) {
          error = redactError(queryError.message)
        } else {
          tableReachable = true
          hasRows = count === null ? null : count > 0
        }
      }
    }

    const body: TrackingHealth = {
      ok: urlConfigured && keyConfigured && tableReachable,
      urlConfigured,
      keyConfigured,
      hostPrefix,
      tableReachable,
      hasRows,
      error,
      checkedAt,
    }

    return NextResponse.json(body, { status: 200 })
  } catch (caught) {
    const body: TrackingHealth = {
      ok: false,
      urlConfigured,
      keyConfigured,
      hostPrefix,
      tableReachable: false,
      hasRows: null,
      error: redactError(caught instanceof Error ? caught.message : String(caught)),
      checkedAt,
    }

    return NextResponse.json(body, { status: 200 })
  }
}

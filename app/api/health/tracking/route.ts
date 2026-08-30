import { createClient } from '@supabase/supabase-js'
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

function redactError(message: string, serviceRoleKey: string | undefined): string {
  const redacted = serviceRoleKey ? message.replaceAll(serviceRoleKey, '[redacted]') : message
  return redacted.slice(0, 200)
}

export async function GET() {
  const checkedAt = new Date().toISOString()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const urlConfigured = typeof supabaseUrl === 'string' && supabaseUrl.length > 0
  const keyConfigured = typeof serviceRoleKey === 'string' && serviceRoleKey.length > 0
  const hostPrefix = getHost(supabaseUrl)?.slice(0, 6) ?? null

  try {
    let tableReachable = false
    let hasRows: boolean | null = null
    let error: string | null = null

    if (urlConfigured && keyConfigured && supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey)
      const { count, error: queryError } = await supabase
        .from('oracle_clicks')
        .select('*', { count: 'exact', head: true })

      if (queryError) {
        error = redactError(queryError.message, serviceRoleKey)
      } else {
        tableReachable = true
        hasRows = count === null ? null : count > 0
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
      error: redactError(caught instanceof Error ? caught.message : String(caught), serviceRoleKey),
      checkedAt,
    }

    return NextResponse.json(body, { status: 200 })
  }
}

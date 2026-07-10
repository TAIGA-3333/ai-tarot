import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const clientSessionId = String(body.clientSessionId || '')
    const theme = String(body.theme || 'unknown')
    const cardCount = Number(body.cardCount || 0)

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('reading_events').insert({
      client_session_id: clientSessionId || null,
      theme,
      card_count: cardCount,
      created_at: new Date().toISOString(),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics/reading]', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}

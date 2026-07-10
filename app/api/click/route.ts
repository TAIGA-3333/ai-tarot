import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { label, src = 'direct' } = body

    if (!label) {
      return NextResponse.json({ error: 'label required' }, { status: 400 })
    }

    // Supabaseに記録（テーブル: oracle_clicks）
    const { error } = await supabase.from('oracle_clicks').insert({
      label,
      src,
      ua: req.headers.get('user-agent')?.slice(0, 200) ?? '',
      created_at: new Date().toISOString(),
    })

    if (error) {
      // テーブル未作成の場合はエラーをログに残すだけ（サイレント失敗）
      console.warn('[click-tracker] Supabase insert error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[click-tracker] error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

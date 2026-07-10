import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * 収益ファネルのクリック計測API（?src=流入元・LINE誘導・シェア導線など）。
 *
 * 設計方針: Supabaseが落ちていても（現状DNS解決不能などの障害時も）
 * ユーザー体験を絶対に壊さない。どんな失敗経路でも200を返し、
 * クライアント側の処理をブロックしない。
 */

const ALLOWED_EVENTS = new Set([
  'page_view',
  'line_cta_click',
  'verni_cta_click',
  'share_click',
  'share_open',
])

const MAX_STRING_LEN = 200

function clip(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const event = body && typeof body === 'object' ? clip((body as Record<string, unknown>).event, 50) : null
    if (!event || !ALLOWED_EVENTS.has(event)) {
      // イベント名が不正でもクライアントを壊さないよう200で返す
      return NextResponse.json({ ok: false, reason: 'invalid_event' }, { status: 200 })
    }

    const record = body as Record<string, unknown>
    const src = clip(record.src, 50)
    const path = clip(record.path, MAX_STRING_LEN)
    const meta =
      record.meta && typeof record.meta === 'object' && !Array.isArray(record.meta)
        ? (record.meta as Record<string, unknown>)
        : {}

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.from('oracle_clicks').insert({
          event,
          src,
          path,
          meta,
        })
      } catch (dbError: unknown) {
        // Supabase書き込み失敗はログのみ。ユーザーには影響させない
        console.error('[track] supabase insert failed:', dbError instanceof Error ? dbError.message : dbError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('[track] unexpected error:', error instanceof Error ? error.message : error)
    // 計測失敗はユーザー体験に一切影響させないため常に200
    return NextResponse.json({ ok: true })
  }
}

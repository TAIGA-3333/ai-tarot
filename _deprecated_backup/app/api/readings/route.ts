import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientSessionId = searchParams.get('client_session_id')

  if (!clientSessionId) {
    return NextResponse.json({ error: 'Missing client_session_id' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('client_session_id', clientSessionId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ readings: data })
  } catch (err: any) {
    console.error('Failed to fetch readings:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientSessionId, reading } = body

    if (!clientSessionId || !reading) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('readings').insert({
      client_session_id: clientSessionId,
      question: reading.question,
      theme: reading.theme,
      drawn_cards: reading.drawnCards,
      interpretation: reading.interpretation,
      lucky_color: reading.luckyColor,
      action_advice: reading.actionAdvice,
      image_prompt: reading.imagePrompt,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ reading: data })
  } catch (err: any) {
    console.error('Failed to save reading:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

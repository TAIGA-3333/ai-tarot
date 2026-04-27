import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ isPremium: false })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const isPremium = session.payment_status === 'paid' && session.mode === 'subscription'
    return NextResponse.json({ isPremium, customerId: session.customer })
  } catch {
    return NextResponse.json({ isPremium: false })
  }
}

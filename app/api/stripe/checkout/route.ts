import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, plan = 'premium' } = await req.json().catch(() => ({}))
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const clientSessionId = typeof sessionId === 'string' && sessionId ? sessionId : crypto.randomUUID()
    const isSingleReading = plan === 'single'
    const priceId =
      plan === 'premium_plus'
        ? process.env.STRIPE_PREMIUM_PLUS_PRICE_ID || process.env.STRIPE_PREMIUM_PRICE_ID!
        : isSingleReading
          ? process.env.STRIPE_SINGLE_READING_PRICE_ID || process.env.STRIPE_PREMIUM_PRICE_ID!
          : process.env.STRIPE_PREMIUM_PRICE_ID!

    const session = await stripe.checkout.sessions.create({
      mode: isSingleReading ? 'payment' : 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/upgrade?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade?canceled=1`,
      locale: 'ja',
      // ユーザー識別用（Supabase未使用のためブラウザセッションIDで代替）
      metadata: {
        clientSessionId,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: '決済セッションの作成に失敗しました' }, { status: 500 })
  }
}

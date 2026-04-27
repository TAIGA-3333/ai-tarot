import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Next.js App RouterでStripe webhookを受け取るにはbodyParserを切る必要がある
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook設定が不正です' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] 署名検証失敗:', err)
    return NextResponse.json({ error: '署名検証に失敗しました' }, { status: 400 })
  }

  // サブスクリプション開始イベント
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === 'subscription' && session.payment_status === 'paid') {
      const clientSessionId = session.metadata?.clientSessionId
      console.log(`[webhook] プレミアム付与: sessionId=${clientSessionId}, stripeCustomer=${session.customer}`)
      // Supabase未使用のため、ここではログのみ
      // 実際のプレミアム付与はフロント側でsuccess_urlのsession_idを使って確認
    }
  }

  // サブスクリプション終了イベント
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    console.log(`[webhook] サブスク終了: ${subscription.id}`)
  }

  return NextResponse.json({ received: true })
}

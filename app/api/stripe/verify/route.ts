import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { setPremiumEntitlement } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const clientSessionId = req.nextUrl.searchParams.get('client_session_id')
  if (!sessionId) {
    return NextResponse.json({ isPremium: false })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const isPremium = session.payment_status === 'paid' && session.mode === 'subscription'
    const hasSingleCredit = session.payment_status === 'paid' && session.mode === 'payment'
    const metadataClientSessionId = session.metadata?.clientSessionId
    const entitlementSessionId = clientSessionId || metadataClientSessionId

    if ((isPremium || hasSingleCredit) && entitlementSessionId) {
      await setPremiumEntitlement({
        clientSessionId: entitlementSessionId,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
        isPremium: isPremium || hasSingleCredit,
        source: hasSingleCredit ? 'stripe_single_payment_verify' : 'stripe_verify',
      })
    }

    return NextResponse.json({ isPremium: isPremium || hasSingleCredit, customerId: session.customer })
  } catch {
    return NextResponse.json({ isPremium: false })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPremiumEntitlement } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const clientSessionId = req.nextUrl.searchParams.get('client_session_id')

  if (!clientSessionId) {
    return NextResponse.json({ isPremium: false })
  }

  try {
    const entitlement = await getPremiumEntitlement(clientSessionId)
    return NextResponse.json({
      isPremium: Boolean(entitlement?.is_premium),
      customerId: entitlement?.stripe_customer_id ?? null,
      subscriptionId: entitlement?.stripe_subscription_id ?? null,
      updatedAt: entitlement?.updated_at ?? null,
    })
  } catch (err) {
    console.error('[premium/status]', err)
    return NextResponse.json({ isPremium: false }, { status: 200 })
  }
}

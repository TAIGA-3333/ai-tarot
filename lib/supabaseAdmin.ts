import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function setPremiumEntitlement(input: {
  clientSessionId: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  isPremium: boolean
  source: string
}) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('premium_entitlements').upsert(
    {
      client_session_id: input.clientSessionId,
      stripe_customer_id: input.stripeCustomerId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      is_premium: input.isPremium,
      source: input.source,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'client_session_id' },
  )

  if (error) throw error
}

export async function getPremiumEntitlement(clientSessionId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('premium_entitlements')
    .select('is_premium, stripe_customer_id, stripe_subscription_id, updated_at')
    .eq('client_session_id', clientSessionId)
    .maybeSingle()

  if (error) throw error
  return data
}

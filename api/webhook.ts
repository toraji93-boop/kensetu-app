import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
  )
}

// stripe_customer_idでplanを更新するヘルパー
async function updatePlanByCustomerId(customerId: string, plan: string, label: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', customerId)
    .select('id')

  if (error) {
    console.error(`${label} DB更新エラー:`, error)
    return { success: false, error }
  }

  if (!data || data.length === 0) {
    console.warn(`${label} stripe_customer_id=${customerId} に該当する会社が見つかりません`)
    return { success: true, error: null }
  }

  console.log(`${label}: stripe_customer_id=${customerId}, company_id=${data[0].id}`)
  return { success: true, error: null }
}

// Vercelでraw bodyを取得するための設定
export const config = {
  api: {
    bodyParser: false,
  },
}

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    const rawBody = await getRawBody(req)

    const stripe = getStripe()
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } else {
      event = JSON.parse(rawBody.toString()) as Stripe.Event
      console.warn('STRIPE_WEBHOOK_SECRET未設定: 署名検証をスキップしています')
    }
  } catch (error) {
    console.error('Webhook署名検証エラー:', error)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  console.log('Webhookイベント受信:', event.type)

  // checkout.session.completed — 決済完了時にproに更新
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const companyId = session.metadata?.company_id
    const customerId = typeof session.customer === 'string' ? session.customer : null

    if (companyId) {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('companies')
        .update({
          plan: 'pro',
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)

      if (error) {
        console.error('プラン更新エラー:', error)
        return res.status(500).json({ error: 'プランの更新に失敗しました' })
      }

      console.log(`プランをproに更新: company_id=${companyId}, customer=${customerId}`)
    }
  }

  // customer.subscription.deleted — 解約完了時にfreeに戻す
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : null

    if (customerId) {
      const result = await updatePlanByCustomerId(customerId, 'free', '解約完了')
      if (!result.success) {
        return res.status(500).json({ error: 'プランの更新に失敗しました' })
      }
    }
  }

  // customer.subscription.updated — ステータス変更時
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : null

    if (customerId && subscription.status === 'canceled') {
      const result = await updatePlanByCustomerId(customerId, 'free', 'サブスク canceled')
      if (!result.success) {
        return res.status(500).json({ error: 'プランの更新に失敗しました' })
      }
    }
  }

  return res.status(200).json({ received: true })
}

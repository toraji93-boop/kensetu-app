import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
)

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

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } else {
      // webhook secret未設定時はパース（開発用）
      event = JSON.parse(rawBody.toString()) as Stripe.Event
      console.warn('STRIPE_WEBHOOK_SECRET未設定: 署名検証をスキップしています')
    }
  } catch (error) {
    console.error('Webhook署名検証エラー:', error)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  // checkout.session.completed イベント処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const companyId = session.metadata?.company_id

    if (companyId) {
      const { error } = await supabase
        .from('companies')
        .update({ plan: 'pro', updated_at: new Date().toISOString() })
        .eq('id', companyId)

      if (error) {
        console.error('プラン更新エラー:', error)
        return res.status(500).json({ error: 'プランの更新に失敗しました' })
      }

      console.log(`プランをproに更新: company_id=${companyId}`)
    }
  }

  // customer.subscription.deleted イベント処理（解約時）
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const companyId = subscription.metadata?.company_id

    if (companyId) {
      const { error } = await supabase
        .from('companies')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('id', companyId)

      if (error) {
        console.error('プラン解約エラー:', error)
        return res.status(500).json({ error: 'プランの更新に失敗しました' })
      }

      console.log(`プランをfreeに更新（解約）: company_id=${companyId}`)
    }
  }

  return res.status(200).json({ received: true })
}

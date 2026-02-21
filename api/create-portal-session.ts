import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe設定エラー' })
  }

  const stripe = new Stripe(secretKey)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
  )

  try {
    const { companyId } = req.body

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    let customerId: string | null = null

    // 1. DBからstripe_customer_idを取得
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_customer_id')
      .eq('id', companyId)
      .single()

    customerId = company?.stripe_customer_id || null

    // 2. DBになければStripeのCheckoutセッションから検索
    if (!customerId) {
      console.log('DBにstripe_customer_idがないため、Stripeから検索:', companyId)

      const sessions = await stripe.checkout.sessions.list({
        limit: 10,
      })

      for (const session of sessions.data) {
        if (session.metadata?.company_id === companyId && session.customer) {
          customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer.id
          break
        }
      }

      // 見つかったらDBにも保存
      if (customerId) {
        await supabase
          .from('companies')
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq('id', companyId)
        console.log('stripe_customer_idをDBに保存:', customerId)
      }
    }

    if (!customerId) {
      return res.status(400).json({
        error: 'プロプランの決済情報が見つかりません。一度ログアウトしてから再度ログインしてください。',
      })
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = host ? `${protocol}://${host}` : 'https://mitsukuru-jp.vercel.app'

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/app/settings`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('ポータルセッション作成エラー:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

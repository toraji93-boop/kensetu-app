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

    // companiesテーブルからstripe_customer_idを取得
    const { data: company, error: dbError } = await supabase
      .from('companies')
      .select('stripe_customer_id')
      .eq('id', companyId)
      .single()

    if (dbError || !company?.stripe_customer_id) {
      return res.status(400).json({ error: 'Stripe顧客情報が見つかりません' })
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = host ? `${protocol}://${host}` : 'https://mitsukuru-jp.vercel.app'

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${baseUrl}/app/settings`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('ポータルセッション作成エラー:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

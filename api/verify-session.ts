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
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' })
    }

    // Stripeからセッション情報を取得して決済完了を確認
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: '決済が完了していません' })
    }

    const companyId = session.metadata?.company_id

    if (!companyId) {
      return res.status(400).json({ error: 'company_idが見つかりません' })
    }

    // companiesテーブルのplanをproに更新
    const { error } = await supabase
      .from('companies')
      .update({ plan: 'pro', updated_at: new Date().toISOString() })
      .eq('id', companyId)

    if (error) {
      console.error('プラン更新エラー:', error)
      return res.status(500).json({ error: 'プランの更新に失敗しました' })
    }

    console.log(`プランをproに更新（セッション検証）: company_id=${companyId}`)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('セッション検証エラー:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 環境変数チェック
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID

  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY が未設定です')
    return res.status(500).json({ error: 'Stripe設定エラー: SECRET_KEY未設定' })
  }
  if (!priceId) {
    console.error('STRIPE_PRICE_ID が未設定です')
    return res.status(500).json({ error: 'Stripe設定エラー: PRICE_ID未設定' })
  }

  console.log('STRIPE_SECRET_KEY prefix:', secretKey.substring(0, 8))
  console.log('STRIPE_PRICE_ID:', priceId)

  try {
    const { companyId } = req.body

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    const stripe = new Stripe(secretKey)

    // originを確実に取得
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = host ? `${protocol}://${host}` : 'https://mitsukuru-jp.vercel.app'

    console.log('baseUrl:', baseUrl)
    console.log('companyId:', companyId)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app`,
      metadata: {
        company_id: companyId,
      },
      subscription_data: {
        metadata: {
          company_id: companyId,
        },
      },
    })

    console.log('Checkoutセッション作成成功:', session.id)
    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkoutセッション作成エラー:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

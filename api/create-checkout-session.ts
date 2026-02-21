import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { companyId } = req.body

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    // originを確実に取得
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = host ? `${protocol}://${host}` : 'https://mitsukuru-jp.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
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

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkoutセッション作成エラー:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

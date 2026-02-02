import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { priceId, userId, email } = req.body

    try {
        // Check if customer exists
        let customerId
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single()

        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id
        } else {
            // Create new Stripe customer
            const customer = await stripe.customers.create({ email })
            customerId = customer.id

            // Save to profile
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId)
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${req.headers.origin}/settings?success=true`,
            cancel_url: `${req.headers.origin}/settings?canceled=true`,
            metadata: { userId }
        })

        res.json({ url: session.url })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

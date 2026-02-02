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

    const { userId } = req.body

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_subscription_id')
            .eq('id', userId)
            .single()

        if (profile?.stripe_subscription_id) {
            await stripe.subscriptions.cancel(profile.stripe_subscription_id)
        }

        await supabase
            .from('profiles')
            .update({ plan: 'free', stripe_subscription_id: null })
            .eq('id', userId)

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

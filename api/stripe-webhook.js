import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

export const config = {
    api: { bodyParser: false }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']

    let event
    try {
        event = stripe.webhooks.constructEvent(
            buf,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            const userId = session.metadata.userId
            const subscriptionId = session.subscription

            // Get subscription to determine plan
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0].price.id

            let plan = 'free'
            if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'starter'
            if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'

            await supabase
                .from('profiles')
                .update({ 
                    plan,
                    stripe_subscription_id: subscriptionId
                })
                .eq('id', userId)
            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object
            const priceId = subscription.items.data[0].price.id

            let plan = 'free'
            if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'starter'
            if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'

            await supabase
                .from('profiles')
                .update({ plan })
                .eq('stripe_subscription_id', subscription.id)
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object
            await supabase
                .from('profiles')
                .update({ plan: 'free', stripe_subscription_id: null })
                .eq('stripe_subscription_id', subscription.id)
            break
        }
    }

    res.json({ received: true })
}

import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Standard Webhook Handler Pattern
 * Includes: Signature verification and async delegation.
 */
export async function handleStripeWebhook(req: any, res: any) {
  const sig = req.headers['stripe-signature']
  let event: Stripe.Event

  try {
    // 1. Verify Signature
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // 2. Acknowledge Receipt Immediately
  res.json({ received: true })

  // 3. Delegate to Queue
  await addToQueue('webhook-events', {
    type: event.type,
    id: event.id,
    data: event.data.object
  })
}

async function addToQueue(name: string, data: any) {
  // Integration with message-queues skill
}

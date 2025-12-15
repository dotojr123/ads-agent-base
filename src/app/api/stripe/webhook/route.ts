import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Map Price IDs to Plans
const PRICE_MAP: Record<string, 'STARTER' | 'PRO' | 'AGENCY'> = {
  [process.env.STRIPE_PRICE_ID_STARTER!]: 'STARTER',
  [process.env.STRIPE_PRICE_ID_PRO!]: 'PRO',
  [process.env.STRIPE_PRICE_ID_AGENCY!]: 'AGENCY',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === 'checkout.session.completed') {
    const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string)
    const workspaceId = session.metadata?.workspaceId

    if (workspaceId) {
      // Determines plan based on price ID
      // Assuming single item subscription
      const priceId = subscription.items.data[0].price.id
      const plan = PRICE_MAP[priceId] || 'STARTER'

      await prisma.subscription.update({
        where: { workspaceId },
        data: {
          stripeSubscriptionId: subscription.id,
          status: 'ACTIVE',
          plan: plan,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      })
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string)
    // metadata might not persist on invoice, rely on customer lookup if needed

    // Better to find by stripeSubscriptionId
    if (subscription.id) {
       await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      })
    }
  }

  // Handle cancellations, etc.
  if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: 'CANCELED',
            plan: 'STARTER' // Downgrade or just mark canceled
        }
      })
  }

  return new NextResponse(null, { status: 200 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { checkWorkspaceAccess } from '@/lib/dal'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const userId = (session.user as any).id

  const { priceId, workspaceId } = await req.json()

  // Verify user has access to this workspace
  const access = await checkWorkspaceAccess(userId, workspaceId)
  if (!access || access.role !== 'OWNER') {
    return new NextResponse('Forbidden: Only Owners can manage billing', { status: 403 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { subscription: true }
  })

  if (!workspace) {
    return new NextResponse('Workspace not found', { status: 404 })
  }

  // Get or Create Stripe Customer
  let stripeCustomerId = workspace.subscription?.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: workspace.name,
      metadata: {
        workspaceId: workspaceId
      }
    })
    stripeCustomerId = customer.id

    // Update subscription with customer ID
    await prisma.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        stripeCustomerId,
        status: 'INCOMPLETE',
        plan: 'STARTER'
      },
      update: {
        stripeCustomerId
      }
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      workspaceId: workspaceId,
    },
    success_url: `${process.env.NEXTAUTH_URL}/app/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/app/settings`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}

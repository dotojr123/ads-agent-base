import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })

    const rule = await prisma.automationRule.findUnique({ where: { id: params.id } })
    if (!rule) return new NextResponse('Not Found', { status: 404 })

    const updated = await prisma.automationRule.update({
        where: { id: params.id },
        data: { active: !rule.active }
    })

    return NextResponse.json(updated)
}

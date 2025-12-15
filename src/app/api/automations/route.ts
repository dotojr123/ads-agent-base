import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserWorkspaces } from '@/lib/dal'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })

    // TODO: Support multiple workspaces via query param
    const workspaces = await getUserWorkspaces((session.user as any).id)
    if (!workspaces.length) return NextResponse.json([])
    const workspaceId = workspaces[0].workspaceId

    const rules = await prisma.automationRule.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })

    const body = await req.json()
    const { name, platform, condition, action, actionConfig } = body

    const workspaces = await getUserWorkspaces((session.user as any).id)
    if (!workspaces.length) return new NextResponse('No workspace', { status: 400 })
    const workspaceId = workspaces[0].workspaceId

    const rule = await prisma.automationRule.create({
        data: {
            workspaceId,
            name,
            platform,
            condition,
            action,
            actionConfig,
            active: true
        }
    })

    return NextResponse.json(rule)
}

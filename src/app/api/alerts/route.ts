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

    const alerts = await prisma.alert.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        include: { rule: { select: { name: true } } }
    })

    return NextResponse.json(alerts)
}

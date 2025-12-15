import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/encryption'
import { getUserWorkspaces } from '@/lib/dal'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })
    const userId = (session.user as any).id

    // In a real app we'd get workspaceId from query param or header
    // Here we pick the first one for simplicity
    const workspaces = await getUserWorkspaces(userId)
    if (!workspaces.length) return NextResponse.json([])

    const workspaceId = workspaces[0].workspaceId

    const accounts = await prisma.adAccount.findMany({
        where: { workspaceId },
        select: {
            id: true,
            name: true,
            platform: true,
            externalId: true,
            // don't return tokens
        }
    })

    return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })
    const userId = (session.user as any).id

    const body = await req.json()
    // NOTE: In a real production app, 'accessToken' should NOT be passed from the client directly like this.
    // Instead, the client should trigger an OAuth flow (e.g. /api/auth/facebook), and the server
    // should exchange the code for a token and save it securely in the callback.
    // This implementation is a SIMULATION to allow testing the UI/DB flow without a real App configured.
    const { platform, name, externalId, accessToken } = body

    // Validation
    if (!platform || !accessToken) return new NextResponse('Missing fields', { status: 400 })

    const workspaces = await getUserWorkspaces(userId)
    if (!workspaces.length) return new NextResponse('No workspace', { status: 400 })
    const workspaceId = workspaces[0].workspaceId

    // Encrypt token
    const encryptedToken = encrypt(accessToken)

    // Save to DB
    const account = await prisma.adAccount.create({
        data: {
            workspaceId,
            platform: platform, // META or GOOGLE
            name: name || `${platform} Account`,
            externalId: externalId || 'unknown',
            accessToken: encryptedToken,
        }
    })

    return NextResponse.json({ success: true, account: { id: account.id, name: account.name, platform: account.platform } })
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return new NextResponse('Missing ID', { status: 400 })

    await prisma.adAccount.delete({
        where: { id }
    })

    return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // In real app, filter by user workspace
    const rules = await prisma.automationRule.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
    const body = await req.json()

    // Ensure a workspace exists for the demo
    let workspace = await prisma.workspace.findFirst()
    if (!workspace) {
        workspace = await prisma.workspace.create({ data: { name: 'Demo Workspace' } })
    }

    const rule = await prisma.automationRule.create({
        data: {
            workspaceId: workspace.id,
            name: body.name,
            triggerType: body.triggerType,
            triggerValue: parseFloat(body.triggerValue),
            actionType: body.actionType,
            actionValue: body.actionValue ? parseFloat(body.actionValue) : null
        }
    })
    return NextResponse.json(rule)
}

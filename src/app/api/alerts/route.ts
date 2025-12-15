import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const alerts = await prisma.alert.findMany({
        orderBy: { triggeredAt: 'desc' },
        include: { automationRule: true }
    })
    return NextResponse.json(alerts)
}

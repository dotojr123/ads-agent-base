import { NextRequest, NextResponse } from 'next/server'
import { checkAutomationRules } from '@/lib/automation-engine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const results = await checkAutomationRules()
        return NextResponse.json({ success: true, results })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

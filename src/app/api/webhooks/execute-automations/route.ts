import { NextRequest, NextResponse } from 'next/server'
import { runAutomations } from '@/lib/automation-engine'

async function handler() {
    try {
        const results = await runAutomations()
        return NextResponse.json({ success: true, count: results.length, results })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    return handler()
}

export async function GET(req: NextRequest) {
    return handler()
}

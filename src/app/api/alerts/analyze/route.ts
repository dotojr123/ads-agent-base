import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return new NextResponse('Unauthorized', { status: 401 })

    const { alert } = await req.json()

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ suggestion: 'IA não configurada.' })

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    try {
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um especialista em tráfego pago. Analise o alerta e sugira uma ação corretiva imediata. Responda em 1 frase curta e direta.' },
                { role: 'user', content: `Alerta: ${alert.title}. Mensagem: ${alert.message}. O que devo fazer?` }
            ]
        })

        return NextResponse.json({ suggestion: response.choices[0].message.content })
    } catch (e) {
        return NextResponse.json({ suggestion: 'Não foi possível gerar sugestão.' })
    }
}

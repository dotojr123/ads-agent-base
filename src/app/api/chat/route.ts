import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { tools, executeTool } from '@/agent/tools'
import fs from 'fs'
import path from 'path'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/db'
import { getUserWorkspaces } from '@/lib/dal'
import { decrypt } from '@/lib/encryption'
import { Platform } from '@prisma/client'

// Carregar conhecimento do agente
function loadKnowledge(): string {
  try {
    const knowledgePath = path.join(process.cwd(), 'knowledge', 'ads-knowledge-2025.md')
    if (fs.existsSync(knowledgePath)) {
        return fs.readFileSync(knowledgePath, 'utf-8')
    }
    const oldPath = path.join(process.cwd(), 'knowledge', 'ads-knowledge.md')
    return fs.readFileSync(oldPath, 'utf-8')
  } catch (error) {
    console.error('Erro ao carregar knowledge:', error)
    return ''
  }
}

const SYSTEM_PROMPT = `Você é o AI Agent Ads, um agente de tráfego especializado em Facebook/Meta Ads e Google Ads (Estratégias 2025).

${loadKnowledge()}

## INSTRUÇÕES DE EXECUÇÃO

1. Quando o usuário pedir para analisar, criar ou gerenciar campanhas, USE AS FERRAMENTAS DISPONÍVEIS (fb_* ou google_*).
2. Sempre explique o que está fazendo antes de executar uma ação.
3. Após executar uma ferramenta, interprete os resultados e forneça insights baseados nas melhores práticas de 2025 (ROAS, LTV, Criativos, PMax).
4. Se houver erro de token, avise o usuário.
5. Seja proativo em sugerir otimizações e melhorias.

## ⚠️ FORMATO DE RESPOSTA OBRIGATÓRIO - ESTILO RELATÓRIO EXECUTIVO

### REGRAS DE FORMATAÇÃO:
1. **SEMPRE use tabelas Markdown** para apresentar métricas e dados comparativos
2. **SEMPRE use separadores** (---) entre seções
3. **NUNCA** escreva parágrafos longos - use bullet points
4. **SEMPRE** comece com um resumo executivo de 1 linha
5. **SEMPRE** termine com "Próximas Ações" numeradas
`

interface LogEntry {
  type: 'info' | 'tool' | 'result' | 'error'
  message: string
}

export async function POST(request: NextRequest) {
  const logs: LogEntry[] = []

  const addLog = (type: LogEntry['type'], message: string) => {
    logs.push({ type, message })
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
       // Allow bypassing in demo if needed, but strict for real app
       // return new NextResponse('Unauthorized', { status: 401 })
       addLog('info', '⚠️ Sessão não encontrada (Demo Mode?)')
    }

    const { messages, context } = await request.json()
    // context: { platform: 'all'|'meta'|'google', workspaceId: string }

    addLog('info', '📥 Requisição recebida')

    // --- 1. RESOLVE WORKSPACE & ACCOUNTS ---
    let workspaceId = context?.workspaceId

    if (workspaceId === 'default' && session?.user && (session.user as any).id) {
        const workspaces = await getUserWorkspaces((session.user as any).id)
        if (workspaces.length > 0) workspaceId = workspaces[0].workspaceId
    }

    // --- 2. LOAD CREDENTIALS FROM DB ---
    const toolConfig: { facebook?: any, google?: any } = {}

    if (workspaceId && session?.user && (session.user as any).id) {
        addLog('info', `🏢 Carregando credenciais para Workspace: ${workspaceId}`)

        try {
            // Find Accounts
            const accounts = await prisma.adAccount.findMany({
                where: {
                    workspaceId,
                    ...(context?.platform !== 'all' ? { platform: context.platform.toUpperCase() as Platform } : {})
                }
            })

            // Populate Config
            accounts.forEach(acc => {
                const token = decrypt(acc.accessToken)
                if (acc.platform === 'META') {
                    // Use the first Meta account found for context (MVP limitation)
                    if (!toolConfig.facebook) {
                        toolConfig.facebook = { accessToken: token, adAccountId: acc.externalId }
                        addLog('info', `✅ Conta Meta carregada: ${acc.name}`)
                    }
                } else if (acc.platform === 'GOOGLE') {
                     if (!toolConfig.google) {
                        toolConfig.google = { accessToken: token } // In real app, more fields needed
                        addLog('info', `✅ Conta Google carregada: ${acc.name}`)
                     }
                }
            })
        } catch (dbError) {
             addLog('error', '⚠️ Erro ao ler banco de dados (ignorando em modo de falha)')
             console.error(dbError)
        }
    } else {
        addLog('info', '⚠️ Sem workspace definido, rodando sem credenciais (Mock Mode)')
    }

    if (!process.env.OPENAI_API_KEY) {
      addLog('error', '❌ OPENAI_API_KEY não configurada')
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    ]

    addLog('info', '🚀 Enviando para OpenAI...')

    let response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: openAIMessages,
      tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[],
      tool_choice: 'auto',
    })

    let responseMessage = response.choices[0].message
    let finishReason = response.choices[0].finish_reason

    // Loop Tool Calls
    while (finishReason === 'tool_calls' && responseMessage.tool_calls) {
      const toolCalls = responseMessage.tool_calls
      openAIMessages.push(responseMessage)

      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') continue
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        addLog('tool', `🔧 Executando: ${functionName}`)

        // Execute with loaded config
        const toolResult = await executeTool(functionName, functionArgs, toolConfig)

        openAIMessages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify(toolResult),
        })
      }

      response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: openAIMessages,
        tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[],
        tool_choice: 'auto',
      })

      responseMessage = response.choices[0].message
      finishReason = response.choices[0].finish_reason
    }

    return NextResponse.json({
      content: responseMessage.content || 'Sem resposta.',
      logs,
    })

  } catch (error: unknown) {
    console.error('❌ Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno', logs }, { status: 500 })
  }
}

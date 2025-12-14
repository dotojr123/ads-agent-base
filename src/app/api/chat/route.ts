import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { tools, executeTool } from '@/agent/tools'
import fs from 'fs'
import path from 'path'

// Carregar conhecimento do agente
function loadKnowledge(): string {
  try {
    const knowledgePath = path.join(process.cwd(), 'knowledge', 'ads-knowledge.md')
    return fs.readFileSync(knowledgePath, 'utf-8')
  } catch (error) {
    console.error('Erro ao carregar knowledge:', error)
    return ''
  }
}

// System prompt do agente
const SYSTEM_PROMPT = `Você é o AI Agent Ads, um agente de tráfego especializado em Facebook/Meta Ads.

${loadKnowledge()}

## INSTRUÇÕES DE EXECUÇÃO

1. Quando o usuário pedir para analisar, criar ou gerenciar campanhas, USE AS FERRAMENTAS DISPONÍVEIS.
2. Sempre explique o que está fazendo antes de executar uma ação.
3. Após executar uma ferramenta, interprete os resultados e forneça insights.
4. Se houver erro de token expirado, oriente o usuário a renovar em: https://developers.facebook.com/tools/explorer/
5. Seja proativo em sugerir otimizações e melhorias.

## ⚠️ FORMATO DE RESPOSTA OBRIGATÓRIO - ESTILO RELATÓRIO EXECUTIVO

VOCÊ DEVE SEMPRE formatar suas respostas como um RELATÓRIO EXECUTIVO PROFISSIONAL:

### REGRAS DE FORMATAÇÃO:
1. **SEMPRE use tabelas Markdown** para apresentar métricas e dados comparativos
2. **SEMPRE use separadores** (---) entre seções
3. **NUNCA** escreva parágrafos longos - use bullet points
4. **SEMPRE** comece com um resumo executivo de 1 linha
5. **SEMPRE** termine com "Próximas Ações" numeradas

### ESTRUTURA OBRIGATÓRIA PARA ANÁLISES:

# 📊 [Título do Relatório]

**Resumo:** [Uma frase com o insight principal]

---

## Métricas Principais

| Métrica | Valor | Status |
|---------|-------|--------|
| Investimento | R$ X.XXX | - |
| CTR | X.XX% | ✅ Bom / ⚠️ Atenção / ❌ Crítico |
| CPC | R$ X.XX | ✅ / ⚠️ / ❌ |
| CPM | R$ XX.XX | ✅ / ⚠️ / ❌ |

---

## Análise por Campanha

| Campanha | Gasto | CTR | CPC | Status |
|----------|-------|-----|-----|--------|
| Nome 1 | R$ XX | X% | R$ X | ✅ |
| Nome 2 | R$ XX | X% | R$ X | ⚠️ |

---

## 🎯 Próximas Ações

1. **Ação 1** - descrição curta
2. **Ação 2** - descrição curta
3. **Ação 3** - descrição curta

### BENCHMARKS PARA STATUS:
- CTR: ✅ >2% | ⚠️ 1-2% | ❌ <1%
- CPC: ✅ <R$0.50 | ⚠️ R$0.50-1.00 | ❌ >R$1.00
- CPM: ✅ <R$15 | ⚠️ R$15-30 | ❌ >R$30
- Frequência: ✅ <2 | ⚠️ 2-3 | ❌ >3
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
    const { messages, config } = await request.json()

    addLog('info', '📥 Requisição recebida')

    if (!process.env.OPENAI_API_KEY) {
      addLog('error', '❌ OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { error: 'OPENAI_API_KEY não configurada', logs },
        { status: 500 }
      )
    }

    addLog('info', '🔑 API Key encontrada')

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Preparar mensagens para OpenAI (incluindo system prompt)
    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    ]

    addLog('info', `🧠 Modelo: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`)

    // Primeira chamada
    addLog('info', '🚀 Enviando para OpenAI...')

    let response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: openAIMessages,
      tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[],
      tool_choice: 'auto',
    })

    let responseMessage = response.choices[0].message
    let finishReason = response.choices[0].finish_reason

    addLog('info', `📨 Resposta recebida (finish_reason: ${finishReason})`)

    // Loop para processar tool calls
    while (finishReason === 'tool_calls' && responseMessage.tool_calls) {
      const toolCalls = responseMessage.tool_calls

      addLog('info', `🔧 ${toolCalls.length} tool(s) para executar`)

      // Adicionar mensagem do assistente com as chamadas de ferramentas ao histórico
      openAIMessages.push(responseMessage)

      // Executar todas as ferramentas
      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') continue

        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        addLog('tool', `🔧 Executando: ${functionName}`)
        addLog('info', `📥 Input: ${JSON.stringify(functionArgs).slice(0, 100)}...`)

        // Passando config para o executeTool
        const toolResult = await executeTool(functionName, functionArgs, config)

        const resultStr = JSON.stringify(toolResult).slice(0, 200)
        addLog('result', `📤 Resultado: ${resultStr}...`)

        // Adicionar resultado da ferramenta ao histórico
        openAIMessages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify(toolResult),
        })
      }

      addLog('info', '🔄 Continuando conversa com OpenAI...')

      // Nova chamada com resultados das ferramentas
      response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: openAIMessages,
        tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[],
        tool_choice: 'auto',
      })

      responseMessage = response.choices[0].message
      finishReason = response.choices[0].finish_reason

      addLog('info', `📨 Resposta recebida (finish_reason: ${finishReason})`)
    }

    addLog('info', '✅ Processamento concluído!')

    return NextResponse.json({
      content: responseMessage.content || 'Sem resposta do agente.',
      logs,
    })

  } catch (error: unknown) {
    console.error('❌ Erro na API:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    addLog('error', `❌ Erro: ${errorMessage}`)

    if (error instanceof Error) {
      console.error('Mensagem:', error.message)
      console.error('Stack:', error.stack)
    }

    if (errorMessage.includes('expired') || errorMessage.includes('token')) {
      return NextResponse.json({
        content: `❌ **Token do Facebook expirado!**

Para renovar:
1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu App
3. Marque as permissões: \`ads_read\`, \`ads_management\`
4. Clique em "Generate Access Token"
5. Copie e cole no arquivo \`.env\`
6. Reinicie o servidor

Depois tente novamente! 🔄`,
        logs,
      })
    }

    return NextResponse.json(
      { error: errorMessage, logs },
      { status: 500 }
    )
  }
}

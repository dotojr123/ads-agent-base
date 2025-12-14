# 📚 AI Agent Ads - Código Explicado

> Documentação detalhada de cada arquivo do projeto.

---

## 📁 Estrutura Geral

```
ads-agent/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 🖥️ Interface do chat
│   │   ├── layout.tsx            # Layout base do Next.js
│   │   ├── globals.css           # Estilos globais
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts      # 🧠 Cérebro do agente
│   └── agent/
│       └── tools/
│           ├── index.ts          # 📋 Catálogo de tools
│           └── facebook-api.ts   # 🔌 Integrações Facebook
├── knowledge/
│   └── ads-knowledge.md          # 📚 Conhecimento do agente
├── docs/
│   └── diagramas-agente.md       # 📊 Diagramas Mermaid
└── .env                          # 🔐 Credenciais (não commitado)
```

---

# 🖥️ page.tsx - Interface do Chat

**Localização:** `src/app/page.tsx`

**Objetivo:** Renderizar a interface visual do chat. Zero inteligência - só React.

## Estrutura do Código

```typescript
// ============================================
// IMPORTS
// ============================================
"use client"; // Componente client-side (React interativo)

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // Renderiza markdown
import remarkGfm from "remark-gfm"; // Suporte a tabelas GFM

// ============================================
// INTERFACES (Tipagem TypeScript)
// ============================================
interface Message {
  role: "user" | "assistant"; // Quem enviou
  content: string; // Conteúdo da mensagem
}

interface LogEntry {
  timestamp: string; // Hora do log
  type: "info" | "tool" | "result" | "error"; // Tipo (cor diferente)
  message: string; // Texto do log
}

// ============================================
// MENSAGENS DE LOADING (UX)
// ============================================
// Aparecem progressivamente enquanto processa
const LOADING_MESSAGES = [
  { text: "🔍 Analisando sua solicitação...", delay: 0 },
  { text: "🔗 Conectando com Facebook Ads...", delay: 2000 },
  { text: "📊 Coletando dados das campanhas...", delay: 5000 },
  { text: "🧠 Processando métricas...", delay: 7000 },
  { text: "📝 Preparando relatório...", delay: 9000 },
  { text: "✨ Finalizando análise...", delay: 11000 },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  // --- Estados ---
  const [messages, setMessages] = useState<Message[]>([]); // Histórico do chat
  const [input, setInput] = useState(""); // Campo de input
  const [isLoading, setIsLoading] = useState(false); // Está processando?
  const [loadingMessage, setLoadingMessage] = useState(""); // Msg de loading atual
  const [logs, setLogs] = useState<LogEntry[]>([]); // Logs do agente
  const [showLogs, setShowLogs] = useState(true); // Mostrar painel?

  // --- Refs (referências DOM) ---
  const messagesEndRef = useRef<HTMLDivElement>(null); // Scroll automático
  const logsEndRef = useRef<HTMLDivElement>(null);
  const loadingTimersRef = useRef<NodeJS.Timeout[]>([]); // Timers do loading

  // --- Funções auxiliares ---

  // Adiciona log ao painel
  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  // Inicia mensagens de loading progressivas
  const startLoadingMessages = () => {
    loadingTimersRef.current.forEach((timer) => clearTimeout(timer));
    loadingTimersRef.current = [];

    LOADING_MESSAGES.forEach(({ text, delay }) => {
      const timer = setTimeout(() => setLoadingMessage(text), delay);
      loadingTimersRef.current.push(timer);
    });
  };

  // Para mensagens de loading
  const stopLoadingMessages = () => {
    loadingTimersRef.current.forEach((timer) => clearTimeout(timer));
    loadingTimersRef.current = [];
    setLoadingMessage("");
  };

  // Scroll automático pro final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Executa scroll quando mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessage]);

  // ============================================
  // FUNÇÃO PRINCIPAL: ENVIAR MENSAGEM
  // ============================================
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    startLoadingMessages(); // Inicia UX de loading

    addLog("info", `📤 Enviando mensagem: "${userMessage.slice(0, 50)}..."`);

    try {
      addLog("info", "🔄 Chamando API do OpenAI...");

      // *** CHAMADA PRO BACKEND ***
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro na resposta do servidor");
      }

      const data = await response.json();

      // Processa logs retornados pelo backend
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach(
          (log: { type: LogEntry["type"]; message: string }) => {
            addLog(log.type, log.message);
          }
        );
      }

      addLog("info", "✅ Resposta recebida com sucesso!");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Erro desconhecido";
      addLog("error", `❌ ${errorMsg}`);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Erro ao processar sua mensagem: ${errorMsg}`,
        },
      ]);
    } finally {
      stopLoadingMessages();
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDERIZAÇÃO (JSX)
  // ============================================
  return (
    <main>
      {/* Header com logo e botão de logs */}
      {/* Área de mensagens com ReactMarkdown */}
      {/* Indicador de loading com mensagem progressiva */}
      {/* Painel de logs (lateral) */}
      {/* Input de mensagem */}
    </main>
  );
}
```

## Pontos-chave

| Elemento             | Função                                    |
| -------------------- | ----------------------------------------- |
| `useState`           | Gerencia estado (mensagens, loading, etc) |
| `useRef`             | Referências DOM (scroll, timers)          |
| `useEffect`          | Efeitos colaterais (scroll automático)    |
| `fetch('/api/chat')` | Única conexão com backend                 |
| `ReactMarkdown`      | Renderiza resposta formatada              |
| `remarkGfm`          | Habilita tabelas no markdown              |

---

# 🧠 route.ts - Cérebro do Agente

**Localização:** `src/app/api/chat/route.ts`

**Objetivo:** Loop do agente. Onde a IA acontece.

## Estrutura do Código

```typescript
// ============================================
// IMPORTS
// ============================================
import OpenAI from "openai"; // SDK oficial da OpenAI
import { NextRequest, NextResponse } from "next/server";
import { tools, executeTool } from "@/agent/tools"; // Catálogo de tools
import fs from "fs";
import path from "path";

// ============================================
// CARREGAR KNOWLEDGE
// ============================================
// Lê o arquivo ads-knowledge.md e injeta no prompt
function loadKnowledge(): string {
  try {
    const knowledgePath = path.join(
      process.cwd(),
      "knowledge",
      "ads-knowledge.md"
    );
    return fs.readFileSync(knowledgePath, "utf-8");
  } catch (error) {
    console.error("Erro ao carregar knowledge:", error);
    return "";
  }
}

// ============================================
// SYSTEM PROMPT
// ============================================
// Define personalidade + conhecimento + formato de resposta
const SYSTEM_PROMPT = `Você é o AI Agent Ads, especialista em Facebook/Meta Ads.

${loadKnowledge()}  // ← Knowledge injetado aqui

## INSTRUÇÕES DE EXECUÇÃO
1. USE AS FERRAMENTAS quando precisar de dados
2. Explique o que está fazendo
3. Interprete resultados e forneça insights
...

## FORMATO DE RESPOSTA OBRIGATÓRIO
- SEMPRE use tabelas para métricas
- SEMPRE comece com resumo executivo
- SEMPRE termine com próximas ações
...
`;

// ============================================
// HANDLER PRINCIPAL (POST /api/chat)
// ============================================
export async function POST(request: NextRequest) {
  const logs: LogEntry[] = []; // Logs para retornar ao frontend

  // Função auxiliar para adicionar log
  const addLog = (type: LogEntry["type"], message: string) => {
    logs.push({ type, message });
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  try {
    const { messages } = await request.json();

    // Configurar cliente OpenAI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Preparar mensagens incluindo System Prompt
    const openAIMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // ============================================
    // PRIMEIRA CHAMADA A OPENAI
    // ============================================
    addLog("info", "🚀 Enviando para OpenAI...");

    let response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: openAIMessages,
      tools: tools, // ← Lista de ferramentas disponíveis
      tool_choice: "auto",
    });

    let responseMessage = response.choices[0].message;
    let finishReason = response.choices[0].finish_reason;

    // ============================================
    // 🔄 LOOP DO AGENTE (A MÁGICA!)
    // ============================================
    // Enquanto OpenAI retornar 'tool_calls', continua o loop
    while (finishReason === "tool_calls" && responseMessage.tool_calls) {
      const toolCalls = responseMessage.tool_calls;

      // Adicionar resposta (intenção de uso da tool) ao histórico
      openAIMessages.push(responseMessage);

      // Executar TODAS as ferramentas solicitadas
      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        addLog("tool", `🔧 Executando: ${functionName}`);

        // *** EXECUTA A TOOL ***
        const toolResult = await executeTool(functionName, functionArgs);

        addLog(
          "result",
          `📤 Resultado: ${JSON.stringify(toolResult).slice(0, 200)}...`
        );

        // Adicionar resultado da ferramenta ao histórico
        openAIMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(toolResult),
        });
      }

      addLog("info", "🔄 Continuando conversa com OpenAI...");

      // *** NOVA CHAMADA COM RESULTADOS ***
      response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: openAIMessages,
        tools: tools,
        tool_choice: "auto",
      });

      responseMessage = response.choices[0].message;
      finishReason = response.choices[0].finish_reason;
    }
    // ============================================
    // FIM DO LOOP
    // ============================================

    return NextResponse.json({
      content: responseMessage.content || "Sem resposta do agente.",
      logs,
    });
  } catch (error: unknown) {
    // Tratamento de erros
  }
}
```

## O Loop Explicado (ReAct Pattern)

1. **Raciocínio**: O agente recebe a mensagem e decide se precisa usar uma ferramenta (`tool_calls`).
2. **Ação**: Se precisar, o servidor executa a função correspondente (ex: `get_campaigns`).
3. **Observação**: O resultado da função é devolvido ao agente.
4. **Resposta Final**: O agente processa a informação e gera a resposta em linguagem natural.

---

# 📋 tools/index.ts - Catálogo de Ferramentas

**Localização:** `src/agent/tools/index.ts`

**Objetivo:** Define quais tools existem e roteia execução.

## Estrutura do Código

```typescript
// ============================================
// DEFINIÇÃO DAS TOOLS (OPENAI FORMAT)
// ============================================
export const tools = [
  {
    type: "function",
    function: {
      name: "get_ad_accounts",
      description: "Lista todas as contas de anúncios acessíveis...",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_campaigns",
      description: "Lista campanhas da conta...",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filtrar por status: ACTIVE, PAUSED, etc",
          },
        },
        required: [],
      },
    },
  },
  // ... outras tools
];

// ============================================
// EXECUTOR DE TOOLS
// ============================================
// Recebe nome + parâmetros e chama a função correta
export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<object> {
  switch (name) {
    case "get_campaigns":
      return await getCampaigns(input.status as string | undefined);

    // ... outros cases

    default:
      throw new Error(`Tool não encontrada: ${name}`);
  }
}
```

## Anatomia de uma Tool (OpenAI)

```typescript
{
  type: 'function',
  function: {
    name: 'nome_da_funcao',
    description: 'Descrição CLARA do que faz', // A IA usa isso para decidir
    parameters: {
      type: 'object',
      properties: { ... }, // Esquema JSON dos argumentos
      required: [...]
    }
  }
}
```

---

# 🔌 facebook-api.ts - Integrações

**Localização:** `src/agent/tools/facebook-api.ts`

**Objetivo:** Chamadas HTTP para Facebook Graph API.

> Este arquivo é agnóstico de IA. Ele apenas faz requisições HTTP para o Facebook usando o `META_ACCESS_TOKEN`.

```typescript
export async function getCampaigns(status?: string): Promise<object> {
  const token = getAccessToken();
  const accountId = getAdAccountId();

  let url = `${META_BASE_URL}/${accountId}/campaigns?...`;

  const response = await fetch(url);
  return await response.json();
}
```

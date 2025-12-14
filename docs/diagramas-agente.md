# 🤖 AI Agent Ads - Diagramas de Arquitetura

> Diagramas explicativos do funcionamento do agente de tráfego.
> Visualize em: https://mermaid.live

---

## 1. Arquitetura Geral do Agente

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Frontend (page.tsx)"]
        UI[Chat Interface]
        Loading[Loading Messages]
        Logs[Painel de Logs]
    end

    subgraph Backend["⚙️ Backend (route.ts)"]
        API["/api/chat"]
        Loop["🔄 Loop do Agente"]
        SP["System Prompt\n+ Knowledge"]
    end

    subgraph Tools["🔧 Tools"]
        Index["tools/index.ts\n(Catálogo)"]
        FB["facebook-api.ts\n(Integrações)"]
    end

    subgraph External["🌐 Externos"]
        OpenAI["🧠 OpenAI API\n(GPT-4o)"]
        Meta["📘 Facebook Graph API"]
    end

    subgraph Knowledge["📚 Knowledge"]
        KN["ads-knowledge.md\n(Benchmarks, Formato, Persona)"]
    end

    UI -->|"POST /api/chat"| API
    API --> SP
    KN -->|"Injetado no"| SP
    SP --> Loop
    Loop <-->|"chat.completions.create()"| OpenAI
    OpenAI -->|"tool_calls: get_campaigns"| Loop
    Loop -->|"executeTool()"| Index
    Index -->|"getCampaigns()"| FB
    FB <-->|"HTTP Request"| Meta
    Meta -->|"Dados"| FB
    FB -->|"Resultado"| Loop
    Loop -->|"Resposta Final"| API
    API -->|"JSON Response"| UI
```

---

## 2. O Loop do Agente (A Mágica)

Este é o coração do agente. O LLM **decide sozinho** quando precisa de dados externos.

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant F as 🖥️ Frontend
    participant B as ⚙️ Backend
    participant O as 🧠 OpenAI (GPT)
    participant T as 🔧 Tools
    participant M as 📘 Meta API

    U->>F: "Analise minhas campanhas"
    F->>B: POST /api/chat

    Note over B: Monta System Prompt<br/>+ Knowledge + Tools

    B->>O: chat.completions.create()

    Note over O: 🤔 "Preciso de dados..."

    O->>B: finish_reason: "tool_calls"<br/>tool: "get_campaigns"

    Note over B: 🔄 LOOP: Enquanto tool_calls

    B->>T: executeTool("get_campaigns")
    T->>M: GET /campaigns
    M->>T: [lista de campanhas]
    T->>B: resultado

    B->>O: role: "tool"<br/>content: [campanhas]

    Note over O: 🤔 "Preciso de insights..."

    O->>B: finish_reason: "tool_calls"<br/>tool: "get_campaigns_insights"

    B->>T: executeTool("get_campaigns_insights")
    T->>M: GET /insights
    M->>T: [métricas]
    T->>B: resultado

    B->>O: role: "tool"<br/>content: [métricas]

    Note over O: ✅ "Agora posso responder!"

    O->>B: finish_reason: "stop"<br/>content: "📊 Relatório..."

    Note over B: 🔄 LOOP: Encerra

    B->>F: { content: "📊 Relatório..." }
    F->>U: Exibe relatório formatado
```

---

## 3. Estrutura de Arquivos

```mermaid
flowchart LR
    subgraph Project["📁 ads-agent"]
        subgraph App["src/app"]
            Page["page.tsx\n🖥️ Interface"]
            subgraph API["api/chat"]
                Route["route.ts\n🧠 Cérebro"]
            end
        end

        subgraph Agent["src/agent/tools"]
            Index["index.ts\n📋 Catálogo"]
            FBAPI["facebook-api.ts\n🔌 Integrações"]
        end

        subgraph Know["knowledge"]
            Knowledge["ads-knowledge.md\n📚 Contexto"]
        end
    end

    Page -->|"fetch()"| Route
    Route -->|"import"| Index
    Route -->|"loadKnowledge()"| Knowledge
    Index -->|"import"| FBAPI
```

---

## 4. Chatbot vs Agente

A diferença fundamental: **agente decide e age**.

```mermaid
flowchart LR
    subgraph Chatbot["❌ Chatbot Tradicional"]
        U1[Usuário] --> L1[LLM] --> R1[Resposta]
    end

    subgraph Agente["✅ Agente com Tools"]
        U2[Usuário] --> L2[LLM]
        L2 -->|"🤔 Preciso de dados"| T2[Tool]
        T2 -->|"📊 Dados"| L2
        L2 -->|"🤔 Preciso de mais"| T3[Tool]
        T3 -->|"📊 Mais dados"| L2
        L2 --> R2[Resposta Completa]
    end
```

---

## 5. Papel do Knowledge

O Knowledge transforma dados brutos em **insights acionáveis**.

```mermaid
flowchart TB
    subgraph Input["📥 Entrada"]
        User["Usuário: 'Como está minha campanha?'"]
    end

    subgraph Process["🧠 Processamento"]
        subgraph WithoutK["Sem Knowledge"]
            Data1["Dados: CTR 4.44%"]
            Resp1["Resposta: 'Seu CTR é 4.44%'"]
        end

        subgraph WithK["Com Knowledge"]
            Data2["Dados: CTR 4.44%"]
            Know["Knowledge:\n• CTR bom > 2%\n• Formato: tabelas\n• Tom: executivo"]
            Resp2["Resposta: '✅ CTR Excelente!\n4.44% está 2x acima\ndo benchmark (2%)'"]
        end
    end

    User --> Data1 --> Resp1
    User --> Data2
    Know --> Data2
    Data2 --> Resp2

    style WithoutK fill:#ff6b6b22,stroke:#ff6b6b
    style WithK fill:#51cf6622,stroke:#51cf66
```

---

## 6. Fluxo de Decisão do Agente

```mermaid
flowchart TD
    Start([Mensagem do Usuário]) --> Parse[OpenAI analisa a mensagem]
    Parse --> Decision{Precisa de dados<br/>externos?}

    Decision -->|Não| Respond[Responde direto]
    Decision -->|Sim| SelectTool[Seleciona Tool apropriada]

    SelectTool --> Execute[Executa Tool]
    Execute --> GetData[Recebe dados]
    GetData --> Decision2{Precisa de<br/>mais dados?}

    Decision2 -->|Sim| SelectTool
    Decision2 -->|Não| Analyze[Analisa todos os dados]

    Analyze --> Format[Formata resposta<br/>conforme Knowledge]
    Format --> Respond

    Respond --> End([Resposta para usuário])

    style Decision fill:#ffd43b22,stroke:#ffd43b
    style Decision2 fill:#ffd43b22,stroke:#ffd43b
    style Execute fill:#228be622,stroke:#228be6
    style Format fill:#51cf6622,stroke:#51cf66
```

---

## 7. Anatomia de uma Tool

```mermaid
flowchart LR
    subgraph Definition["📋 Definição (tools/index.ts)"]
        Name["name: 'get_campaigns'"]
        Desc["description: 'Lista campanhas...'"]
        Schema["parameters: { status, limit }"]
    end

    subgraph Execution["⚡ Execução (facebook-api.ts)"]
        Func["getCampaigns(status, limit)"]
        HTTP["fetch(graph.facebook.com)"]
        Return["return data"]
    end

    subgraph Usage["🧠 Uso pela OpenAI"]
        Decide["Modelo decide usar"]
        Call["tool_calls: get_campaigns"]
        Receive["Recebe resultado"]
    end

    Definition --> Usage
    Usage --> Execution
    Execution --> Usage
```

---

## 8. Comparação: Tool Simples vs MCP

```mermaid
flowchart TB
    subgraph Simple["🔧 Tool Simples (Este projeto)"]
        S1[Usuário] --> S2[OpenAI API]
        S2 --> S3["executeTool()\n(mesmo processo)"]
        S3 --> S4[Facebook API]
        S4 --> S3
        S3 --> S2
        S2 --> S5[Resposta]
    end

    subgraph MCP["🔌 MCP (Model Context Protocol)"]
        M1[Usuário] --> M2[OpenAI API]
        M2 --> M3[MCP Client]
        M3 --> M4["MCP Server\n(processo separado)"]
        M4 --> M5[Qualquer API]
        M5 --> M4
        M4 --> M3
        M3 --> M2
        M2 --> M6[Resposta]
    end

    style Simple fill:#51cf6622,stroke:#51cf66
    style MCP fill:#228be622,stroke:#228be6
```

---

## 📊 Resumo Visual

| Componente | Arquivo            | Função         | Tem IA? |
| ---------- | ------------------ | -------------- | ------- |
| Interface  | `page.tsx`         | Chat UI        | ❌      |
| Cérebro    | `route.ts`         | Loop do agente | ✅      |
| Catálogo   | `tools/index.ts`   | Define tools   | ❌      |
| Integração | `facebook-api.ts`  | Chama APIs     | ❌      |
| Contexto   | `ads-knowledge.md` | Alimenta IA    | ⚡      |

---

## 🔗 Links Úteis

- **Mermaid Live Editor**: https://mermaid.live
- **OpenAI Tool Calling**: https://platform.openai.com/docs/guides/function-calling
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api

---

_Gerado para o curso AI Agent Ads - Agente de Tráfego_

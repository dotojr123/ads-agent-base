# 🤖 AI Agent Ads - Agente de Tráfego

> Agente de IA especializado em Facebook/Meta Ads usando Claude Opus 4

## 🎯 O que este agente faz?

Este é um agente de tráfego inteligente que:

- ✅ **Analisa campanhas** - Métricas, performance, ROI
- ✅ **Cria campanhas** - ASC, Leads, Conversões
- ✅ **Otimiza anúncios** - Sugere melhorias baseado em dados
- ✅ **Gera relatórios** - Performance diária/semanal
- ✅ **Responde perguntas** - Como um especialista em tráfego

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Claude API (Anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Facebook/Meta Ads
META_ACCESS_TOKEN=EAAZAisZBEEli4BQ...
META_AD_ACCOUNT_ID=act_2881836401882483
META_PAGE_ID=354471961693587
META_PIXEL_ID=512054569681165
```

### 3. Obter Token do Facebook

⚠️ **IMPORTANTE:** O token do Facebook expira a cada 2 horas!

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu App
3. Marque as permissões:
   - `ads_read`
   - `ads_management`
   - `business_management`
4. Clique em "Generate Access Token"
5. Copie e cole no `.env`

### 4. Rodar o agente

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
ads-agent/
├── src/
│   ├── agent/
│   │   ├── index.ts          # Agente principal
│   │   ├── tools/            # Ferramentas do agente
│   │   │   ├── facebook-api.ts
│   │   │   ├── campaign-creator.ts
│   │   │   ├── analytics.ts
│   │   │   └── index.ts
│   │   └── prompts/
│   │       └── system.md     # Prompt do sistema (persona)
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # API endpoint
│   └── app/
│       └── page.tsx          # Interface do chat
├── knowledge/
│   └── claude.md             # Conhecimento do agente
├── .env.example
├── .env
├── package.json
└── README.md
```

## 🧠 Como o Agente Funciona

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                   Chat Interface                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    API (Next.js)                         │
│                   /api/chat                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 AGENTE (Claude Opus 4)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ System      │  │ Knowledge   │  │ Tools       │      │
│  │ Prompt      │  │ (claude.md) │  │ (Facebook)  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FACEBOOK ADS API (Graph API)                │
│  Campanhas | AdSets | Ads | Insights | Creatives        │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Execução

1. **Usuário envia mensagem** no chat
2. **API recebe** e monta contexto (system prompt + knowledge)
3. **Claude Opus 4** processa e decide qual tool usar
4. **Tool executa** (ex: buscar métricas no Facebook)
5. **Claude interpreta** resultado e responde
6. **Frontend exibe** resposta formatada

## 🛠️ Tools Disponíveis

| Tool | Descrição |
|------|-----------|
| `get_campaigns` | Lista todas as campanhas |
| `get_campaign_insights` | Métricas de uma campanha |
| `create_campaign` | Cria nova campanha |
| `create_adset` | Cria conjunto de anúncios |
| `create_ad` | Cria anúncio (sem imagem) |
| `pause_campaign` | Pausa campanha |
| `activate_campaign` | Ativa campanha |
| `get_ad_accounts` | Lista contas de anúncios |

## 📊 Exemplos de Uso

### Analisar performance

```
Usuário: "Analise a performance das minhas campanhas ativas"

Agente: Vou buscar os dados das suas campanhas...
[Executa get_campaigns + get_campaign_insights]

📊 ANÁLISE DE CAMPANHAS ATIVAS

1. [VENDA] Vibe Code Pro - ASC
   - Gasto: R$ 150,00
   - CTR: 4.18% ✅ Excelente
   - CPC: R$ 0,29
   - Vendas: 2
   - CPP: R$ 75,00

Recomendação: Escalar para R$ 200/dia
```

### Criar campanha

```
Usuário: "Crie uma campanha de vendas para o produto X"

Agente: Vou criar a campanha com as melhores práticas...
[Executa create_campaign + create_adset]

✅ Campanha criada com sucesso!
- ID: 120240007493560007
- Tipo: Advantage+ Sales (ASC)
- Budget: R$ 50/dia
- Status: PAUSADA (aguardando ativação)
```

## ⚙️ Configurações Avançadas

### Personalizar o Agente

Edite o arquivo `knowledge/claude.md` para adicionar:

- Informações sobre seus produtos
- Métricas e metas específicas
- Regras de negócio
- Histórico de campanhas

### Adicionar novas Tools

1. Crie o arquivo em `src/agent/tools/`
2. Exporte a função com schema Zod
3. Registre em `src/agent/tools/index.ts`

## 🔒 Segurança

- ⚠️ Nunca commite o arquivo `.env`
- ⚠️ Token do Facebook expira em 2h
- ⚠️ Use tokens de curta duração para testes
- ✅ Para produção, use tokens de longa duração

## 📚 Recursos

- [Documentação Claude API](https://docs.anthropic.com/)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## 🤝 Suporte

Dúvidas? Entre no grupo de alunos ou abra uma issue.

---

Desenvolvido com ❤️ para o curso AI Code Pro

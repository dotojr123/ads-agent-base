# 🤖 AI Agent Ads - SaaS Edition

> Plataforma SaaS Multi-tenant para gestão e otimização de anúncios Meta e Google Ads com IA (OpenAI GPT-4o).

Este repositório contém a versão completa (Fase 2) do sistema, evoluída para uma arquitetura SaaS escalável.

## 🎯 O que este sistema faz?

O **AI Agent Ads** é uma plataforma inteligente que permite gestão centralizada de campanhas publicitárias para múltiplos clientes (Workspaces):

- ✅ **Arquitetura Multi-tenant** - Gestão segregada por Workspace
- ✅ **Criação de Campanhas** - Meta Ads (Facebook/Instagram) e Google Ads
- ✅ **Análise com IA** - Insights de performance gerados por GPT-4o
- ✅ **Billing Próprio** - Integração completa com Stripe Assinaturas
- ✅ **Autenticação Segura** - Login Social e gestão de membros

## 🏗 Arquitetura & Tech Stack

O sistema utiliza tecnologias modernas focadas em performance e escala:

- **Framework:** Next.js 14 (App Router)
- **Autenticação:** NextAuth.js (Google, Facebook)
- **Banco de Dados:** PostgreSQL (Supabase) + Prisma 5
- **Billing:** Stripe (Checkout, Webhooks, Assinaturas)
- **IA:** OpenAI (GPT-4o Mini / GPT-4o)
- **Estilo:** Tailwind CSS + ShadcnUI

### Modelagem de Dados

O banco de dados foi estruturado para suportar múltiplos tenants:

- **Workspace:** Entidade principal que agrupa contas de anúncios e membros.
- **User:** Usuário autenticado.
- **AdAccount:** Credenciais de anúncios (Meta/Google) criptografadas por workspace.
- **Subscription:** Estado da assinatura Stripe.

## 🚀 Quick Start (Desenvolvimento Local)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais. Para rodar o SaaS completo, você precisará configurar:

```env
# --- BANCO DE DADOS (Supabase) ---
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# --- AUTENTICAÇÃO (NextAuth) ---
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# --- BILLING (Stripe) ---
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# --- ESTRATÉGIA IA ---
OPENAI_API_KEY="sk-..."

# --- SEGURANÇA ---
ENCRYPTION_KEY="chave-32-chars-para-tokens"
```

### 3. Configurar Banco de Dados

Crie as tabelas no seu banco PostgreSQL (Supabase recomendado):

```bash
npx prisma db push
```

### 4. Rodar a aplicação

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── (public)/       # Landing Page e Pricing (Public)
│   ├── (auth)/         # Rotas de Autenticação
│   ├── (app)/          # Área logada do SaaS (Dashboard, Chat)
│   └── api/            # Endpoints (Chat, Stripe, Accounts)
├── agent/
│   ├── index.ts        # Orquestrador do Agente
│   └── tools/          # Ferramentas (Meta/Google API Wrappers)
├── lib/                # Configurações globais (Auth, DB, Stripe, Crypto)
├── components/         # Componentes UI Reutilizáveis
└── prisma/             # Schema do Banco de Dados
```

## 🧠 Como a IA Funciona

1. **Contexto:** O usuário seleciona um Workspace e uma Plataforma (Meta ou Google).
2. **Processamento:** O backend (`/api/chat`) carrega as credenciais criptografadas daquele workspace.
3. **Execução:** O Agente (OpenAI) decide quais ferramentas usar (`get_campaigns`, `create_ad`, etc.) com base no prompt do sistema.
4. **Segurança:** As credenciais nunca são expostas ao frontend; tudo roda server-side.

## 📝 Checklist de Funcionalidades (Status Atual)

- [x] **Arquitetura Multi-tenant:** Database schema e isolamento de dados.
- [x] **Autenticação:** NextAuth com Providers configurados.
- [x] **Billing:** Integração completa com Stripe.
- [x] **Interface:** Dashboard, Chat, Histórico e Configurações.
- [x] **Tools Meta Ads:** Leitura e Escrita funcionais.
- [ ] **Tools Google Ads:** Implementação básica (necessita integração API oficial).
- [ ] **Fluxo OAuth Real:** O sistema atualmente usa tokens inseridos manualmente ou mocks para demonstração em alguns pontos.

---

Desenvolvido com ❤️

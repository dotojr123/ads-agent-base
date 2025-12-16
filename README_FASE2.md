# AI Agent Ads - SaaS Edition (Fase 2)

Este repositório contém a versão SaaS Multi-tenant do "AI Agent Ads", projetada para escalar a gestão de anúncios Meta e Google Ads.

## 🏗 Arquitetura

O sistema foi transformado de uma aplicação Single-User para uma plataforma SaaS completa utilizando:

- **Framework:** Next.js 14 (App Router)
- **Autenticação:** NextAuth.js (Google, Facebook)
- **Banco de Dados:** PostgreSQL (Supabase) + Prisma 5
- **Billing:** Stripe (Checkout, Webhooks, Assinaturas)
- **IA:** OpenAI (GPT-4o)

### Modelagem de Dados

O banco de dados foi estruturado para suportar múltiplos tenants (Workspaces):
- **User:** Usuário autenticado.
- **Workspace:** Entidade principal que agrupa contas de anúncios e membros.
- **UserWorkspace:** Relação N:N com papéis (Owner, Member).
- **AdAccount:** Credenciais de anúncios (Meta/Google) criptografadas.
- **Subscription:** Estado da assinatura Stripe.

---

## 🚀 Como Colocar em Produção

### 1. Variáveis de Ambiente Obrigatórias
Para o sistema funcionar em produção, você deve configurar as seguintes variáveis no seu provedor de hospedagem (Vercel/Railway/etc) e no arquivo `.env`:

```bash
# --- BANCO DE DADOS (Supabase) ---
# Obtenha no Dashboard do Supabase > Project Settings > Database
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# --- AUTENTICAÇÃO (NextAuth) ---
# Gere um segredo com `openssl rand -base64 32`
NEXTAUTH_SECRET="seu-segredo-super-seguro"
NEXTAUTH_URL="https://seu-dominio.com"

# --- LOGIN SOCIAL ---
# Console do Google Cloud > APIs & Services > Credentials
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Meta for Developers > App Settings > Basic
FACEBOOK_CLIENT_ID="seu-facebook-app-id"
FACEBOOK_CLIENT_SECRET="seu-facebook-app-secret"

# --- PAGAMENTOS (Stripe) ---
# Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Gerado ao criar o webhook no Stripe

# IDs dos Preços (Products > Pricing)
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_AGENCY="price_..."

# --- INTELIGÊNCIA ARTIFICIAL ---
OPENAI_API_KEY="sk-..."

# --- SEGURANÇA ---
# Chave de 32 caracteres para criptografar tokens no banco
ENCRYPTION_KEY="sua-chave-de-criptografia-32-chars"
```

### 2. Configurações Externas Necessárias
- **Stripe:** Configurar Webhook apontando para `https://seu-dominio.com/api/stripe/webhook` ouvindo eventos `checkout.session.completed`, `invoice.payment_succeeded`, etc.
- **Google Cloud:** Adicionar `https://seu-dominio.com/api/auth/callback/google` nas URIs de redirecionamento autorizadas.
- **Facebook App:** Adicionar "Facebook Login" e configurar OAuth Redirect URI para `https://seu-dominio.com/api/auth/callback/facebook`.
- **Supabase:** Rodar `npx prisma db push` para criar as tabelas.

---

## ✅ Checklist de Implementação (Fase 2)

### Concluído (Pronto para Uso)
- [x] **Arquitetura Multi-tenant:** Database schema e isolamento de dados por Workspace.
- [x] **Autenticação Base:** Estrutura NextAuth com Providers configurados.
- [x] **Billing (Backend):** Integração completa com Stripe (Webhooks, Checkout, Atualização de Assinatura).
- [x] **Interface do Usuário:** Dashboard, Chat, Histórico e Configurações reestruturados.
- [x] **Lógica de Agente:** Suporte a Meta Ads e Google Ads com ferramentas segregadas.
- [x] **Estratégia 2025:** Prompt de sistema atualizado com novas diretrizes de tráfego.

### Requer Configuração Real (Mocks/Simulações no Código)
Algumas partes do código usam simulações (Mocks) para permitir a demonstração sem chaves reais. Você deve revisar:

1.  **Conexão de Contas (`src/app/api/accounts/route.ts`):**
    - Atualmente simula um OAuth flow com tokens falsos.
    - **Ação:** Implementar fluxo real de OAuth para obter `access_token` e `refresh_token` do Facebook e Google Ads.

2.  **API do Google Ads (`src/agent/tools/google-api.ts`):**
    - Retorna dados estáticos de exemplo.
    - **Ação:** Integrar com a biblioteca oficial `google-ads-api` usando as credenciais do banco.

3.  **API do Meta Ads:**
    - Já possui integração real (`src/agent/tools/facebook-api.ts`), mas depende de token válido no banco.

4.  **Login:**
    - O provider "Credentials" (Email/Senha) está desativado/mocked por segurança. Recomenda-se usar apenas Social Login ou integrar Magic Links.

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── (public)/       # Landing Page e Pricing
│   ├── (auth)/         # Login
│   ├── (app)/          # Aplicação SaaS (Protegida)
│   └── api/            # Endpoints (Chat, Stripe, Accounts)
├── agent/tools/        # Ferramentas Meta/Google
├── lib/                # Configurações (Auth, DB, Stripe)
└── prisma/             # Schema do Banco de Dados
```

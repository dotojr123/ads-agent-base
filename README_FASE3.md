# FASE 3: Automações e Alertas Inteligentes

Implementação do motor de regras para otimização de campanhas Meta/Google Ads.

## 🚀 Funcionalidades

1.  **Motor de Automação (`src/lib/automation-engine.ts`)**
    - Monitora ROAS, CPC, Orçamento.
    - Executa ações (Pausar, Escalar, Alertar).
    - Dados simulados para testes seguros.

2.  **Alertas em Tempo Real**
    - Feed de notificações para o gestor de tráfego.
    - Integração com logs de auditoria.

3.  **UI de Gestão**
    - Dashboard de regras (`/automations`).
    - Builder de regras simples.
    - Timeline de alertas (`/alerts`).

## 🛠 Setup

1.  **Dependências:** `npm install`
2.  **Banco de Dados:** `npx prisma generate && npx prisma db push`
3.  **Executar:** `npm run dev`

## 🧪 Testando

1.  Acesse `/automations`.
2.  Crie uma regra (ex: Meta Threshold > 2.0).
3.  Clique em "Testar Engine" para simular o Cron Job.
4.  Verifique `/alerts` para ver o resultado.

## 📦 Estrutura

- `src/lib/automation-engine.ts`: Core logic.
- `src/app/api/cron`: Worker endpoint.
- `prisma/schema.prisma`: Modelos AutomationRule, Alert, AuditLog.

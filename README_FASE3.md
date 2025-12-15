# FASE 3: Automações e Alertas Inteligentes (SaaS Edition)

Esta fase introduz o motor de automação que monitora campanhas 24/7 e executa ações baseadas em regras configuráveis, além de um sistema de alertas com sugestões de IA.

## 🚀 Novas Funcionalidades

### 1. Motor de Automação
O sistema agora possui um "Worker" (acionado via Webhook/Cron) que:
- Varre todas as regras ativas de todos os workspaces.
- Coleta métricas em tempo real (Mocked na versão atual).
- Avalia condições (ex: CPC > R$ 5,00).
- Executa ações (Pausar Campanha, Notificar, Ajustar Orçamento).
- Gera logs de auditoria e alertas.

### 2. Gestão de Regras (`/app/automations`)
Interface para criar regras complexas:
- **Plataforma:** Meta Ads ou Google Ads.
- **Métricas:** CPC, ROAS, CTR.
- **Operadores:** Maior que, Menor que.
- **Ações:** Notificar, Pausar (Campanha/Ad), Aumentar Orçamento.

### 3. Central de Alertas com IA (`/app/alerts`)
Feed de notificações geradas pelas automações.
- **Diferencial:** Cada alerta possui um botão "Obter sugestão de IA", que analisa o contexto do alerta e sugere a próxima ação estratégica (usando GPT-4o).

## 🛠 Configuração Técnica

### 1. Cron Job (Agendador)
Para que as automações rodem automaticamente, configure um Cron Job para chamar o webhook a cada 5 ou 15 minutos.

**URL do Webhook:**
`POST https://seu-app.com/api/webhooks/execute-automations`

**Vercel Cron (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/webhooks/execute-automations",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### 2. Banco de Dados (Novas Tabelas)
O schema Prisma foi estendido com:
- `AutomationRule`: Definição da regra (JSON Condition).
- `Alert`: Notificações geradas.
- `AuditLog`: Histórico de execuções para compliance.

### 3. Variáveis de Ambiente
Nenhuma nova variável obrigatória além das da Fase 2, mas certifique-se de ter:
- `OPENAI_API_KEY`: Para as sugestões de IA nos alertas.
- `DATABASE_URL`: Para persistência das regras.

## 🧪 Como Testar (Simulação)
Como as conexões com APIs reais de anúncios são simuladas neste ambiente de demonstração:

1. Acesse `/app/automations`.
2. Crie uma regra (ex: "Meta Ads | CPC > 0.50 | Pausar Campanha").
3. Clique no botão **"Testar Agora"** no topo da página.
   - Isso chamará o webhook manualmente.
   - O sistema gerará dados aleatórios (Mock) para campanhas.
   - Se os dados aleatórios baterem com sua regra (ex: CPC gerado for 2.00), a regra disparará.
4. Vá para `/app/alerts` para ver o alerta gerado.
5. Clique em "Obter sugestão de IA" para ver a recomendação do GPT.

---

## 📦 Estrutura de Arquivos da Fase 3

```
src/
├── app/
│   ├── (app)/
│   │   ├── automations/    # UI de Gestão de Regras
│   │   └── alerts/         # UI de Feed de Alertas
│   └── api/
│       ├── automations/    # CRUD de Regras
│       ├── alerts/         # Leitura e Análise IA
│       └── webhooks/       # Endpoint do Cron
└── lib/
    └── automation-engine.ts # Lógica central de avaliação de regras
```

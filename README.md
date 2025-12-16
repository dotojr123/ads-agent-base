# 🤖 AI Agent Ads - Agente de Tráfego

> **Seu especialista em tráfego pago com IA.**
> Gerencie, analise e otimize suas campanhas do Facebook Ads conversando com um agente inteligente.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

## 🎯 O que este agente faz?

Este projeto usa a **OpenAI (GPT-4o)** conectada à **Facebook Graph API** para criar um assistente virtual capaz de:

- ✅ **Analisar Campanhas**: Fornece relatórios detalhados de performance (CTR, CPC, ROAS, etc).
- ✅ **Criar Estruturas**: Cria campanhas, conjuntos de anúncios e anúncios.
- ✅ **Otimizar**: Identifica oportunidades de escala ou corte de gastos.
- ✅ **Tirar Dúvidas**: Responde perguntas sobre estratégias de tráfego pago.

---

## 🚀 Guia de Instalação Passo a Passo

Siga este guia para rodar o projeto em sua máquina em menos de 5 minutos.

### 1. Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** (versão 18 ou superior)
- **Git**

### 2. Clonar e Instalar

Abra seu terminal e execute:

```bash
# Clone o repositório (se ainda não o fez)
git clone <url-do-repositorio>
cd ai-agent-ads

# Instale as dependências
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto. Você pode copiar o exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da OpenAI:

```env
# OpenAI API Key (Obrigatório)
OPENAI_API_KEY=sk-...

# Modelo (Opcional, padrão: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

> **Nota:** As credenciais do Facebook NÃO precisam estar no `.env` para uso local. Você pode configurá-las diretamente na interface do usuário para maior segurança.

### 4. Rodar o Projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse em seu navegador: **http://localhost:3000**

---

## ⚙️ Como Obter o Token do Facebook (Passo Crucial)

Para que o agente funcione, ele precisa de permissão para acessar seus anúncios. O jeito mais fácil de testar é gerando um token temporário.

1. Acesse o **[Graph API Explorer](https://developers.facebook.com/tools/explorer/)**.
2. No menu lateral "Meta App", selecione seu aplicativo (ou crie um novo se não tiver).
3. Em "User or Page", selecione "User Token".
4. Em **Permissions**, adicione as seguintes permissões (procure na lista):
   - `ads_read` (Ler dados de anúncios)
   - `ads_management` (Criar/Editar anúncios)
   - `read_insights` (Ler métricas)
5. Clique no botão azul **Generate Access Token**.
6. Copie o token gerado (começa com `EAA...`).

### No Agente (http://localhost:3000):

1. Clique no ícone de engrenagem **⚙️** no canto superior direito.
2. Cole o **Access Token** que você copiou.
3. Preencha o **Ad Account ID**:
   - Você encontra esse ID no Gerenciador de Anúncios do Facebook (na URL, procure por `act=123456...`).
   - Insira no formato: `act_SEU_NUMERO`.
4. Clique em **Salvar Configuração**.

---

## 💡 Como Usar

Agora você pode conversar com o agente! Tente estes comandos:

### Analisar Performance
> "Analise a performance das minhas campanhas ativas nos últimos 7 dias."
> "Qual campanha tem o melhor ROAS?"
> "Minhas campanhas estão caras? O CPC está bom?"

### Criar Campanhas
> "Crie uma campanha de Vendas chamada 'Promoção Relâmpago'."
> "Crie um conjunto de anúncios para público aberto com orçamento de R$ 50."

### Otimizar
> "Pause a campanha 'Vendas - Frio' pois está muito cara."
> "Aumente o orçamento da campanha vencedora para R$ 100."

---

## 🛠️ Solução de Problemas

### Erro: "Token do Facebook expirado (Erro 190)"
Tokens gerados no Graph Explorer duram apenas cerca de 1-2 horas.
- **Solução:** Volte ao Graph Explorer, clique em "Generate Access Token" novamente e atualize nas configurações do agente.

### Erro: "Permission Denied" ou "User not Admin"
- **Solução:** Verifique se você adicionou as permissões `ads_read` e `ads_management` ao gerar o token. Certifique-se também de que seu usuário é administrador da conta de anúncios.

### O Agente diz que fez algo, mas não aparece no Facebook
- **Solução:** Verifique se o agente não simulou a ação. Peça para ele confirmar se a ação foi executada via API. Verifique os "Logs" (botão no topo) para ver se a ferramenta retornou sucesso.

---

## 📁 Estrutura do Projeto

```
src/
├── agent/
│   ├── tools/            # Ferramentas (Conexão com Facebook)
│   │   ├── facebook-api.ts
│   │   └── index.ts
│   └── prompts/          # Instruções do sistema
├── app/
│   ├── api/chat/         # Backend (Next.js API Route)
│   └── page.tsx          # Frontend (Interface de Chat)
├── knowledge/            # Base de conhecimento do Agente
└── ...
```

## 📄 Licença

Este projeto é de código aberto sob a licença MIT.

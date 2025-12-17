'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react'

// Mock initial messages per agent
const INITIAL_MESSAGES = {
    TRADING: {
        role: 'assistant',
        content: `👋 Olá! Sou seu **AI Agent Ads**.

Estou conectado às suas contas e pronto para ajudar com estratégias de **2025**.

**O que posso fazer:**
- 📊 Analisar performance (ROAS, LTV)
- 🚀 Sugerir testes de criativos
- 💡 Otimizar Google Ads e Meta Ads
- 💰 Ajustar orçamentos automaticamente

Como posso ajudar hoje?`
    },
    TRENDS: {
        role: 'assistant',
        content: `👋 Olá! Sou seu **Especialista em Tendências**.

Conectado ao **Google Trends Global**, posso te ajudar a descobrir o que está em alta agora.

**O que posso fazer:**
- 📈 Analisar sazonalidade de produtos
- 🕵️‍♂️ Descobrir oportunidades "Rising" (Baixa concorrência)
- 🌍 Mapear interesse por região
- 🆚 Comparar popularidade de marcas/termos

O que você quer pesquisar hoje?`
    }
}

type AgentType = 'TRADING' | 'TRENDS'

export default function ChatPage() {
  const [activeAgent, setActiveAgent] = useState<AgentType>('TRADING')
  const [messages, setMessages] = useState<any[]>([INITIAL_MESSAGES.TRADING])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContext, setSelectedContext] = useState<string>('all')
  const [logs, setLogs] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Switch contexts involves clearing chat or just changing the "persona"
  // For this MVP, we will clear chat when switching agent to avoid context pollution,
  // but in production we might want to keep history.
  const handleAgentSwitch = (agent: AgentType) => {
      if (agent === activeAgent) return
      setActiveAgent(agent)
      setMessages([INITIAL_MESSAGES[agent]])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, logs])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
             // In a real app, this comes from a Global Context Provider
             platform: selectedContext,
             workspaceId: 'default',
             agentType: activeAgent // Pass agent type to backend if needed to filter tools
          },
          config: {}
        })
      })

      if (!response.ok) throw new Error('Falha na comunicação')

      const data = await response.json()

      if (data.logs) {
         console.log(data.logs)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])

    } catch (error) {
        console.error(error)
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro ao processar mensagem. Verifique se o servidor está rodando e as chaves configuradas.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
        {/* Chat Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 p-4 flex items-center justify-between backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                {/* Agent Switcher */}
                <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                    <button
                        onClick={() => handleAgentSwitch('TRADING')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeAgent === 'TRADING' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <LayoutGrid size={14} /> Tráfego
                    </button>
                    <button
                        onClick={() => handleAgentSwitch('TRENDS')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeAgent === 'TRENDS' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <TrendingUp size={14} /> Trends
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-800 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${activeAgent === 'TRADING' ? 'bg-green-600/20 text-green-500' : 'bg-blue-600/20 text-blue-500'}`}>
                        {activeAgent === 'TRADING' ? <Sparkles size={20} /> : <TrendingUp size={20} />}
                    </span>
                    <div>
                        <h2 className="font-bold text-white text-sm">
                            {activeAgent === 'TRADING' ? 'Assistente de Tráfego' : 'Especialista em Trends'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${activeAgent === 'TRADING' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            <span className="text-xs text-gray-400">Online • GPT-4o</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Selector (Only visible for Trading Agent) */}
            {activeAgent === 'TRADING' && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 hidden md:block">Analisar:</span>
                    <select
                        value={selectedContext}
                        onChange={(e) => setSelectedContext(e.target.value)}
                        className="bg-gray-800 text-xs text-white border border-gray-700 rounded-lg px-3 py-1.5 focus:border-green-500 outline-none"
                    >
                        <option value="all">🌐 Todas as Contas</option>
                        <option value="meta">🔵 Apenas Meta Ads</option>
                        <option value="google">⚪ Apenas Google Ads</option>
                    </select>
                </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === 'user'
                            ? 'bg-gray-700'
                            : activeAgent === 'TRADING' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`p-4 rounded-2xl shadow-md text-sm leading-relaxed ${
                            msg.role === 'user'
                            ? 'bg-gray-800 text-white rounded-tr-none'
                            : 'bg-[#111] border border-gray-800 text-gray-200 rounded-tl-none'
                        }`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown prose prose-invert prose-sm max-w-none">
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeAgent === 'TRADING' ? 'bg-green-600' : 'bg-blue-600'}`}>
                            <Bot size={16} />
                        </div>
                        <div className="bg-[#111] border border-gray-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <Loader2 size={16} className={`animate-spin ${activeAgent === 'TRADING' ? 'text-green-500' : 'text-blue-500'}`} />
                            <span className="text-xs text-gray-400">
                                {activeAgent === 'TRADING' ? 'Analisando métricas...' : 'Pesquisando tendências no Google...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
            <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={activeAgent === 'TRADING'
                        ? "Pergunte sobre campanhas (ex: 'Como está meu ROAS?')"
                        : "Pesquise tendências (ex: 'Compare iPhone vs Samsung no Brasil')"}
                    className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`text-white p-3 rounded-xl transition shadow-lg ${
                        activeAgent === 'TRADING'
                        ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                    } disabled:bg-gray-800 disabled:text-gray-500`}
                >
                    <Send size={20} />
                </button>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-2">
                {activeAgent === 'TRADING'
                    ? 'O agente pode cometer erros. Verifique informações críticas no Gerenciador de Anúncios.'
                    : 'Dados fornecidos via Google Trends (SerpAPI). Trazendo insights em tempo real.'
                }
            </p>
        </div>
    </div>
  )
}

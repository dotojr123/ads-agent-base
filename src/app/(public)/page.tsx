'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface LogEntry {
  timestamp: string
  type: 'info' | 'tool' | 'result' | 'error'
  message: string
}

const LOADING_MESSAGES = [
  { text: '🔍 Analisando sua solicitação...', delay: 0 },
  { text: '🔗 Conectando com Facebook Ads...', delay: 2000 },
  { text: '📊 Coletando dados das campanhas...', delay: 5000 },
  { text: '🧠 Processando métricas...', delay: 7000 },
  { text: '📝 Preparando relatório...', delay: 9000 },
  { text: '✨ Finalizando análise...', delay: 11000 },
]

export default function Home() {
  // --- Estados ---
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showLogs, setShowLogs] = useState(false)

  // Estados de Configuração
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    accessToken: '',
    adAccountId: '',
    pageId: '',
    pixelId: ''
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const loadingTimersRef = useRef<NodeJS.Timeout[]>([])

  // --- Persistência de Configuração ---
  useEffect(() => {
    const savedConfig = localStorage.getItem('facebook_config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('facebook_config', JSON.stringify(config))
    setShowConfig(false)
    addLog('info', '💾 Configurações salvas no navegador!')
  }

  const addLog = (type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, { timestamp, type, message }])
  }

  const startLoadingMessages = () => {
    // Limpar timers anteriores
    loadingTimersRef.current.forEach(timer => clearTimeout(timer))
    loadingTimersRef.current = []

    // Configurar novos timers
    LOADING_MESSAGES.forEach(({ text, delay }) => {
      const timer = setTimeout(() => {
        setLoadingMessage(text)
      }, delay)
      loadingTimersRef.current.push(timer)
    })
  }

  const stopLoadingMessages = () => {
    loadingTimersRef.current.forEach(timer => clearTimeout(timer))
    loadingTimersRef.current = []
    setLoadingMessage('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loadingMessage])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    startLoadingMessages()

    addLog('info', `📤 Enviando mensagem: "${userMessage.slice(0, 50)}..."`)

    try {
      addLog('info', '🔄 Chamando API do OpenAI...')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          config, // Envia configuração atual
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        addLog('error', `❌ Erro HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`)
        throw new Error(errorData.error || 'Erro na resposta do servidor')
      }

      const data = await response.json()

      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((log: { type: LogEntry['type']; message: string }) => {
          addLog(log.type, log.message)
        })
      }

      addLog('info', '✅ Resposta recebida com sucesso!')
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      console.error('Erro:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      addLog('error', `❌ ${errorMsg}`)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Erro ao processar sua mensagem: ${errorMsg}`
      }])
    } finally {
      stopLoadingMessages()
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col h-screen bg-[#0a0a0a] relative">

      {/* Modal de Configuração */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-green-400">⚙️ Configurações do Facebook</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Access Token</label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={e => setConfig({...config, accessToken: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-green-500 outline-none text-white"
                  placeholder="EAA..."
                />
                <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="text-xs text-blue-400 hover:underline mt-1 block">Gerar Token ↗</a>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Ad Account ID</label>
                <input
                  type="text"
                  value={config.adAccountId}
                  onChange={e => setConfig({...config, adAccountId: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-green-500 outline-none text-white"
                  placeholder="act_123..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Page ID</label>
                  <input
                    type="text"
                    value={config.pageId}
                    onChange={e => setConfig({...config, pageId: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-green-500 outline-none text-white"
                    placeholder="123..."
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Pixel ID</label>
                  <input
                    type="text"
                    value={config.pixelId}
                    onChange={e => setConfig({...config, pixelId: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-green-500 outline-none text-white"
                    placeholder="123..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Agent Ads</h1>
            <p className="text-xs text-gray-400">Agente de Tráfego • GPT-4o Mini</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
              onClick={() => setShowConfig(true)}
              className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-gray-800"
              title="Configurações"
            >
              ⚙️
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${showLogs ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {showLogs ? '🔍 Logs ON' : '🔍 Logs OFF'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden justify-center relative">
        {/* Messages */}
        <div className={`${showLogs ? 'w-2/3' : 'w-full max-w-4xl'} overflow-y-auto p-6 space-y-6 transition-all scroll-smooth`}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Olá! Sou seu Agente de Tráfego</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Posso analisar suas campanhas, criar novas, otimizar performance e muito mais.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {[
                '📊 Analise minhas campanhas ativas',
                '🚀 Crie uma campanha de vendas',
                '💰 Qual meu CPP atual?',
                '📈 Como escalar minha campanha?'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm text-gray-300 transition-colors border border-gray-700 hover:border-green-500/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="markdown prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 backdrop-blur rounded-2xl px-5 py-4 border border-gray-700 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                <span className="text-gray-300 text-sm animate-pulse">
                  {loadingMessage || '🔍 Analisando sua solicitação...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {/* Logs Panel */}
        <div
          className={`border-l border-gray-800 bg-gray-900 flex flex-col transition-all duration-300 absolute right-0 top-0 bottom-0 h-full z-20 ${
            showLogs ? 'w-[400px] translate-x-0' : 'w-[400px] translate-x-full'
          }`}
        >
            <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900">
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider font-mono">Terminal Logs</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Limpar
                </button>
                <button onClick={() => setShowLogs(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  Aguardando execução...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className="flex gap-2 group"
                  >
                    <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`break-all ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'tool' ? 'text-yellow-400' :
                      log.type === 'result' ? 'text-blue-400' :
                      'text-gray-300'
                    }`}>
                      {log.type === 'tool' && '🔧 '}
                      {log.type === 'result' && '📤 '}
                      {log.type === 'error' && '❌ '}
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm z-30">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem (ex: Analise minhas campanhas)..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-xl border border-gray-700 focus:border-green-500 transition-all placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '➤'
            )}
          </button>
        </div>
      </form>
    </main>
  )
}

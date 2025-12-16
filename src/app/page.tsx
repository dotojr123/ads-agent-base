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

// Mensagens de carregamento simplificadas
const LOADING_MESSAGES = [
  { text: '🔍 Pensando...', delay: 0 },
  { text: '📊 Consultando dados...', delay: 3000 },
  { text: '📝 Escrevendo resposta...', delay: 8000 },
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
      addLog('info', '🔄 Chamando API do Agente...')

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
        content: `❌ **Ocorreu um erro:**\n\n${errorMsg}\n\nVerifique os logs ou a configuração e tente novamente.`
      }])
    } finally {
      stopLoadingMessages()
      setIsLoading(false)
    }
  }

  // Preenchimento automático para testes (opcional)
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
    // Pode descomentar para enviar automaticamente
    // sendMessage({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <main className="flex flex-col h-screen bg-[#0a0a0a] relative text-gray-100 font-sans selection:bg-green-500/30">

      {/* Modal de Configuração */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
              ⚙️ Configurações
            </h2>
            <p className="text-sm text-gray-400 mb-4">
               Insira suas credenciais do Facebook Ads para permitir que o agente gerencie suas campanhas.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">Access Token <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={e => setConfig({...config, accessToken: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition-all"
                  placeholder="EAA..."
                />
                <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="text-xs text-blue-400 hover:text-blue-300 hover:underline mt-1 inline-flex items-center gap-1 transition-colors">
                  Gerar Token no Graph Explorer ↗
                </a>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">Ad Account ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={config.adAccountId}
                  onChange={e => setConfig({...config, adAccountId: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition-all"
                  placeholder="act_123456789"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveConfig}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-green-500/20"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/20">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Agent Ads</h1>
            <p className="text-xs text-gray-400 font-medium">Tráfego Pago Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
              onClick={() => setShowConfig(true)}
              className={`p-2 transition-all rounded-lg border ${
                !config.accessToken ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10 animate-pulse' : 'text-gray-400 border-transparent hover:text-green-400 hover:bg-gray-800'
              }`}
              title="Configurações"
            >
              ⚙️ {!config.accessToken && <span className="text-xs font-bold ml-1">Configurar</span>}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showLogs
                ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {showLogs ? '🔍 Logs ON' : '🔍 Logs OFF'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 transition-all scroll-smooth ${showLogs ? 'mr-[400px]' : ''}`}>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <span className="text-5xl">🚀</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Como posso ajudar hoje?</h2>
            <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
              Sou seu especialista em Meta Ads. Analiso métricas, crio campanhas e dou insights estratégicos para otimizar seus resultados.
            </p>

            {!config.accessToken && (
               <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg max-w-md text-left">
                  <p className="text-yellow-200 text-sm font-semibold mb-1">⚠️ Configuração Necessária</p>
                  <p className="text-yellow-400/80 text-xs">Para começar, clique no ícone de engrenagem ⚙️ e configure seu Token de Acesso do Facebook.</p>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              {[
                '📊 Analise minhas campanhas ativas',
                '🚀 Crie uma campanha de vendas',
                '💰 Qual meu CPP atual?',
                '📈 Como escalar minha campanha?'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-left text-sm text-gray-300 transition-all border border-gray-700/50 hover:border-green-500/50 rounded-xl group"
                >
                  <span className="group-hover:text-green-400 transition-colors">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-6 py-4 shadow-lg text-sm md:text-base leading-relaxed ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700 shadow-xl'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="markdown prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-green-400 prose-a:text-blue-400">
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
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-green-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="text-gray-300 text-sm animate-pulse font-medium">
                  {loadingMessage || 'Processando...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

        {/* Logs Panel */}
        <div
          className={`border-l border-gray-800 bg-gray-950 flex flex-col transition-all duration-300 absolute right-0 top-0 bottom-0 h-full z-20 shadow-2xl ${
            showLogs ? 'w-[400px] translate-x-0' : 'w-[400px] translate-x-full invisible'
          }`}
        >
            <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900">
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Terminal Logs
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
                >
                  Limpar
                </button>
                <button onClick={() => setShowLogs(false)} className="text-gray-500 hover:text-white px-2 py-1">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-2">
                  <span className="text-2xl opacity-20">🖥️</span>
                  <span className="italic">Aguardando execução...</span>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className="flex gap-2 group border-b border-gray-900/50 pb-2 last:border-0"
                  >
                    <span className="text-gray-600 shrink-0 select-none w-14 text-[10px] pt-0.5 opacity-60">
                      {log.timestamp.split(' ')[0]}
                    </span>
                    <span className={`break-all leading-relaxed ${
                      log.type === 'error' ? 'text-red-400 bg-red-900/10 p-1 rounded' :
                      log.type === 'tool' ? 'text-amber-300' :
                      log.type === 'result' ? 'text-cyan-400' :
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
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-md z-30">
        <div className="flex gap-3 max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.accessToken ? "Digite sua mensagem..." : "Configure seu token primeiro ⚙️"}
            className={`flex-1 bg-gray-800 text-white rounded-xl px-6 py-4 focus:outline-none focus:ring-2 shadow-xl border border-gray-700 transition-all placeholder-gray-500 ${
              !config.accessToken ? 'opacity-50 cursor-not-allowed focus:ring-gray-600' : 'focus:ring-green-500/50 focus:border-green-500'
            }`}
            disabled={isLoading || !config.accessToken}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !config.accessToken}
            className={`text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center min-w-[60px] ${
              isLoading || !input.trim() || !config.accessToken
                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                : 'bg-green-600 hover:bg-green-500 hover:shadow-green-500/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-lg">➤</span>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">
               AI Agent Ads pode cometer erros. Verifique informações importantes no Gerenciador de Anúncios.
            </p>
        </div>
      </form>
    </main>
  )
}

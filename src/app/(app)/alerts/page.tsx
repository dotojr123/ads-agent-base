'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Info, AlertTriangle, XCircle, Sparkles } from 'lucide-react'

interface Alert {
  id: string
  level: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message: string
  read: boolean
  createdAt: string
  rule?: { name: string }
  suggestion?: string // Client-side prop for AI suggestion
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
        const res = await fetch('/api/alerts')
        if (res.ok) setAlerts(await res.json())
    } finally {
        setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/alerts/${id}/read`, { method: 'POST' })
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const getAiSuggestion = async (alert: Alert) => {
    if (alert.suggestion) return // Already fetched
    setAnalyzingId(alert.id)
    try {
        const res = await fetch('/api/alerts/analyze', {
            method: 'POST',
            body: JSON.stringify({ alert })
        })
        const data = await res.json()
        setAlerts(alerts.map(a => a.id === alert.id ? { ...a, suggestion: data.suggestion } : a))
    } catch (e) {
        console.error(e)
    } finally {
        setAnalyzingId(null)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold mb-2">Central de Alertas</h1>
            <p className="text-gray-400">Monitoramento em tempo real das suas automações.</p>
        </div>
        <div className="bg-gray-800 rounded-lg px-3 py-1 text-xs text-gray-400">
            {alerts.filter(a => !a.read).length} não lidos
        </div>
      </header>

      <div className="space-y-4">
        {loading && <div className="text-center text-gray-500 py-8">Carregando alertas...</div>}
        {!loading && alerts.length === 0 && <div className="text-center text-gray-500 py-8">Nenhum alerta recente.</div>}

        {alerts.map(alert => (
            <div key={alert.id} className={`border rounded-xl p-5 transition relative group ${
                alert.read ? 'bg-gray-900/50 border-gray-800 opacity-70' : 'bg-gray-900 border-gray-700 shadow-lg'
            }`}>
                <div className="flex gap-4">
                    <div className={`mt-1 shrink-0 ${
                        alert.level === 'CRITICAL' ? 'text-red-500' :
                        alert.level === 'WARNING' ? 'text-yellow-500' :
                        'text-blue-500'
                    }`}>
                        {alert.level === 'CRITICAL' ? <XCircle size={24}/> :
                         alert.level === 'WARNING' ? <AlertTriangle size={24}/> :
                         <Info size={24}/>}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold ${alert.read ? 'text-gray-400' : 'text-white'}`}>{alert.title}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {new Date(alert.createdAt).toLocaleString()}
                            </span>
                        </div>

                        <p className="text-sm text-gray-400 mb-3">{alert.message}</p>

                        {/* Source Badge */}
                        {alert.rule && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 uppercase tracking-wide mb-3">
                                <Bell size={10} /> Regra: {alert.rule.name}
                            </span>
                        )}

                        {/* AI Suggestion Area */}
                        <div className="mt-2">
                            {alert.suggestion ? (
                                <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                    <Sparkles size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-green-500 mb-0.5">Sugestão IA</p>
                                        <p className="text-sm text-green-100">{alert.suggestion}</p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => getAiSuggestion(alert)}
                                    disabled={analyzingId === alert.id}
                                    className="text-xs font-medium text-green-500 hover:text-green-400 flex items-center gap-1 transition"
                                >
                                    {analyzingId === alert.id ? 'Analisando...' : <><Sparkles size={12}/> Obter sugestão de IA</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {!alert.read && (
                    <button
                        onClick={() => markAsRead(alert.id)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-green-500 transition opacity-0 group-hover:opacity-100"
                        title="Marcar como lido"
                    >
                        <Check size={18} />
                    </button>
                )}
            </div>
        ))}
      </div>
    </div>
  )
}

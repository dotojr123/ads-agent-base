'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Pause, Trash2, Zap } from 'lucide-react'

// --- Types ---
interface Rule {
  id: string
  name: string
  platform: 'META' | 'GOOGLE'
  active: boolean
  condition: any
  action: string
  lastRunAt: string | null
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    platform: 'META',
    metric: 'CPC',
    operator: 'GT',
    value: '',
    action: 'NOTIFY'
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
        const res = await fetch('/api/automations')
        if (res.ok) setRules(await res.json())
    } finally {
        setLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    const res = await fetch(`/api/automations/${id}/toggle`, { method: 'POST' })
    if (res.ok) fetchRules()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
        name: formData.name,
        platform: formData.platform,
        condition: {
            metric: formData.metric,
            operator: formData.operator,
            value: parseFloat(formData.value)
        },
        action: formData.action
    }

    const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (res.ok) {
        setShowModal(false)
        fetchRules()
        setFormData({ name: '', platform: 'META', metric: 'CPC', operator: 'GT', value: '', action: 'NOTIFY' })
    }
  }

  const runNow = async () => {
    if(confirm('Executar todas as regras agora? Isso criará alertas simulados.')) {
        const res = await fetch('/api/webhooks/execute-automations', { method: 'POST' })
        const data = await res.json()
        alert(`Executado! ${data.count} automações processadas.`)
        fetchRules()
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold mb-2">Automações</h1>
            <p className="text-gray-400">Crie regras para monitorar e otimizar suas campanhas 24/7.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={runNow} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2">
                <Play size={16} /> Testar Agora
            </button>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                <Plus size={16} /> Nova Regra
            </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading && <div className="p-8 text-center text-gray-500">Carregando...</div>}

        {!loading && rules.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500"><Zap size={32}/></div>
                <h3 className="text-lg font-medium text-white mb-2">Sem regras ativas</h3>
                <p className="text-gray-400 max-w-md mb-6">Crie sua primeira automação para pausar anúncios ruins ou escalar os melhores.</p>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">Criar Regra</button>
            </div>
        )}

        {!loading && rules.length > 0 && (
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-800 bg-gray-800/50 text-xs uppercase text-gray-400">
                        <th className="p-4 font-medium">Nome</th>
                        <th className="p-4 font-medium">Plataforma</th>
                        <th className="p-4 font-medium">Condição</th>
                        <th className="p-4 font-medium">Ação</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Opções</th>
                    </tr>
                </thead>
                <tbody>
                    {rules.map(rule => (
                        <tr key={rule.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                            <td className="p-4 font-medium text-white">{rule.name}</td>
                            <td className="p-4">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                    rule.platform === 'META' ? 'bg-blue-900/30 text-blue-400' : 'bg-yellow-900/30 text-yellow-400'
                                }`}>{rule.platform}</span>
                            </td>
                            <td className="p-4 text-sm text-gray-300 font-mono">
                                {rule.condition.metric} {rule.condition.operator === 'GT' ? '>' : '<'} {rule.condition.value}
                            </td>
                            <td className="p-4 text-sm text-gray-300">{rule.action}</td>
                            <td className="p-4">
                                <button onClick={() => handleToggle(rule.id)} className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded transition ${
                                    rule.active ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                }`}>
                                    {rule.active ? <Pause size={12}/> : <Play size={12}/>}
                                    {rule.active ? 'ATIVO' : 'PAUSADO'}
                                </button>
                            </td>
                            <td className="p-4 text-right">
                                <button className="text-gray-600 hover:text-red-400 transition"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Nova Automação</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Nome da Regra</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" placeholder="Ex: Pausar se CPC alto" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Plataforma</label>
                            <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as any})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none">
                                <option value="META">Meta Ads</option>
                                <option value="GOOGLE">Google Ads</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Métrica</label>
                            <select value={formData.metric} onChange={e => setFormData({...formData, metric: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none">
                                <option value="CPC">CPC (Custo por Clique)</option>
                                <option value="ROAS">ROAS</option>
                                <option value="CTR">CTR</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Condição</label>
                            <select value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none">
                                <option value="GT">Maior que (&gt;)</option>
                                <option value="LT">Menor que (&lt;)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Valor</label>
                            <input required type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Ação</label>
                        <select value={formData.action} onChange={e => setFormData({...formData, action: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none">
                            <option value="NOTIFY">Apenas Notificar</option>
                            <option value="PAUSE_CAMPAIGN">Pausar Campanha</option>
                            <option value="PAUSE_AD">Pausar Anúncio</option>
                            <option value="INCREASE_BUDGET">Aumentar Orçamento (+20%)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg">Salvar Regra</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}

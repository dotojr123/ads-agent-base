'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewAutomationPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    triggerType: 'META_THRESHOLD',
    triggerValue: '',
    actionType: 'ALERT',
    actionValue: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/automations', {
        method: 'POST',
        body: JSON.stringify(form)
    })
    router.push('/automations')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Nova Regra</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input required className="w-full bg-gray-800 p-2 rounded border border-gray-700"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Gatilho</label>
                <select className="w-full bg-gray-800 p-2 rounded border border-gray-700"
                    value={form.triggerType} onChange={e => setForm({...form, triggerType: e.target.value})}>
                    <option value="META_THRESHOLD">Meta: ROAS Baixo</option>
                    <option value="GOOGLE_THRESHOLD">Google: CPA Alto</option>
                    <option value="BUDGET_LIMIT">Orçamento Excedido</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Valor Limite</label>
                <input type="number" step="0.1" required className="w-full bg-gray-800 p-2 rounded border border-gray-700"
                    value={form.triggerValue} onChange={e => setForm({...form, triggerValue: e.target.value})} />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Ação</label>
                <select className="w-full bg-gray-800 p-2 rounded border border-gray-700"
                    value={form.actionType} onChange={e => setForm({...form, actionType: e.target.value})}>
                    <option value="ALERT">Enviar Alerta</option>
                    <option value="PAUSE">Pausar Campanha</option>
                    <option value="SCALE">Escalar Orçamento</option>
                </select>
            </div>
        </div>

        <button type="submit" className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500 w-full">Salvar Regra</button>
      </form>
    </div>
  )
}

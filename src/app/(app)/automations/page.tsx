'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Play, Trash2 } from 'lucide-react'

export default function AutomationsPage() {
  const [rules, setRules] = useState<any[]>([])

  const fetchRules = async () => {
    const res = await fetch('/api/automations')
    setRules(await res.json())
  }

  useEffect(() => { fetchRules() }, [])

  const handleTest = async () => {
    if(confirm('Executar check agora?')) {
        await fetch('/api/cron/automation-check')
        alert('Check executado! Verifique os alertas.')
    }
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Regras de Automação</h1>
        <div className="flex gap-2">
            <button onClick={handleTest} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2">
                <Play size={16}/> Testar Engine
            </button>
            <Link href="/automations/new" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded flex items-center gap-2">
                <Plus size={16}/> Nova Regra
            </Link>
        </div>
      </header>

      <div className="grid gap-4">
        {rules.map(rule => (
            <div key={rule.id} className="bg-gray-900 border border-gray-800 p-4 rounded flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">{rule.name}</h3>
                    <p className="text-sm text-gray-400">
                        {rule.triggerType} {'>'} {rule.triggerValue} ➔ {rule.actionType}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${rule.isActive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                        {rule.isActive ? 'ATIVO' : 'PAUSADO'}
                    </span>
                </div>
            </div>
        ))}
        {rules.length === 0 && <div className="text-gray-500 text-center py-10">Nenhuma regra criada.</div>}
      </div>
    </div>
  )
}

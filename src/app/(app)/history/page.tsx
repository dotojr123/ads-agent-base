'use client'

import { Clock, MessageSquare, ChevronRight } from 'lucide-react'

const MOCK_HISTORY = [
    { id: '1', title: 'Análise de Campanha de Verão', date: 'Hoje, 14:30', preview: 'A campanha está com ROAS de 3.5...', platform: 'meta' },
]

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8">Histórico de Conversas</h1>
        <div className="space-y-4">
            {MOCK_HISTORY.map(session => (
                <div key={session.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                        <MessageSquare size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-200 truncate">{session.title}</h3>
                        <span className="text-xs text-gray-500">{session.date}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

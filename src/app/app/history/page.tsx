'use client'

import { Clock, MessageSquare, ChevronRight } from 'lucide-react'

const MOCK_HISTORY = [
    { id: '1', title: 'Análise de Campanha de Verão', date: 'Hoje, 14:30', preview: 'A campanha está com ROAS de 3.5...', platform: 'meta' },
    { id: '2', title: 'Otimização Google Search', date: 'Ontem, 09:15', preview: 'Sugiro negativar as palavras-chave...', platform: 'google' },
    { id: '3', title: 'Criação de Criativos Black Friday', date: '10 Dez, 18:00', preview: 'Aqui estão 5 ideias de vídeos UGC...', platform: 'mixed' },
]

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8">Histórico de Conversas</h1>

        <div className="space-y-4">
            {MOCK_HISTORY.map(session => (
                <div key={session.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl hover:bg-gray-800 transition cursor-pointer flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        session.platform === 'meta' ? 'bg-blue-900/20 text-blue-500' :
                        session.platform === 'google' ? 'bg-white/10 text-white' :
                        'bg-purple-900/20 text-purple-500'
                    }`}>
                        <MessageSquare size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-200 truncate pr-4">{session.title}</h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                <Clock size={12} /> {session.date}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{session.preview}</p>
                    </div>

                    <ChevronRight className="text-gray-600 group-hover:text-white transition" size={20} />
                </div>
            ))}
        </div>
    </div>
  )
}

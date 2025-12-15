'use client'

import { CreditCard, Users, Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-8">Configurações</h1>

      <div className="space-y-8">
        {/* Workspace Info */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <SettingsIcon className="text-gray-400" size={20} />
                <h2 className="font-bold">Geral</h2>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Nome do Workspace</label>
                    <input type="text" defaultValue="Meu Workspace" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                </div>
            </div>
        </section>
      </div>
    </div>
  )
}

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
                <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg">Salvar</button>
                </div>
            </div>
        </section>

        {/* Subscription */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <CreditCard className="text-gray-400" size={20} />
                <h2 className="font-bold">Assinatura</h2>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-gray-400">Plano Atual</p>
                        <p className="text-2xl font-bold text-white">Starter <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded ml-2">ATIVO</span></p>
                    </div>
                    <button className="text-green-500 hover:underline text-sm font-medium">Gerenciar no Stripe ↗</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="border border-green-500/50 bg-green-900/10 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Starter</h3>
                        <p className="text-xs text-gray-400 mb-4">Atual</p>
                        <button disabled className="w-full py-1 text-xs bg-green-600 text-white rounded cursor-default">Selecionado</button>
                     </div>
                     <div className="border border-gray-700 bg-gray-800/50 p-4 rounded-lg opacity-60 hover:opacity-100 transition">
                        <h3 className="font-bold mb-2">Pro</h3>
                        <p className="text-xs text-gray-400 mb-4">R$ 297/mês</p>
                        <button className="w-full py-1 text-xs bg-gray-700 hover:bg-white hover:text-black text-white rounded">Upgrade</button>
                     </div>
                     <div className="border border-gray-700 bg-gray-800/50 p-4 rounded-lg opacity-60 hover:opacity-100 transition">
                        <h3 className="font-bold mb-2">Agency</h3>
                        <p className="text-xs text-gray-400 mb-4">R$ 997/mês</p>
                        <button className="w-full py-1 text-xs bg-gray-700 hover:bg-white hover:text-black text-white rounded">Upgrade</button>
                     </div>
                </div>
            </div>
        </section>

        {/* Members */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <Users className="text-gray-400" size={20} />
                <h2 className="font-bold">Membros</h2>
            </div>
            <div className="p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800">
                            <th className="pb-2">Usuário</th>
                            <th className="pb-2">Função</th>
                            <th className="pb-2 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-800 last:border-0">
                            <td className="py-3">voce@email.com</td>
                            <td className="py-3"><span className="bg-gray-800 px-2 py-1 rounded text-xs">Proprietário</span></td>
                            <td className="py-3 text-right text-gray-500">-</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-4">
                    <button className="text-sm text-green-500 hover:text-green-400 font-medium">+ Convidar membro</button>
                </div>
            </div>
        </section>
      </div>
    </div>
  )
}

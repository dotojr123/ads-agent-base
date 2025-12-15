'use client'

import { signIn } from 'next-auth/react'

export default function PricingPage() {
  const handleSubscribe = async (priceId: string) => {
    signIn(undefined, { callbackUrl: `/app/settings` })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="p-6 text-center">
        <h1 className="text-3xl font-bold">Planos e Preços</h1>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Starter */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-300">Starter</h2>
            <div className="text-4xl font-bold my-4">R$ 97<span className="text-sm font-normal text-gray-500">/mês</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-gray-400">
              <li>✅ 1 Conta de Anúncios</li>
              <li>✅ 100 Análises/mês</li>
            </ul>
            <button onClick={() => handleSubscribe('starter')} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition">
              Começar Starter
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gray-800 border border-green-500 rounded-2xl p-8 flex flex-col relative transform scale-105 shadow-2xl shadow-green-900/20">
            <div className="absolute top-0 right-0 bg-green-600 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">MAIS POPULAR</div>
            <h2 className="text-xl font-bold text-white">Pro</h2>
            <div className="text-4xl font-bold my-4">R$ 297<span className="text-sm font-normal text-gray-400">/mês</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-gray-300">
              <li>✅ 5 Contas de Anúncios</li>
              <li>✅ Análises Ilimitadas</li>
              <li>✅ Meta Ads + Google Ads</li>
            </ul>
            <button onClick={() => handleSubscribe('pro')} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition">
              Assinar Pro
            </button>
          </div>

          {/* Agency */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-300">Agency</h2>
            <div className="text-4xl font-bold my-4">R$ 997<span className="text-sm font-normal text-gray-500">/mês</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-gray-400">
              <li>✅ Contas Ilimitadas</li>
              <li>✅ White-label</li>
            </ul>
            <button onClick={() => handleSubscribe('agency')} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition">
              Falar com Vendas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

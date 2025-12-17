'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { CheckCircle, Plus, Trash2, AlertCircle } from 'lucide-react'

// Mock Data fallbacks
const MOCK_ACCOUNTS: any[] = []

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>(MOCK_ACCOUNTS)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
        const res = await fetch('/api/accounts')
        if (res.ok) {
            const data = await res.json()
            setAccounts(data)
        }
    } catch (e) {
        console.error("Failed to fetch accounts", e)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Import at top: import { signIn } from 'next-auth/react'

  const handleConnect = async (platform: 'META' | 'GOOGLE') => {
    setIsConnecting(true)

    try {
        if (platform === 'GOOGLE') {
            // Redirect to Google OAuth
            // Note: In NextAuth 'google' usually provides profile, but for Ads we might need extra scopes.
            // For now, we use the standard sign-in which might just link the account or refresh token.
            // If we needed specific Ads scopes, we'd handle that in authOptions provider config.
            await signIn('google', { callbackUrl: '/app/accounts' })
        } else if (platform === 'META') {
            // For Meta, we typically use 'facebook' provider
            await signIn('facebook', { callbackUrl: '/app/accounts' })
        }
    } catch (e) {
        console.error("Connection failed", e)
        alert('Erro ao iniciar conexão. Verifique logs.')
    } finally {
        setIsConnecting(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    if (confirm('Tem certeza? O agente perderá acesso a esta conta.')) {
        await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' })
        setAccounts(accounts.filter(a => a.id !== id))
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Contas de Anúncios</h1>
        <p className="text-gray-400">Conecte suas contas do Meta Ads e Google Ads para permitir que a IA analise e otimize.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Connect Meta */}
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-2xl mb-4">f</div>
            <h3 className="font-bold text-lg mb-1">Meta Ads</h3>
            <p className="text-sm text-gray-400 mb-6">Facebook e Instagram Ads</p>
            <button
                onClick={() => handleConnect('META')}
                disabled={isConnecting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition w-full flex items-center justify-center gap-2"
            >
                {isConnecting ? 'Conectando...' : <><Plus size={18} /> Conectar Nova Conta</>}
            </button>
        </div>

        {/* Connect Google */}
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl mb-4">G</div>
            <h3 className="font-bold text-lg mb-1">Google Ads</h3>
            <p className="text-sm text-gray-400 mb-6">Search, YouTube, Display, PMax</p>
            <button
                onClick={() => handleConnect('GOOGLE')}
                disabled={isConnecting}
                className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition w-full flex items-center justify-center gap-2"
            >
                {isConnecting ? 'Conectando...' : <><Plus size={18} /> Conectar Nova Conta</>}
            </button>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Contas Conectadas</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading && <div className="p-8 text-center text-gray-500">Carregando...</div>}
        {!isLoading && accounts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma conta conectada.</div>
        ) : (
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-800 bg-gray-800/50 text-xs uppercase text-gray-400">
                        <th className="p-4 font-medium">Plataforma</th>
                        <th className="p-4 font-medium">Nome da Conta</th>
                        <th className="p-4 font-medium">ID Externo</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map(account => (
                        <tr key={account.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-bold ${
                                    account.platform === 'META' ? 'bg-blue-900/30 text-blue-400' : 'bg-yellow-900/30 text-yellow-400'
                                }`}>
                                    {account.platform === 'META' ? 'META' : 'GOOGLE'}
                                </span>
                            </td>
                            <td className="p-4 font-medium">{account.name}</td>
                            <td className="p-4 text-gray-400 font-mono text-xs">{account.externalId}</td>
                            <td className="p-4">
                                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                                    <CheckCircle size={14} /> Ativo
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => handleDisconnect(account.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition"
                                    title="Desconectar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  )
}

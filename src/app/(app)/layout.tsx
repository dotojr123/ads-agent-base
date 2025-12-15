import Link from 'next/link'
import { LayoutDashboard, Zap, Bell, Settings } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4">
        <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">AI</div>
            <span className="font-bold text-lg">Agent Ads</span>
        </div>

        <nav className="space-y-1">
            <Link href="/automations" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
                <Zap size={20} /> Automações
            </Link>
            <Link href="/alerts" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
                <Bell size={20} /> Alertas
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
                <Settings size={20} /> Configurações
            </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

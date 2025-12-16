import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
          AI Agent Ads
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/pricing" className="text-gray-300 hover:text-white transition">Preços</Link>
          <Link href="/login" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">Entrar</Link>
          <Link href="/login" className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition font-medium">Começar Grátis</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Gestão de Tráfego com <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            Inteligência Artificial
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Otimize campanhas Meta Ads e Google Ads automaticamente.
          Estratégias de 2025 aplicadas 24/7 nas suas contas.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="px-8 py-4 bg-green-600 rounded-xl text-lg font-bold hover:bg-green-500 transition shadow-lg shadow-green-900/20">
            Testar Agora
          </Link>
          <Link href="#features" className="px-8 py-4 bg-gray-800 rounded-xl text-lg font-bold hover:bg-gray-700 transition border border-gray-700">
            Ver Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">Estratégia 2025</h3>
            <p className="text-gray-400">Focado em criativos, CRO e métricas de negócio (LTV, ROAS) em vez de cliques.</p>
          </div>
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Multi-Plataforma</h3>
            <p className="text-gray-400">Meta Ads e Google Ads integrados em um único chat inteligente.</p>
          </div>
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Automação Real</h3>
            <p className="text-gray-400">O agente não só analisa, mas executa alterações de orçamento e pausa anúncios ruins.</p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-600 border-t border-gray-900">
        © 2025 AI Agent Ads. Todos os direitos reservados.
      </footer>
    </div>
  )
}

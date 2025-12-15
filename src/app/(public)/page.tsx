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
        </div>
      </main>
    </div>
  )
}

'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-400">Entre para gerenciar seus anúncios</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/app' })}
            className="w-full py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium flex items-center justify-center gap-3 transition"
          >
            <span className="text-xl">G</span> Continuar com Google
          </button>

          <button
            onClick={() => signIn('facebook', { callbackUrl: '/app' })}
            className="w-full py-3 bg-[#1877F2] text-white hover:bg-[#166fe5] rounded-xl font-medium flex items-center justify-center gap-3 transition"
          >
            <span className="text-xl">f</span> Continuar com Facebook
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">Ou entre com email</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            const password = (e.target as any).password.value;
            signIn('credentials', {
                email,
                password,
                callbackUrl: '/app'
            });
        }}>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input name="email" type="email" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Senha</label>
            <input name="password" type="password" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition">
            Entrar
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Não tem uma conta? <Link href="/pricing" className="text-green-500 hover:underline">Assine agora</Link>
        </p>
      </div>
    </div>
  )
}

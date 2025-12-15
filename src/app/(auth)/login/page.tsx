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
            onClick={() => signIn('google', { callbackUrl: '/app/chat' })}
            className="w-full py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium flex items-center justify-center gap-3 transition"
          >
            <span className="text-xl">G</span> Continuar com Google
          </button>

          <button
            onClick={() => signIn('facebook', { callbackUrl: '/app/chat' })}
            className="w-full py-3 bg-[#1877F2] text-white hover:bg-[#166fe5] rounded-xl font-medium flex items-center justify-center gap-3 transition"
          >
            <span className="text-xl">f</span> Continuar com Facebook
          </button>
        </div>
      </div>
    </div>
  )
}

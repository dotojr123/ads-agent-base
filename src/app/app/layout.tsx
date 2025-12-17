import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { prisma } from "@/lib/db"
import { getUserWorkspaces } from "@/lib/dal"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login')
  }

  const userId = (session.user as any).id

  // Fetch user workspaces
  let workspaces = await getUserWorkspaces(userId)

  // If no workspace, create a default one (Onboarding)
  if (workspaces.length === 0 && session.user.name) {
      try {
        // Only try to create if DB is likely up (checking env var is not enough but good signal)
        if (process.env.DATABASE_URL) {
            // Auto-create default workspace for new user
            const slug = session.user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)
            await prisma.workspace.create({
                data: {
                name: `${session.user.name}'s Workspace`,
                slug: slug || 'default-workspace',
                users: { create: { userId: userId, role: 'OWNER' as any } },
                subscription: { create: { status: 'ACTIVE', plan: 'STARTER' } }
                }
            })
            workspaces = await getUserWorkspaces(userId)
        }
      } catch (e) {
          console.warn("Could not auto-create workspace (DB potentially down), proceeding with empty/mock state.", e)
          // Mock workspace for UI if creation failed
           workspaces = [{
              userId,
              workspaceId: 'mock-workspace-id',
              role: 'OWNER' as any,
              workspace: {
                id: 'mock-workspace-id',
                name: 'Workspace Demo',
                slug: 'workspace-demo',
              } as any
            }] as any
      }
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold">
                AI
            </div>
            <span className="font-bold">Agent Ads</span>
        </div>

        <div className="p-4">
            <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Workspace</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white outline-none">
                {workspaces.map(uw => (
                    <option key={uw.workspaceId} value={uw.workspaceId}>{uw.workspace.name}</option>
                ))}
            </select>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/app" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <span>📊</span> Visão Geral
          </Link>
          <Link href="/app/chat" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <span>👥</span> Equipe
          </Link>
          <Link href="/app/accounts" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <span>🔗</span> Contas
          </Link>
          <Link href="/app/history" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <span>📜</span> Histórico
          </Link>
          <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
             <span>⚙️</span> Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
                {session.user.image && <img src={session.user.image} className="w-8 h-8 rounded-full" />}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}

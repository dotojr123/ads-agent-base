'use client'

import { useEffect, useState } from 'react'
import { getDashboardData, DashboardData } from './actions'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, MousePointer, Target, Zap, LayoutDashboard } from 'lucide-react'

// Dummy data for initial render (to avoid hydration mismatch if possible or just skeleton)
const SKELETON_DATA = {
    workspaceName: 'Loading...',
    totalSpend: 0,
    totalROAS: 0,
    history: [],
    topCampaigns: []
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await getDashboardData()
        if ('error' in res) {
          setError(res.error)
        } else {
          setData(res)
        }
      } catch (e) {
        setError('Erro desconhecido ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-mono text-sm">Carregando métricas do ecossistema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-[#0a0a0a] h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Erro Crítico</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-white">
            Tentar Novamente
        </button>
      </div>
    )
  }

  const d = data as DashboardData

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
           <div className="flex items-center gap-2 text-green-500 mb-1">
                <LayoutDashboard size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Dashboard Executivo</span>
           </div>
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
             {d.workspaceName}
           </h1>
        </div>

        <div className="flex gap-3">
             <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white transition">
                Últimos 30 dias
             </button>
             <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-green-900/20 transition flex items-center gap-2">
                <Zap size={16} /> Otimizar Agora
             </button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
            title="Total Investido"
            value={`R$ ${d.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend="+12.5%"
            isPositive={true}
            icon={<DollarSign size={24} className="text-emerald-400" />}
            color="emerald"
        />
         <StatCard
            title="ROAS Geral"
            value={`${d.totalROAS.toFixed(2)}x`}
            trend="+8.2%"
            isPositive={true}
            icon={<Activity size={24} className="text-blue-400" />}
            color="blue"
        />
         <StatCard
            title="CTR Global"
            value="1.85%"
            trend="-0.5%"
            isPositive={false}
            icon={<MousePointer size={24} className="text-purple-400" />}
            color="purple"
        />
         <StatCard
            title="Conversões"
            value="225"
            trend="+15%"
            isPositive={true}
            icon={<Target size={24} className="text-rose-400" />}
            color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart (Spend vs Sales) */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group"
        >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Activity size={100} />
             </div>
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                Performance Financeira
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded ml-2">Receita vs Custo</span>
             </h3>

             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.history}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="#333"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#333"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                        itemStyle={{ color: '#ccc' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <Area type="monotone" dataKey="sales" name="Vendas/Receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="spend" name="Investimento" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </motion.div>

        {/* Breakdown Chart */}
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col"
        >
             <h3 className="text-lg font-semibold mb-6">Investimento por Canal</h3>
             <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Meta Ads', value: d.meta?.metrics?.spend || 0 },
                                { name: 'Google Ads', value: d.google?.metrics?.spend || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell key="cell-0" fill="#3b82f6" /> {/* Meta Blueish */}
                            <Cell key="cell-1" fill="#ea4335" /> {/* Google Reddish */}
                        </Pie>
                         <Tooltip
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ color: '#ccc' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-300">Meta Ads</span>
                    </div>
                    <span className="font-mono text-sm">R$ {d.meta?.metrics?.spend.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-300">Google Ads</span>
                    </div>
                    <span className="font-mono text-sm">R$ {d.google?.metrics?.spend.toFixed(2)}</span>
                </div>
             </div>
        </motion.div>
      </div>

       {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Top Campanhas (Live)</h3>
            <button className="text-sm text-green-500 hover:text-green-400 font-medium">Ver Todas</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#151515] text-gray-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">Campanha</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Plataforma</th>
                        <th className="px-6 py-4 text-right">Gasto</th>
                        <th className="px-6 py-4 text-right">ROAS</th>
                        <th className="px-6 py-4 text-center">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {d.topCampaigns.map((camp: any) => (
                        <tr key={camp.id} className="hover:bg-gray-900/50 transition">
                            <td className="px-6 py-4 font-medium text-white">{camp.name}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                    camp.status === 'ACTIVE'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}>
                                    {camp.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {camp.platform === 'META' ? (
                                    <span className="text-blue-400 font-bold">Meta</span>
                                ) : (
                                    <span className="text-red-400 font-bold">Google</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-white">R$ {camp.spend.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`font-bold ${camp.roas > 4 ? 'text-green-400' : camp.roas > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {camp.roas.toFixed(2)}x
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-gray-500 hover:text-white transition">...</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </motion.div>

    </div>
  )
}

function StatCard({ title, value, trend, isPositive, icon, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#111] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group"
        >
             <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${color}-500 blur-3xl opacity-10 group-hover:opacity-20 transition`}></div>

             <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-gray-900 rounded-xl">
                    {icon}
                 </div>
                 {trend && (
                     <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                         {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                         {trend}
                     </div>
                 )}
             </div>

             <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
             </div>
        </motion.div>
    )
}

'use client'

import { ArrowUpRight, ArrowDownRight, Activity, Wrench, AlertTriangle, CheckCircle2, Clock, FileText, Settings, AlertCircle, Filter, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

interface DashboardFilters {
    mes?: number
    ano?: number
    placa?: string
    status?: string
    os?: string
    tipo?: string
}

export default function DashboardClient({ metrics, chartData, filters }: {
    metrics: {
        totalOS: number;
        osAbertas: number;
        osFechadas: number;
        disponibilidadeGlobal: string;
        mttr: string;
        mtbf: string;
        docs: {
            valid: number;
            attention: number;
            expired: number;
        }
    },
    chartData: { placa: string; valor: number }[],
    filters: DashboardFilters
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [localFilters, setLocalFilters] = useState(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const applyFilters = useCallback(() => {
        console.log('[Client] Aplicando filtros locais:', localFilters)
        const params = new URLSearchParams()

        if (localFilters.mes !== undefined) params.set('mes', localFilters.mes.toString())
        if (localFilters.ano !== undefined) params.set('ano', localFilters.ano.toString())
        if (localFilters.placa) params.set('placa', localFilters.placa)
        if (localFilters.status) params.set('status', localFilters.status)
        if (localFilters.os) params.set('os', localFilters.os)
        if (localFilters.tipo) params.set('tipo', localFilters.tipo)

        const finalUrl = `/dashboard?${params.toString()}`
        console.log('[Client] Redirecionando para:', finalUrl)
        window.location.href = finalUrl
    }, [localFilters])

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const anos = [2024, 2025, 2026]

    return (
        <div className="space-y-8">
            {/* Filters Bar */}
            <div className="bg-surface border border-border-color p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Mês</label>
                    <select
                        value={localFilters.mes ?? ''}
                        onChange={e => setLocalFilters(prev => ({ ...prev, mes: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Mês Atual</option>
                        {meses.map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[100px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Ano</label>
                    <select
                        value={localFilters.ano ?? ''}
                        onChange={e => setLocalFilters(prev => ({ ...prev, ano: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        {anos.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Placa</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            placeholder="Buscar placa..."
                            value={localFilters.placa || ''}
                            onChange={e => setLocalFilters(prev => ({ ...prev, placa: e.target.value }))}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Categoria</label>
                    <select
                        value={localFilters.tipo || ''}
                        onChange={e => setLocalFilters(prev => ({ ...prev, tipo: e.target.value }))}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Todas</option>
                        <option value="LEVE">LEVE</option>
                        <option value="PESADO">PESADO</option>
                        <option value="MAQUINA">MAQUINA</option>
                    </select>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Status OS</label>
                    <select
                        value={localFilters.status || ''}
                        onChange={e => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Todos</option>
                        <option value="ABERTA">Aberta</option>
                        <option value="EM_EXECUCAO">Em Execução</option>
                        <option value="CONCLUIDA">Concluída</option>
                    </select>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[100px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Nº OS</label>
                    <input
                        placeholder="Ex: 001"
                        value={localFilters.os || ''}
                        onChange={e => setLocalFilters(prev => ({ ...prev, os: e.target.value }))}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <button
                    onClick={applyFilters}
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    Filtrar
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <ModernKpiCard
                    title="Total de OS"
                    value={metrics.totalOS}
                    sub="Clique para ver lista"
                    icon={FileText}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                />
                <ModernKpiCard
                    title="Em Andamento"
                    value={metrics.osAbertas}
                    sub="Clique para ver lista"
                    icon={Clock}
                    iconColor="text-yellow-600"
                    iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                />
                <ModernKpiCard
                    title="OS Fechadas"
                    value={metrics.osFechadas}
                    sub="Clique para ver lista"
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBg="bg-green-100 dark:bg-green-900/30"
                />
                <ModernKpiCard
                    title="Disponibilidade"
                    value={`${metrics.disponibilidadeGlobal}%`}
                    sub="Meta: ≥ 95%"
                    icon={Activity}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    isSuccess={Number(metrics.disponibilidadeGlobal) >= 95}
                />
                <ModernKpiCard
                    title="MTTR"
                    value={`${metrics.mttr}h`}
                    sub="Tempo Médio Reparo"
                    icon={Wrench}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                />
                <ModernKpiCard
                    title="MTBF"
                    value={`${metrics.mtbf}h`}
                    sub="Tempo Entre Falhas"
                    icon={Clock}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                />
                <div className="bg-surface border border-border-color p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Docs</p>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-xl font-bold text-green-600">{metrics.docs?.valid || 0}</span>
                                <span className="text-xl font-bold text-yellow-500">{metrics.docs?.attention || 0}</span>
                                <span className="text-xl font-bold text-red-500">{metrics.docs?.expired || 0}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">V / AV / Venc</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600`}>
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h3 className="text-foreground text-lg font-bold">Disponibilidade por Veículo</h3>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">≥ 95%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">90-94%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">&lt; 90%</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                <XAxis
                                    dataKey="placa"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }}
                                    height={60}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="valor" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                    {chartData.map((entry: { placa: string; valor: number }, index: number) => {
                                        let color = '#10B981'; // emerald-500
                                        if (entry.valor < 90) color = '#EF4444'; // red-500
                                        else if (entry.valor < 95) color = '#F59E0B'; // yellow-500

                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 bg-surface-highlight/10 rounded-lg">
                            <div className="text-center">
                                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Sem dados de disponibilidade para exibir com os filtros atuais.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ModernKpiCard({ title, value, sub, icon: Icon, iconColor, iconBg, isSuccess }: {
    title: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    isSuccess?: boolean
}) {
    return (
        <div className="bg-surface border border-border-color p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 leading-snug">{title}</p>
                    <h3 className={`text-2xl font-bold text-foreground tracking-tight ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{value}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 cursor-pointer hover:text-primary transition-colors">{sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} mb-2`}>
                    <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
            </div>
        </div>
    )
}

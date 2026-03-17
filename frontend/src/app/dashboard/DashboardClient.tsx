'use client'

import { ArrowUpRight, ArrowDownRight, Activity, Wrench, AlertTriangle, CheckCircle2, Clock, FileText, Settings, AlertCircle, Filter, Search, Calendar, Share2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getVehicleDetails } from '../actions/frota-actions'
import { Loader2 } from 'lucide-react'

interface DashboardFilters {
    dataInicio?: string
    dataFim?: string
    placa?: string
    status?: string
    os?: string
    tipo?: string
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
        <div className="dashboard-card p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
                    <h3 className={`text-3xl font-black text-foreground tracking-tighter ${isSuccess ? 'text-primary' : ''}`}>{value}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 transition-colors">{sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${iconBg} ${iconColor} mb-2 shadow-sm`}>
                    <Icon className="w-6 h-6 stroke-[2.5px]" />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
        </div>
    )
}

export default function DashboardClient({ metrics, chartData, preventiveData, recentActivity, filters }: {
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
    preventiveData: { name: string; value: number; fill: string; placa: string }[],
    recentActivity: any[],
    filters: DashboardFilters
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isVisitor = searchParams.get('visitor') === 'true'

    const [localFilters, setLocalFilters] = useState(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const handleBarClick = async (data: any) => {
        if (!data || !data.payload || !data.payload.id) return
        setIsLoadingDetails(true)
        setSelectedVehicle(null)
        setIsDetailOpen(true)
        try {
            const res = await getVehicleDetails(data.payload.id)
            if (res.success) {
                setSelectedVehicle(res.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const applyFilters = useCallback(() => {
        console.log('[Client] Aplicando filtros locais:', localFilters)
        const params = new URLSearchParams()
        if (localFilters.dataInicio) params.set('dataInicio', localFilters.dataInicio)
        if (localFilters.dataFim) params.set('dataFim', localFilters.dataFim)
        if (localFilters.placa) params.set('placa', localFilters.placa)
        if (localFilters.status) params.set('status', localFilters.status)
        if (localFilters.os) params.set('os', localFilters.os)
        if (localFilters.tipo) params.set('tipo', localFilters.tipo)
        if (isVisitor) params.set('visitor', 'true')
        const finalUrl = `/dashboard?${params.toString()}`
        console.log('[Client] Redirecionando para:', finalUrl)
        router.push(finalUrl)
    }, [localFilters, router, isVisitor])

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const anos = [2024, 2025, 2026]

    return (
        <div className="space-y-8 pb-12">
            {/* Filters Bar -> (same as before) ... */}
            <div className="bg-surface border border-border-color p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-end">
                {/* (Keeping existing filter inputs) */}
                {/* Date Inputs */}
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Data Inicial</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <input
                            type="date"
                            value={localFilters.dataInicio || ''}
                            onChange={e => setLocalFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Data Final</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <input
                            type="date"
                            value={localFilters.dataFim || ''}
                            onChange={e => setLocalFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={applyFilters}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                    {!isVisitor && (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams()
                                if (localFilters.dataInicio) params.set('dataInicio', localFilters.dataInicio)
                                if (localFilters.dataFim) params.set('dataFim', localFilters.dataFim)
                                if (localFilters.placa) params.set('placa', localFilters.placa)
                                if (localFilters.status) params.set('status', localFilters.status)
                                if (localFilters.os) params.set('os', localFilters.os)
                                if (localFilters.tipo) params.set('tipo', localFilters.tipo)
                                params.set('visitor', 'true')
                                const url = `${window.location.origin}/dashboard?${params.toString()}`
                                navigator.clipboard.writeText(url)
                                alert('Link de visitante copiado para a área de transferência!')
                            }}
                            className="bg-surface hover:bg-surface-highlight text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2"
                            title="Copiar link de visitante"
                        >
                            <Share2 className="w-4 h-4" />
                            Compartilhar
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Grid (already updated) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <ModernKpiCard
                    title="Total de OS"
                    value={metrics.totalOS}
                    sub="Mês selecionado"
                    icon={FileText}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                />
                <ModernKpiCard
                    title="Em Execução"
                    value={metrics.osAbertas}
                    sub="Manutenções ativas"
                    icon={Clock}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100 dark:bg-orange-900/30"
                />
                <ModernKpiCard
                    title="OS Fechadas"
                    value={metrics.osFechadas}
                    sub="Mês selecionado"
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                />
                <ModernKpiCard
                    title="Meta Disponib."
                    value={`${metrics.disponibilidadeGlobal}%`}
                    sub="Target: 95%"
                    icon={Activity}
                    iconColor="text-primary"
                    iconBg="bg-primary/10"
                    isSuccess={Number(metrics.disponibilidadeGlobal) >= 95}
                />
                <ModernKpiCard
                    title="MTTR"
                    value={`${metrics.mttr}h`}
                    sub="Média Reparo"
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
                <div className="dashboard-card p-4 flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col w-full">
                            <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Documentos da Frota</p>
                            <div className="grid grid-cols-3 gap-3 w-full">
                                <div className="flex flex-col p-1 rounded-lg transition-colors">
                                    <span className="text-xl font-black text-emerald-500 leading-none">{metrics.docs?.valid ?? 0}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Ok</span>
                                </div>
                                <div className="flex flex-col p-1 rounded-lg transition-colors">
                                    <span className="text-xl font-black text-yellow-500 leading-none">{metrics.docs?.attention ?? 0}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Avisos</span>
                                </div>
                                <div className="flex flex-col p-1 rounded-lg transition-colors">
                                    <span className="text-xl font-black text-red-500 leading-none">{metrics.docs?.expired ?? 0}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Venc</span>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-border-color/30 pt-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Status Geral</span>
                                <ArrowUpRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <FileText className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Availability Chart (Already updated) */}
            <div className="dashboard-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <div>
                        <h3 className="text-foreground text-xl font-black tracking-tight">Disponibilidade por Veículo</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Percentual de operação no período</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-gray-500">Alto</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                            <span className="text-gray-500">Alerta</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            <span className="text-gray-500">Crítico</span>
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div className="h-[350px]" style={{ minWidth: `${Math.max(800, chartData.length * 60)}px` }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                                    <XAxis
                                        dataKey="placa"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 800 }}
                                        height={60}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 800 }}
                                        tickFormatter={(val) => `${val}%`}
                                        stroke="transparent"
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Bar
                                        dataKey="valor"
                                        radius={[6, 6, 0, 0]}
                                        animationDuration={1000}
                                        barSize={32}
                                        onClick={handleBarClick}
                                        cursor="pointer"
                                    >
                                        <LabelList
                                            dataKey="valor"
                                            position="top"
                                            formatter={(val: any) => `${val}%`}
                                            style={{ fill: '#6B7280', fontWeight: '800', fontSize: '10px' }}
                                        />
                                        {chartData.map((entry: any, index: number) => {
                                            let color = '#10B981';
                                            if (entry.valor < 90) color = '#EF4444';
                                            else if (entry.valor < 95) color = '#F59E0B';
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 bg-surface-highlight/5 rounded-2xl border-2 border-dashed border-border-color">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-10" />
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">Sem dados operacionais</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preventive Maintenance Status - Full Width */}
            <div className="dashboard-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <div>
                        <h3 className="text-foreground text-xl font-black tracking-tight">Status de Preventivas</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Horas restantes para serviços</p>
                    </div>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-gray-500">No Prazo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                            <span className="text-gray-500">Atenção</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            <span className="text-gray-500">Crítico</span>
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div className="h-[400px]" style={{ minWidth: `${Math.max(1000, preventiveData.length * 60)}px` }}>
                        {preventiveData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={preventiveData}
                                    margin={{ top: 30, right: 30, left: 10, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                                    <XAxis
                                        dataKey="placa"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 800 }}
                                        height={70}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 800 }}
                                        tickFormatter={(val) => `${val}h`}
                                        stroke="transparent"
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '13px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                        formatter={(val: any) => [`${val}h`, 'Horas Restantes']}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35}>
                                        <LabelList
                                            dataKey="value"
                                            position="top"
                                            formatter={(val: any) => `${val}h`}
                                            style={{ fill: '#6B7280', fontWeight: '800', fontSize: '11px' }}
                                        />
                                        {preventiveData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400 opacity-30">
                                <CheckCircle2 className="w-12 h-12 mb-3" />
                                <p className="text-sm font-black uppercase tracking-widest">Tudo em dia</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue Preventives List */}
                <div className="dashboard-card p-6 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-foreground text-lg font-black tracking-tight flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Preventivas Atrasadas
                            </h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ações imediatas necessárias</p>
                        </div>
                        <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {preventiveData.filter(p => p.value < 0).length} Alertas
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {preventiveData.filter(p => p.value < 0).length > 0 ? (
                            preventiveData.filter(p => p.value < 0).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600 font-black text-xs">
                                            {p.placa.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground">{p.name}</p>
                                            <p className="text-[10px] text-red-500 font-bold uppercase">Atrasada em {Math.abs(p.value)}h</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 opacity-30 border-2 border-dashed border-border-color rounded-2xl">
                                <CheckCircle2 className="w-10 h-10 mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">Nenhum atraso crítico</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiring Docs List (Brief View) */}
                <div className="dashboard-card p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-foreground text-lg font-black tracking-tight flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-500" />
                                Documentação Crítica
                            </h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Vencidos ou a vencer (30 dias)</p>
                        </div>
                         <button 
                            onClick={async () => {
                                // Logic to fetch ALL critical docs could go here, or just open a generic view
                                setIsDetailOpen(true);
                            }}
                            className="text-amber-500 text-[10px] font-black uppercase hover:underline"
                        >
                            Ver Todos
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {/* Here we would ideally have a list of specific critical docs across all vehicles */}
                         {/* For now, we show a summary or sample since kpis.docs has the stats */}
                         <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10 text-center">
                                <p className="text-[10px] font-black text-red-500 uppercase">Vencidos</p>
                                <p className="text-xl font-black text-red-600">{metrics.docs?.expired || 0}</p>
                            </div>
                            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-center">
                                <p className="text-[10px] font-black text-amber-500 uppercase">A Vencer</p>
                                <p className="text-xl font-black text-amber-600">{metrics.docs?.attention || 0}</p>
                            </div>
                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">
                                <p className="text-[10px] font-black text-emerald-500 uppercase">Válidos</p>
                                <p className="text-xl font-black text-emerald-600">{metrics.docs?.valid || 0}</p>
                            </div>
                         </div>
                         
                         <p className="text-[10px] text-gray-500 font-bold text-center italic mt-4">
                            Clique em "Ver Todos" ou selecione um veículo no gráfico para ver detalhes por frota.
                         </p>
                    </div>
                </div>
            </div>
            <div className="dashboard-card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-foreground text-xl font-black tracking-tight">Atividades Recentes</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Últimas Ordens de Serviço abertas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((os, i) => (
                            <div key={os.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-highlight/30 hover:bg-surface-highlight/60 transition-all border border-border-color/50 group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner flex-shrink-0 ${os.status === 'CONCLUIDA' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                    os.status === 'EM_EXECUCAO' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                    }`}>
                                    {os.veiculo?.codigoInterno || 'N/A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-black text-foreground truncate">{os.veiculo?.placa || '---'}</h4>
                                        <span className="text-[9px] font-black text-gray-500 uppercase">{new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 italic font-medium">&ldquo;{os.descricao}&rdquo;</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${os.tipoOS === 'CORRETIVA' ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-blue-500/20 text-blue-500 bg-blue-500/5'
                                            }`}>
                                            {os.tipoOS}
                                        </span>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{os.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 opacity-20">
                            <FileText className="w-16 h-16 mb-2" />
                            <p className="text-sm font-black uppercase tracking-widest">Sem atividades registradas</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Documentação do Veículo</DialogTitle>
                        <DialogDescription>Detalhes e validade dos documentos</DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : selectedVehicle ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-highlight/30 rounded-xl border border-border-color">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Placa</p>
                                    <p className="font-black text-lg">{selectedVehicle.placa}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Frota</p>
                                    <p className="font-bold">{selectedVehicle.codigoInterno}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Modelo</p>
                                    <p className="font-medium text-sm">{selectedVehicle.modelo}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Categoria</p>
                                    <p className="font-medium text-sm">{selectedVehicle.tipoVeiculo}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-black uppercase mb-3 text-gray-500">Documentos Cadastrados</h4>
                                {selectedVehicle.documentos && selectedVehicle.documentos.length > 0 ? (
                                    <div className="border border-border-color rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-surface-highlight/50 border-b border-border-color">
                                                <tr>
                                                    <th className="p-3 font-bold text-gray-500">Tipo</th>
                                                    <th className="p-3 font-bold text-gray-500">Número</th>
                                                    <th className="p-3 font-bold text-gray-500">Validade</th>
                                                    <th className="p-3 font-bold text-gray-500 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-color">
                                                {selectedVehicle.documentos.map((doc: any) => {
                                                    const today = new Date()
                                                    today.setHours(0, 0, 0, 0)
                                                    const validade = doc.dataValidade ? new Date(doc.dataValidade) : null
                                                    let status = 'VALIDO'
                                                    let statusColor = 'bg-emerald-500/10 text-emerald-600'
                                                    let statusLabel = 'Válido'

                                                    if (!validade) {
                                                        status = 'PENDENTE'
                                                        statusColor = 'bg-gray-100 text-gray-500'
                                                        statusLabel = 'Indefinido'
                                                    } else {
                                                        if (validade < today) {
                                                            status = 'VENCIDO'
                                                            statusColor = 'bg-red-500/10 text-red-600'
                                                            statusLabel = 'Vencido'
                                                        } else {
                                                            const diffTime = Math.abs(validade.getTime() - today.getTime());
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                            if (diffDays <= 30) {
                                                                status = 'ATENCAO'
                                                                statusColor = 'bg-amber-500/10 text-amber-600'
                                                                statusLabel = 'A vencer'
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <tr key={doc.id} className="hover:bg-surface-highlight/20 transition-colors">
                                                            <td className="p-3 font-medium">{doc.tipo}</td>
                                                            <td className="p-3 font-mono text-xs">{doc.numero}</td>
                                                            <td className="p-3">
                                                                {validade ? validade.toLocaleDateString('pt-BR') : '-'}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${statusColor}`}>
                                                                    {statusLabel}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border-2 border-dashed border-border-color rounded-xl opacity-50">
                                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                        <p>Nenhum documento cadastrado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-red-500">
                            Erro ao carregar detalhes.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}


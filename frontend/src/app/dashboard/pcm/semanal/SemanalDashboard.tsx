'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    LineChart, Line, Legend
} from 'recharts'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Veiculo } from './SemanalClient'

interface SemanalDashboardProps {
    veiculos: Veiculo[]
    startDate: string
    endDate: string
    onBack?: () => void
}

export default function SemanalDashboard({ veiculos, startDate, endDate, onBack }: SemanalDashboardProps) {
    const totalVehicles = veiculos.filter(v => v.status !== 'DESATIVADO').length

    // Calculate Dynamic Month Name from startDate
    const monthName = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' })
    const operationalMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    // Calculate adherence for planned vs executed
    const programmed = veiculos.filter(v => v.semanaPreventiva !== null).length
    const completed = veiculos.filter(v => v.semanaPreventiva !== null && v.programacaoStatus === 'CONCLUIDO').length
    const adherence = programmed > 0 ? (completed / programmed) * 100 : 0

    // Acompanhamento de Programação Semanal
    // Each week represents a meta of 25% (total 100% for the month)
    const weeklyKPI = [1, 2, 3, 4].map(week => {
        const weekVehicles = veiculos.filter(v => v.semanaPreventiva === week)
        const weekCompleted = weekVehicles.filter(v => v.programacaoStatus === 'CONCLUIDO').length

        // Calculate realized % within the 25% limit
        // Formula: (Completed / Total in week) * 25
        const weekTotal = weekVehicles.length
        const realizedVal = weekTotal > 0 ? (weekCompleted / weekTotal) * 25 : 0

        return {
            name: `S${week}`,
            meta: 25,
            realizado: parseFloat(realizedVal.toFixed(2))
        }
    })

    // Mock Monthly Data - Reset to zero/null as requested
    const monthlyResults = [
        { name: 'Jan', meta: 100, realizado: 0 },
        { name: 'Fev', meta: 100, realizado: 0 },
        { name: 'Mar', meta: 100, realizado: 0 },
        { name: 'Abr', meta: 100, realizado: 0 },
        { name: 'Mai', meta: 100, realizado: 0 },
        { name: 'Jun', meta: 100, realizado: 0 },
        { name: 'Jul', meta: 100, realizado: 0 },
        { name: 'Ago', meta: 100, realizado: 0 },
        { name: 'Set', meta: 100, realizado: 0 },
        { name: 'Out', meta: 100, realizado: 0 },
        { name: 'Nov', meta: 100, realizado: 0 },
        { name: 'Dez', meta: 100, realizado: 0 },
    ]


    // Calculate status counts
    const statusCounts = {
        PENDENTE: veiculos.filter(v => v.semanaPreventiva !== null && (v.programacaoStatus === 'PENDENTE' || !v.programacaoStatus)).length,
        EM_EXECUCAO: veiculos.filter(v => v.semanaPreventiva !== null && v.programacaoStatus === 'EM_EXECUCAO').length,
        CONCLUIDO: veiculos.filter(v => v.semanaPreventiva !== null && v.programacaoStatus === 'CONCLUIDO').length,
        ADIADO: veiculos.filter(v => v.semanaPreventiva !== null && v.programacaoStatus === 'ADIADO').length
    }

    const performanceData = [
        { name: 'Concluído', value: statusCounts.CONCLUIDO, color: '#10b981' },
        { name: 'Em Execução', value: statusCounts.EM_EXECUCAO, color: '#f59e0b' },
        { name: 'Pendente', value: statusCounts.PENDENTE, color: '#64748b' },
        { name: 'Adiado', value: statusCounts.ADIADO, color: '#ef4444' }
    ].filter(d => d.value > 0)

    return (
        <div className="h-full flex flex-col space-y-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] overflow-hidden">
            {/* Header / Brand Area */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-3 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl shadow-sm border border-border-color transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase italic leading-none">KPI DE MANUTENÇÃO</h1>
                        <div className="h-1.5 w-24 bg-primary rounded-full mt-2" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-border-color rounded-2xl px-6 py-3 shadow-sm flex flex-col items-end justify-center text-slate-700 dark:text-slate-300">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Calendário Operacional</span>
                        <span className="text-sm font-black ">Mês Operacional {operationalMonth}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* KPI Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                    <KPICard
                        label="Aderência Geral"
                        value={`${adherence.toFixed(1)}%`}
                        sub={`${completed}/${programmed} Programados`}
                        color="text-primary"
                        bg="bg-primary/10"
                    />
                    <KPICard
                        label="Em Execução"
                        value={statusCounts.EM_EXECUCAO}
                        sub="Iniciados na semana"
                        color="text-amber-500"
                        bg="bg-amber-500/10"
                    />
                    <KPICard
                        label="Concluídos"
                        value={statusCounts.CONCLUIDO}
                        sub="Finalizados no mês"
                        color="text-emerald-500"
                        bg="bg-emerald-500/10"
                    />
                    <KPICard
                        label="Total Frota"
                        value={totalVehicles}
                        sub="Equipamentos Ativos"
                        color="text-slate-400"
                        bg="bg-slate-100 dark:bg-slate-800"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly results (2/3 width) */}
                    <div className="lg:col-span-2">
                        <Card className="h-full border-none shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                            <div className="bg-slate-900 dark:bg-black px-8 py-4 flex justify-between items-center">
                                <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Resultado Mensal de Programação</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Meta</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Realizado</span>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="h-[300px] p-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyResults} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                        <XAxis dataKey="name" fontSize={11} fontWeight="900" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                        <YAxis domain={[0, 100]} fontSize={11} fontWeight="900" axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} tick={{ fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Line name="Meta" type="monotone" dataKey="meta" stroke="#1e293b" strokeWidth={4} dot={{ fill: '#1e293b', r: 4 }} />
                                        <Line name="Realizado" type="monotone" dataKey="realizado" stroke="#ef4444" strokeWidth={4} dot={{ fill: '#ef4444', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Breakdown (1/3 width) */}
                    <Card className="h-full border-none shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <div className="bg-slate-100 dark:bg-slate-800 px-8 py-4">
                            <h3 className="text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Status de Execução</h3>
                        </div>
                        <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={performanceData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {performanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {performanceData.map((item, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.name}</span>
                                        </div>
                                        <span className="text-xl font-black text-slate-700 dark:text-slate-200">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Chart: Acompanhamento Semanal */}
                <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-slate-100 dark:bg-slate-800 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Acompanhamento de Programação Semanal</h3>
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-lg bg-[#064e3b]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Meta (25%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-lg bg-[#2563eb]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Semanal</span>
                            </div>
                        </div>
                    </div>
                    <CardContent className="h-[320px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyKPI} barGap={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                <XAxis dataKey="name" fontSize={12} fontWeight="900" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis domain={[0, 30]} hide />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar name="META" dataKey="meta" fill="#064e3b" radius={[8, 8, 0, 0]} barSize={50} label={{ position: 'top', fontSize: 10, fill: '#064e3b', fontWeight: '900', formatter: (v: any) => `${v.toFixed(1)}%` }} />
                                <Bar name="SEMANAL" dataKey="realizado" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={50} label={{ position: 'top', fontSize: 10, fill: '#2563eb', fontWeight: '900', formatter: (v: any) => `${v.toFixed(1)}%` }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function KPICard({ label, value, sub, color, bg }: { label: string, value: string | number, sub: string, color: string, bg: string }) {
    return (
        <div className={`p-6 rounded-[2rem] ${bg} border border-border-color shadow-sm transition-all hover:scale-[1.02] group`}>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] mb-1">{label}</p>
            <h3 className={`text-3xl font-black ${color} tracking-tighter mb-1`}>{value}</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">{sub}</p>
        </div>
    )
}


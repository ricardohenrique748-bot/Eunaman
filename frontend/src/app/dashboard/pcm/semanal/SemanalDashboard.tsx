'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    LabelList, LineChart, Line
} from 'recharts'
import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Veiculo } from './SemanalClient'

interface SemanalDashboardProps {
    veiculos: Veiculo[]
    startDate: string
    endDate: string
    onBack?: () => void
}

export default function SemanalDashboard({ veiculos, startDate, endDate, onBack }: SemanalDashboardProps) {
    // 1. Data Processing
    const programmedVehicles = veiculos.filter(v => v.semanaPreventiva !== null)

    // Monthly Evolution Logic
    const monthlyResults = [
        { name: 'Jan', meta: 100, realizado: 0 },
        { name: 'Fev', meta: 100, realizado: programmedVehicles.length > 0 ? Math.round((programmedVehicles.filter(v => v.programacaoStatus === 'CONCLUIDO').length / programmedVehicles.length) * 100) : 0 },
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

    // Weekly Cycle Follow-up (Meta 25% cumulative/slot)
    const weeklyKPI = [1, 2, 3, 4].map(week => {
        const weekVehicles = veiculos.filter(v => v.semanaPreventiva === week)
        const weekCompleted = weekVehicles.filter(v => v.programacaoStatus === 'CONCLUIDO').length
        const totalInWeek = weekVehicles.length
        const realizedVal = totalInWeek > 0 ? (weekCompleted / totalInWeek) * 25 : 0
        return { name: `S${week}`, meta: 25, semanal: parseFloat(realizedVal.toFixed(2)) }
    })

    // Prepare Date Labels
    const monthBase = new Date(startDate + 'T00:00:00')
    const monthName = monthBase.toLocaleDateString('pt-BR', { month: 'long' })
    const monthNameUpper = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const monthLabelFull = `${monthBase.getMonth() + 1}º ${monthName.toUpperCase()}`

    // Status Preparation
    const statusMap: Record<string, string> = {
        'CONCLUIDO': 'CONCLUIDO',
        'EM_EXECUCAO': 'EM ANDAMENTO',
        'EM_ANDAMENTO': 'EM ANDAMENTO',
        'ADIADO': 'REPROGRAMADO',
        'REPROGRAMADO': 'REPROGRAMADO',
        'PENDENTE': 'PENDENTE'
    }
    const getStatusLabel = (s: string | undefined) => statusMap[s || 'PENDENTE'] || 'PENDENTE'
    const statusCounts = programmedVehicles.reduce((acc, v) => {
        const label = getStatusLabel(v.programacaoStatus)
        acc[label] = (acc[label] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const statusData = [
        { name: 'CONCLUIDO', value: statusCounts['CONCLUIDO'] || 0 },
        { name: 'EM ANDAMENTO', value: statusCounts['EM ANDAMENTO'] || 0 },
        { name: 'REPROGRAMADO', value: statusCounts['REPROGRAMADO'] || 0 },
        { name: 'PENDENTE', value: statusCounts['PENDENTE'] || 0 }
    ].filter(d => d.value > 0)

    const pieColors: Record<string, string> = {
        'CONCLUIDO': '#2563eb',
        'EM ANDAMENTO': '#1e3a8a',
        'REPROGRAMADO': '#ea580c',
        'PENDENTE': '#64748b'
    }

    // Category Preparation
    const categoryCounts = programmedVehicles.reduce((acc, v) => {
        const cat = v.tipoVeiculo || 'N/A'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    return (
        <div className="h-full flex flex-col space-y-6 bg-[#f8fafc] p-6 rounded-[2rem] overflow-hidden text-slate-800">
            {/* Header / Title Section */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                    {onBack && (
                        <button onClick={onBack} className="p-3 bg-white shadow-sm hover:bg-slate-50 rounded-2xl transition-all">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black italic tracking-tighter text-[#1e293b] flex items-center gap-3">
                            KPI DE MANUTENÇÃO
                        </h1>
                        <div className="w-24 h-2 bg-[#064e3b] rounded-full mt-1" />
                    </div>
                </div>

                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-6 py-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Calendário Operacional</span>
                    <span className="text-sm font-black text-slate-700">Mês Operacional {monthNameUpper}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">

                {/* 1. Monthly Results Chart */}
                <Card className="border border-slate-100 shadow-lg rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="px-8 py-5 bg-[#111827] flex justify-between items-center text-white">
                        <h3 className="text-xs font-black uppercase tracking-wider">Resultado Mensal de Programação Preventiva</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-wide">Meta 100%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-wide">Realizado</span>
                            </div>
                        </div>
                    </div>
                    <CardContent className="h-[300px] pt-10 pb-6 px-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyResults}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis domain={[0, 110]} hide />
                                <Tooltip />
                                <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={3} dot={{ r: 4, fill: '#334155' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="realizado" stroke="#ef4444" strokeWidth={4} dot={{ r: 5, fill: '#ef4444' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Weekly Results Chart */}
                <Card className="border border-slate-100 shadow-md rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Acompanhamento de Programação Semanal</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#064e3b]" />
                                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Meta (25%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#2563eb]" />
                                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Semanal</span>
                            </div>
                        </div>
                    </div>
                    <CardContent className="h-[250px] pt-10 pb-6 px-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyKPI} barGap={12}>
                                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#334155', fontWeight: 'bold' }} />
                                <YAxis hide domain={[0, 30]} />
                                <Tooltip />
                                <Bar dataKey="meta" fill="#064e3b" radius={[8, 8, 8, 8]} barSize={50} />
                                <Bar dataKey="semanal" fill="#2563eb" radius={[8, 8, 8, 8]} barSize={50}>
                                    <LabelList dataKey="semanal" position="top" style={{ fontSize: '12px', fontWeight: '900', fill: '#1e293b' }} formatter={(v: number) => `${v.toFixed(2)}%`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Small Support Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <Card className="md:col-span-3 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-[10px] font-black uppercase text-slate-400">Mês Operacional</h3>
                        </div>
                        <CardContent className="h-[180px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: monthLabelFull, value: programmedVehicles.length }]}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                    <Bar dataKey="value" fill="#064e3b" radius={[12, 12, 0, 0]} barSize={80}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '16px', fontWeight: 'black', fill: '#064e3b' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-[10px] font-black uppercase text-slate-400">Status das O.S</h3>
                        </div>
                        <CardContent className="h-[180px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                                    <Bar dataKey="value" fill="#064e3b" radius={[6, 6, 0, 0]} barSize={40}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'black', fill: '#064e3b' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-5 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-[10px] font-black uppercase text-slate-400">Distribuição Status %</h3>
                        </div>
                        <CardContent className="h-[180px] pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%" cy="50%"
                                        innerRadius={40} outerRadius={60}
                                        dataKey="value"
                                        label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                        fontSize={12}
                                        fontWeight="900"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[entry.name] || '#64748b'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Category and Table Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                    <Card className="md:col-span-4 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-[10px] font-black uppercase text-slate-400">Frota por Categoria</h3>
                        </div>
                        <CardContent className="h-[250px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                                    <Bar dataKey="value" fill="#064e3b" radius={[6, 6, 0, 0]} barSize={40}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'black', fill: '#064e3b' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-8 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50">
                            <div className="grid grid-cols-12 gap-4 text-[10px] font-black uppercase text-slate-400">
                                <div className="col-span-2">Mês</div>
                                <div className="col-span-3">Categoria</div>
                                <div className="col-span-2">Placa</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-3 text-right">Plano de Manutenção</div>
                            </div>
                        </div>
                        <CardContent className="p-0 max-h-[250px] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col divide-y divide-slate-100">
                                {programmedVehicles.map((v, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] hover:bg-slate-50 transition-colors uppercase">
                                        <div className="col-span-2 font-black text-slate-400 normal-case">{monthLabelFull}</div>
                                        <div className="col-span-3 font-black text-slate-700 normal-case">{v.tipoVeiculo}</div>
                                        <div className="col-span-2 font-black text-[#2563eb]">{v.placa || v.codigoInterno}</div>
                                        <div className="col-span-2 font-black flex items-center gap-2 text-[10px]">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[getStatusLabel(v.programacaoStatus)] }} />
                                            {getStatusLabel(v.programacaoStatus)}
                                        </div>
                                        <div className="col-span-3 text-right text-slate-500 font-bold truncate normal-case">
                                            {v.programacaoDescricao || 'Revisão Preventiva'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

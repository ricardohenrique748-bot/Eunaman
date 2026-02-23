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


    return (
        <div className="h-full flex flex-col space-y-6 bg-gray-50/50 p-6 rounded-[2.5rem] overflow-hidden">
            {/* Header / Brand Area */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-border-color transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase italic leading-none">KPI DE MANUTENÇÃO</h1>
                        <div className="h-1.5 w-24 bg-primary rounded-full mt-2" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white border border-border-color rounded-2xl px-6 py-3 shadow-sm flex flex-col items-end justify-center">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Calendário Operacional</span>
                        <span className="text-sm font-black text-gray-700">Mês Operacional {operationalMonth}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Top Chart: Resultado Mensal */}
                <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Resultado Mensal de Programação Preventiva</h3>
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white border-2 border-white" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Meta 100%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Realizado</span>
                            </div>
                        </div>
                    </div>
                    <CardContent className="h-[300px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyResults} margin={{ top: 20, right: 40, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={11}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={15}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    fontSize={11}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `${val}%`}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Line
                                    name="Meta"
                                    type="monotone"
                                    dataKey="meta"
                                    stroke="#1e293b"
                                    strokeWidth={4}
                                    dot={{ fill: '#1e293b', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    name="Realizado"
                                    type="monotone"
                                    dataKey="realizado"
                                    stroke="#ef4444"
                                    strokeWidth={4}
                                    dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bottom Chart: Acompanhamento Semanal */}
                <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="bg-gray-100 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-gray-600 text-xs font-black uppercase tracking-[0.2em]">Acompanhamento de Programação Semanal</h3>
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-lg bg-[#064e3b]" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Meta (25%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-lg bg-[#2563eb]" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Semanal</span>
                            </div>
                        </div>
                    </div>
                    <CardContent className="h-[320px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyKPI} barGap={20}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    tick={{ fill: '#64748b' }}
                                />
                                <YAxis domain={[0, 30]} hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    name="META"
                                    dataKey="meta"
                                    fill="#064e3b"
                                    radius={[8, 8, 0, 0]}
                                    barSize={70}
                                    label={{ position: 'top', fontSize: 12, fill: '#064e3b', fontWeight: '900', formatter: (v: any) => `${v.toFixed(2)}%`, offset: 10 }}
                                />
                                <Bar
                                    name="SEMANAL"
                                    dataKey="realizado"
                                    fill="#2563eb"
                                    radius={[8, 8, 0, 0]}
                                    barSize={70}
                                    label={{ position: 'top', fontSize: 12, fill: '#2563eb', fontWeight: '900', formatter: (v: any) => `${v.toFixed(2)}%`, offset: 10 }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

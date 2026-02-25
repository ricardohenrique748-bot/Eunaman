'use client'

import React from 'react'
import { BacklogItem } from '@/app/actions/backlog-actions'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Hammer, ListTodo } from 'lucide-react'

export default function BacklogDashboard({ data }: { data: BacklogItem[] }) {

    // Process Data
    const total = data.length

    const criticalA = data.filter(i => i.criticidade?.startsWith('A')).length
    const criticalB = data.filter(i => i.criticidade?.startsWith('B')).length
    const pending = data.filter(i => {
        const status = i.status?.toLowerCase() || ''
        return status !== 'concluido' && status !== 'concluída' && status !== 'encerrado' && status !== 'encerrada'
    }).length
    const completed = total - pending

    // Chart 1: By Type (Simplistic grouping)
    const typeCount = data.reduce((acc, item) => {
        const t = (item.tipo || 'OUTROS').trim().toUpperCase()
        acc[t] = (acc[t] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const typeData = Object.entries(typeCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7) // Show top 7 max

    // Chart 2: Status Distribution
    const statusData = [
        { name: 'Em Aberto', value: pending, color: '#f59e0b' },
        { name: 'Concluído', value: completed, color: '#10b981' },
    ]

    // Chart 3: By Semana (Week)
    const weekCount = data.reduce((acc, item) => {
        const week = (item.semana || 'Não Info').trim()
        acc[week] = (acc[week] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const weekData = Object.entries(weekCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            if (a.name === 'Não Info') return 1
            if (b.name === 'Não Info') return -1
            return a.name.localeCompare(b.name, undefined, { numeric: true })
        })

    return (
        <div className="p-4 md:p-8 space-y-8 overflow-y-auto h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Header / Intro */}
            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black tracking-tight text-foreground">Visão Geral</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Acompanhamento do Backlog</p>
            </div>

            {/* Stats Cards - Minimalist Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-surface border border-border-color/60 shadow-none rounded-2xl overflow-hidden group hover:border-border-color transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total</span>
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                <ListChecks className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-foreground">{total}</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Itens Cadastrados</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border border-border-color/60 shadow-none rounded-2xl overflow-hidden group hover:border-border-color transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Crit. A</span>
                            <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-foreground">{criticalA}</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Alta Relevância</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border border-border-color/60 shadow-none rounded-2xl overflow-hidden group hover:border-border-color transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Crit. B</span>
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-foreground">{criticalB}</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Média Relevância</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border border-border-color/60 shadow-none rounded-2xl overflow-hidden group hover:border-border-color transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Concluídos</span>
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-foreground">{completed}</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Taxa: {total > 0 ? Math.round((completed / total) * 100) : 0}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border border-border-color/60 shadow-none rounded-2xl overflow-hidden group hover:border-border-color transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Em Aberto</span>
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                <Hammer className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-foreground">{pending}</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Pendente</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[380px]">
                <Card className="col-span-1 border border-border-color/60 shadow-none rounded-2xl bg-surface/50">
                    <CardHeader className="pb-2 border-b border-border-color/20 mb-4 px-6 pt-6">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Por Tipo de Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0 pr-6 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="value" fill="currentColor" radius={[6, 6, 6, 6]} barSize={40} className="fill-primary/80 hover:fill-primary transition-colors">
                                    <LabelList dataKey="value" position="top" className="fill-foreground text-[10px] font-black" offset={8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border border-border-color/60 shadow-none rounded-2xl bg-surface/50">
                    <CardHeader className="pb-2 border-b border-border-color/20 mb-4 px-6 pt-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Status Geral</CardTitle>
                        <div className="flex gap-4">
                            {statusData.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[280px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={105}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={6}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label inside Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                            <span className="text-4xl font-black text-foreground">{total}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Segunda Linha de Gráficos */}
            <div className="grid grid-cols-1 gap-6 h-[380px] mt-6">
                <Card className="col-span-1 border border-border-color/60 shadow-none rounded-2xl bg-surface/50">
                    <CardHeader className="pb-2 border-b border-border-color/20 mb-4 px-6 pt-6">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Por Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0 pr-6 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="value" fill="currentColor" radius={[6, 6, 6, 6]} barSize={40} className="fill-blue-500/80 hover:fill-blue-500 transition-colors">
                                    <LabelList dataKey="value" position="top" className="fill-foreground text-[10px] font-black" offset={8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ListChecks(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 17 2 2 4-4" />
            <path d="m3 7 2 2 4-4" />
            <path d="M13 6h8" />
            <path d="M13 12h8" />
            <path d="M13 18h8" />
        </svg>
    )
}

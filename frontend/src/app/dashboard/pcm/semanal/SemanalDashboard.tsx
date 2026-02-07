'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Veiculo } from './SemanalClient'

interface SemanalDashboardProps {
    veiculos: Veiculo[]
    onBack: () => void
}

export default function SemanalDashboard({ veiculos, onBack }: SemanalDashboardProps) {
    const totalVehicles = veiculos.filter(v => v.status !== 'DESATIVADO').length

    // Calculate adherence for planned vs executed
    const programmed = veiculos.filter(v => v.semanaPreventiva !== null).length
    const completed = veiculos.filter(v => v.semanaPreventiva !== null && v.programacaoStatus === 'CONCLUIDO').length
    const adherence = programmed > 0 ? (completed / programmed) * 100 : 0

    // Week distribution
    const weekDistribution = [1, 2, 3, 4].map(week => ({
        name: `Semana ${week}`,
        count: veiculos.filter(v => v.semanaPreventiva === week).length
    }))

    // Status breakdown for programmed only
    const statusCounts = {
        'CONCLUIDO': 0,
        'EM_ANDAMENTO': 0,
        'PENDENTE': 0,
        'CANCELADO': 0
    }

    veiculos.filter(v => v.semanaPreventiva !== null).forEach(v => {
        const s = v.programacaoStatus || 'PENDENTE'
        if (statusCounts[s as keyof typeof statusCounts] !== undefined) {
            statusCounts[s as keyof typeof statusCounts]++
        }
    })

    const statusData = [
        { name: 'Concluído', value: statusCounts.CONCLUIDO, color: '#10b981' }, // Emerald
        { name: 'Em Andamento', value: statusCounts.EM_ANDAMENTO, color: '#3b82f6' }, // Blue
        { name: 'Pendente', value: statusCounts.PENDENTE, color: '#f59e0b' }, // Amber
        { name: 'Cancelado', value: statusCounts.CANCELADO, color: '#ef4444' }, // Red
    ].filter(i => i.value > 0)


    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-surface border border-border-color rounded-lg text-xs font-black uppercase tracking-widest hover:bg-surface-highlight transition-colors"
                >
                    Voltar
                </button>
                <h2 className="text-xl font-black text-foreground">Dashboard de Aderência Semanal</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-surface shadow-none border-border-color">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Programado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">{programmed} <span className="text-xs text-gray-400 font-normal">veículos</span></div>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Concluídos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-500">{completed}</div>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Aderência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{Math.round(adherence)}%</div>
                        <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${adherence}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Pendente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-orange-500">{statusCounts.PENDENTE}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                <Card className="bg-surface border-border-color">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Distribuição por Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border-color">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Status da Programação</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-[-20px]">
                            {statusData.map(s => (
                                <div key={s.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

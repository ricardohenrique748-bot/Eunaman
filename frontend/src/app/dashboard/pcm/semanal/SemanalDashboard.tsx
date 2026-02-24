'use client'

import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    Legend, LabelList
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
    // 1. Filter only vehicles in the weekly program
    const programmedVehicles = veiculos.filter(v => v.semanaPreventiva !== null)

    // 2. Prepare Data for Mês Operacional
    const monthBase = new Date(startDate + 'T00:00:00')
    const monthNum = monthBase.getMonth() + 1
    const monthName = monthBase.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
    const monthLabel = `${monthNum}º ${monthName}`

    const monthData = [{
        name: monthLabel,
        value: programmedVehicles.length
    }]

    // 3. Prepare Data for Status
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

    // 4. Prepare Data for Pie Chart (Status Distribution)
    const pieColors: Record<string, string> = {
        'CONCLUIDO': '#2563eb',
        'EM ANDAMENTO': '#1e3a8a',
        'REPROGRAMADO': '#ea580c',
        'PENDENTE': '#64748b'
    }

    // 5. Prepare Data for Categoria Operacional
    const categoryCounts = programmedVehicles.reduce((acc, v) => {
        const cat = v.tipoVeiculo || 'N/A'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    return (
        <div className="h-full flex flex-col space-y-4 bg-[#f8fafc] p-6 rounded-[1rem] overflow-hidden text-slate-800">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-700">QUADRO DE INDICADORES</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Card className="md:col-span-3 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Mês Operacional</h3>
                        </div>
                        <CardContent className="h-[200px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#064e3b" radius={[4, 4, 0, 0]} barSize={60}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Status das O.S</h3>
                        </div>
                        <CardContent className="h-[200px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#064e3b" radius={[4, 4, 0, 0]} barSize={40}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-5 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Distribuição Status %</h3>
                        </div>
                        <CardContent className="h-[200px] pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={70}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4">
                    <Card className="md:col-span-4 border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-3 border-b border-slate-50 flex flex-col items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Frota por Categoria</h3>
                        </div>
                        <CardContent className="h-[250px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#064e3b" radius={[4, 4, 0, 0]} barSize={40}>
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'bold' }} />
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
                                    <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-3 text-[11px] hover:bg-slate-50 transition-colors capitalize">
                                        <div className="col-span-2 font-medium text-slate-500">{monthLabel}</div>
                                        <div className="col-span-3 font-bold text-slate-700">{v.tipoVeiculo}</div>
                                        <div className="col-span-2 font-black text-primary uppercase">{v.placa || v.codigoInterno}</div>
                                        <div className="col-span-2 font-bold uppercase flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pieColors[getStatusLabel(v.programacaoStatus)] }} />
                                            {getStatusLabel(v.programacaoStatus)}
                                        </div>
                                        <div className="col-span-3 text-right text-slate-500 font-medium truncate">
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

'use client'

import { Wrench, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { OrdemServico } from '@prisma/client'

interface OsStatsCardsProps {
    ordens: OrdemServico[]
}

export default function OsStatsCards({ ordens }: OsStatsCardsProps) {
    const stats = {
        total: ordens.length,
        abertas: ordens.filter(os => os.status === 'ABERTA').length,
        emExecucao: ordens.filter(os => os.status === 'EM_EXECUCAO').length,
        concluidas: ordens.filter(os => os.status === 'CONCLUIDA').length,
        planejadas: ordens.filter(os => os.status === 'PLANEJADA').length
    }

    const cards = [
        {
            label: 'Total de O.S.',
            value: stats.total,
            icon: Wrench,
            color: 'text-primary',
            bg: 'bg-primary/5',
            border: 'border-primary/10'
        },
        {
            label: 'Em Execução',
            value: stats.emExecucao,
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-500/5',
            border: 'border-orange-500/10'
        },
        {
            label: 'Pendentes/Planejadas',
            value: stats.abertas + stats.planejadas,
            icon: AlertTriangle,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/5',
            border: 'border-yellow-500/10'
        },
        {
            label: 'Concluídas',
            value: stats.concluidas,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/10'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div 
                    key={idx}
                    className={`p-6 rounded-3xl bg-surface border ${card.border} shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5 group`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${card.color} opacity-50`}>
                            {Math.round((card.value / (stats.total || 1)) * 100)}%
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{card.label}</span>
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                            {card.value.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

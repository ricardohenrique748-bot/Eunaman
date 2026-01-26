'use client'
import { ArrowUpRight, ArrowDownRight, Activity, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                    title="Total de OS (Mês)"
                    value="45"
                    trend="+12%"
                    trendPositive
                    icon={Wrench}
                    color="text-blue-500"
                    footer="Todas as categorias"
                />
                <KpiCard
                    title="OS em Andamento"
                    value="12"
                    trend="4 Atrasadas"
                    trendPositive={false}
                    icon={Activity}
                    color="text-yellow-500"
                    footer="8 Planejadas / 4 Execução"
                />
                <KpiCard
                    title="OS Fechadas"
                    value="33"
                    trend="73% do total"
                    trendPositive
                    icon={CheckCircle2}
                    color="text-emerald-500"
                    footer="Concluídas este mês"
                />
                <KpiCard
                    title="Disponibilidade Frota"
                    value="94.2%"
                    trend="+1.5%"
                    trendPositive
                    icon={CheckCircle2}
                    color="text-emerald-500"
                    footer="Meta: 95.0%"
                />
                <KpiCard
                    title="MTTR (Médio)"
                    value="4.2h"
                    trend="-0.5h"
                    trendPositive
                    icon={Clock}
                    color="text-orange-500"
                    footer="Tempo Médio Reparo"
                />
                <KpiCard
                    title="MTBF (Médio)"
                    value="245h"
                    trend="+12h"
                    trendPositive
                    icon={Activity}
                    color="text-purple-500"
                    footer="Tempo Médio entre Falhas"
                />
            </div>

            {/* Charts & Lists Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Availability Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                    <h3 className="text-gray-100 font-semibold mb-6 flex items-center justify-between">
                        <span>Disponibilidade por Veículo</span>
                        <span className="text-xs text-gray-500 bg-surface-highlight px-2 py-1 rounded">Top 5 Críticos</span>
                    </h3>
                    <div className="space-y-4">
                        <BarRow label="Caminhão Volvo FH-540 (V-01)" percent={98} />
                        <BarRow label="Escavadeira CAT 320 (E-03)" percent={92} warning />
                        <BarRow label="Pá Carregadeira L120 (P-02)" percent={85} critical />
                        <BarRow label="Caminhão Scania R450 (V-04)" percent={96} />
                        <BarRow label="Trator John Deere 7200 (T-01)" percent={45} critical status="Em Manutenção (Motor)" />
                    </div>
                </div>

                {/* Preventives Alert (1 Col) */}
                <div className="bg-surface border border-border-color rounded-xl p-0 shadow-lg overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border-color bg-surface-highlight/5 flex justify-between items-center">
                        <h3 className="text-gray-100 font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Preventivas em Atraso
                        </h3>
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">3</span>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[300px] custom-scrollbar">
                        <div className="divide-y divide-border-color">
                            <AlertItem
                                vehicle="V-02"
                                plan="Troca de Óleo Motor"
                                overdue="500km"
                                trigger="15.000km"
                                date="2 dias atrás"
                            />
                            <AlertItem
                                vehicle="E-03"
                                plan="Revisão 500h"
                                overdue="24h"
                                trigger="500h"
                                date="Ontem"
                            />
                            <AlertItem
                                vehicle="T-01"
                                plan="Lubrificação Geral"
                                overdue="5 dias"
                                trigger="Semanal"
                                date="20/01"
                            />
                        </div>
                    </div>
                    <div className="p-3 bg-surface-highlight/5 border-t border-border-color text-center">
                        <button className="text-xs text-primary font-medium hover:text-orange-400">Ver Cronograma Completo &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ title, value, trend, trendPositive, icon: Icon, color, footer }: any) {
    return (
        <div className="bg-surface border border-border-color p-5 rounded-xl shadow-lg hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg bg-surface-highlight border border-white/5 ${color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded ${trendPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {trendPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1 tabular-nums tracking-tight">{value}</h3>
            </div>
            {footer && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-700">
                    <p className="text-xs text-gray-500">{footer}</p>
                </div>
            )}
        </div>
    )
}

function BarRow({ label, percent, warning, critical, status }: any) {
    let color = "bg-primary"
    if (warning) color = "bg-yellow-500"
    if (critical) color = "bg-red-500"

    return (
        <div className="group">
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{label}</span>
                <div className="flex items-center gap-2">
                    {status && <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">{status}</span>}
                    <span className={`font-mono font-bold ${critical ? 'text-red-500' : 'text-gray-200'}`}>{percent}%</span>
                </div>
            </div>
            <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}

function AlertItem({ vehicle, plan, overdue, trigger, date }: any) {
    return (
        <div className="p-4 hover:bg-surface-highlight/10 transition-colors border-l-2 border-transparent hover:border-red-500">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {vehicle}
                        <span className="bg-surface-highlight text-gray-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-normal">{trigger}</span>
                    </h4>
                    <p className="text-gray-400 text-sm mt-0.5">{plan}</p>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">+{overdue}</span>
                </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Venceu: {date}
            </p>
        </div>
    )
}

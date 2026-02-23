'use client'

import { useState, useMemo } from 'react'
import { Wrench, Search, Filter, ArrowUpDown, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import PreventivaActions from './PreventivaActions'

interface Plano {
    id: string
    tipo: string
    modulo: string | null
    ultimoHorimetro: number
    intervalo: number
    status: string
    veiculo: {
        placa: string | null
        modelo: string
        codigoInterno: string
        horimetroAtual: number
    }
}

interface PreventivaListClientProps {
    initialPlanos: Plano[]
}

export default function PreventivaListClient({ initialPlanos }: PreventivaListClientProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('TODOS')
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('TODOS')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc') // desc = maior para menor (urgência)

    // Get unique maintenance types
    const maintenanceTypes = useMemo(() => {
        const types = new Set(initialPlanos.map(p => p.tipo))
        return ['TODOS', ...Array.from(types)]
    }, [initialPlanos])

    const filteredAndSortedPlanos = useMemo(() => {
        let result = initialPlanos.filter(plano => {
            const matchesSearch = (plano.veiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plano.veiculo.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plano.veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesType = typeFilter === 'TODOS' || plano.tipo === typeFilter
            const matchesVehicleType = vehicleTypeFilter === 'TODOS' || plano.veiculo.tipoVeiculo === vehicleTypeFilter

            return matchesSearch && matchesType && matchesVehicleType
        })

        // Sort by percentual (urgency)
        result.sort((a, b) => {
            const percA = ((a.veiculo.horimetroAtual - a.ultimoHorimetro) / a.intervalo) * 100
            const percB = ((b.veiculo.horimetroAtual - b.ultimoHorimetro) / b.intervalo) * 100

            return sortOrder === 'desc' ? percB - percA : percA - percB
        })

        return result
    }, [initialPlanos, searchTerm, categoryFilter, sortOrder])

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-surface border border-border-color p-4 rounded-2xl shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar placa, código ou modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-3 py-1">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-border-color pr-2 mr-1">Tipo Plano</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer pr-2"
                        >
                            {maintenanceTypes.map(cat => (
                                <option key={cat} value={cat} className="bg-surface text-foreground">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-3 py-1">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-border-color pr-2 mr-1">Frota</span>
                        <select
                            value={vehicleTypeFilter}
                            onChange={(e) => setVehicleTypeFilter(e.target.value)}
                            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer pr-2"
                        >
                            <option value="TODOS" className="bg-surface">TODOS</option>
                            <option value="LEVE" className="bg-surface">LEVE</option>
                            <option value="PESADO" className="bg-surface">PESADO</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-4 py-2 hover:bg-surface transition-all text-xs font-black uppercase tracking-widest text-gray-600 active:scale-95 shadow-sm"
                    >
                        <ArrowUpDown className="w-4 h-4 text-primary" />
                        Urgência: {sortOrder === 'desc' ? 'Maior p/ Menor' : 'Menor p/ Maior'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredAndSortedPlanos.length === 0 ? (
                    <div className="col-span-full dashboard-card h-[40vh] flex items-center justify-center flex-col text-center p-8 bg-surface/30">
                        <div className="p-6 bg-surface-highlight rounded-full mb-6 shadow-inner">
                            <Wrench className="w-12 h-12 text-gray-600 opacity-20" />
                        </div>
                        <h2 className="text-xl font-black text-foreground mb-2">Nenhum plano encontrado</h2>
                        <p className="text-sm text-gray-500 max-w-xs">Tente ajustar seus filtros ou busca.</p>
                    </div>
                ) : (
                    filteredAndSortedPlanos.map((plano) => {
                        const horimetroAtual = plano.veiculo.horimetroAtual
                        const proximaRevisao = plano.ultimoHorimetro + plano.intervalo
                        const horasRestantes = proximaRevisao - horimetroAtual
                        const percentualRaw = ((horimetroAtual - plano.ultimoHorimetro) / plano.intervalo) * 100
                        const percentual = Math.min(100, Math.max(0, percentualRaw))

                        let statusColor = 'text-emerald-500'
                        let statusBg = 'bg-emerald-500/10'
                        let barColor = 'bg-emerald-500'
                        let statusText = 'No Prazo'

                        if (plano.status === 'ATRASADO' || horasRestantes < 0) {
                            statusColor = 'text-red-500'
                            statusBg = 'bg-red-500/10'
                            barColor = 'bg-red-500'
                            statusText = 'Atrasado'
                        } else if (plano.status === 'ATENCAO' || horasRestantes < 50) {
                            statusColor = 'text-yellow-500'
                            statusBg = 'bg-yellow-500/10'
                            barColor = 'bg-yellow-500'
                            statusText = 'Atenção'
                        }

                        return (
                            <div key={plano.id} className="dashboard-card p-6 group hover:translate-y-[-4px] hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                                {/* Subtle Background Gradient Icon */}
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <Wrench className="w-32 h-32 rotate-[-15deg] stroke-[3px]" />
                                </div>

                                <div className="relative z-10 font-bold uppercase tracking-widest">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-highlight border border-border-color flex flex-col items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                                                <span className="text-[10px] font-black text-gray-500">OS</span>
                                                <span className="text-sm font-black text-foreground leading-none">PV</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-lg font-black text-foreground tracking-tight">{plano.veiculo.placa || plano.veiculo.codigoInterno}</h3>
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-current/10 ${statusBg} ${statusColor}`}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plano.veiculo.modelo}</p>
                                            </div>
                                        </div>
                                        <PreventivaActions id={plano.id} />
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-surface-highlight/40 p-3 rounded-xl border border-border-color/50">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tipo</p>
                                                <p className="text-sm font-black text-foreground">{plano.tipo}</p>
                                            </div>
                                            <div className="bg-surface-highlight/40 p-3 rounded-xl border border-border-color/50 text-right">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Intervalo</p>
                                                <p className="text-sm font-black text-foreground">{plano.intervalo} h</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-3 bg-background rounded-xl border border-border-color/50">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-gray-500">Última: {plano.ultimoHorimetro}h</span>
                                                <span className="text-foreground">Atual: {horimetroAtual}h</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                                                    style={{ width: `${percentual}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border-color/50 flex justify-between items-center relative z-10 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Próxima Parada</span>
                                        <span className={`text-sm font-black ${statusColor} tracking-tight`}>
                                            {proximaRevisao} h
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Status</span>
                                        <span className={`text-xs font-bold ${statusColor} italic`}>
                                            {horasRestantes < 0 ? `${Math.abs(horasRestantes)}h em atraso` : `${horasRestantes}h restantes`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

'use client'

import { useState, useMemo } from 'react'
import { Wrench, Search, Filter, ArrowUpDown, Truck, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { deletePreventiva } from '@/app/actions/preventiva-actions'

interface Plano {
    id: string
    tipo: string
    modulo: string | null
    ultimoHorimetro: number
    intervalo: number
    status: string
    dataAtualizacao: string | Date
    veiculo: {
        placa: string | null
        modelo: string
        codigoInterno: string
        horimetroAtual: number
        tipoVeiculo: string
        categoria: string | null
        moduloSistema: string | null
    }
}

interface PreventivaListClientProps {
    initialPlanos: Plano[]
}

export default function PreventivaListClient({ initialPlanos }: PreventivaListClientProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('TODOS')
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('TODOS')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    // Get unique maintenance types
    const maintenanceTypes = useMemo(() => {
        const types = new Set(initialPlanos.map(p => p.tipo))
        return ['TODOS', ...Array.from(types)]
    }, [initialPlanos])

    const filteredAndSortedPlanos = useMemo(() => {
        let result = initialPlanos.filter(plano => {
            const searchStr = `${plano.veiculo.placa || ''} ${plano.veiculo.codigoInterno} ${plano.veiculo.modelo} ${plano.veiculo.tipoVeiculo}`.toLowerCase()
            const matchesSearch = searchStr.includes(searchTerm.toLowerCase())

            const matchesType = typeFilter === 'TODOS' || plano.tipo === typeFilter
            const matchesVehicleType = vehicleTypeFilter === 'TODOS' || plano.veiculo.tipoVeiculo === vehicleTypeFilter

            return matchesSearch && matchesType && matchesVehicleType
        })

        // Sort by 'Falta' (urgency)
        result.sort((a, b) => {
            const faltaA = (a.ultimoHorimetro + a.intervalo) - a.veiculo.horimetroAtual
            const faltaB = (b.ultimoHorimetro + b.intervalo) - b.veiculo.horimetroAtual

            return sortOrder === 'desc' ? faltaA - faltaB : faltaB - faltaA
        })

        return result
    }, [initialPlanos, searchTerm, typeFilter, vehicleTypeFilter, sortOrder])

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-surface border border-border-color p-4 rounded-2xl shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                    <input
                        type="text"
                        placeholder="BUSCAR PLACA, CÓDIGO OU MODELO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-all font-black uppercase tracking-widest"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-4 py-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-border-color pr-3 mr-1">TIPO PLANO</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer pr-2 text-foreground"
                        >
                            {maintenanceTypes.map(cat => (
                                <option key={cat} value={cat} className="bg-surface">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-4 py-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-border-color pr-3 mr-1">FROTA</span>
                        <select
                            value={vehicleTypeFilter}
                            onChange={(e) => setVehicleTypeFilter(e.target.value)}
                            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer pr-2 text-foreground"
                        >
                            <option value="TODOS" className="bg-surface">TODOS</option>
                            <option value="LEVE" className="bg-surface">LEVE</option>
                            <option value="PESADO" className="bg-surface">PESADO</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 bg-surface-highlight border border-border-color rounded-xl px-5 py-2.5 hover:bg-surface transition-all text-[10px] font-black uppercase tracking-widest text-foreground active:scale-95 shadow-sm"
                    >
                        <ArrowUpDown className="w-4 h-4 text-primary" />
                        URGÊNCIA: {sortOrder === 'desc' ? 'MAIOR P/ MENOR' : 'MENOR P/ MAIOR'}
                    </button>
                </div>
            </div>

            {/* List View (Table) */}
            <div className="bg-surface border border-border-color rounded-2xl shadow-sm overflow-hidden border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-highlight/50 border-b border-border-color">
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Placa</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Módulo</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Último</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Atual</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Próxima</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Falta</th>
                                <th className="px-4 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Última Atualização</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredAndSortedPlanos.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Wrench className="w-8 h-8 opacity-20" />
                                            <span className="text-sm font-black uppercase tracking-widest">Nenhum plano encontrado</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedPlanos.map((plano) => {
                                    const horimetroAtual = plano.veiculo.horimetroAtual
                                    const proximaRevisao = plano.ultimoHorimetro + plano.intervalo
                                    const falta = proximaRevisao - horimetroAtual

                                    const isAtrasado = plano.status === 'ATRASADO' || falta < 0
                                    const isAtencao = plano.status === 'ATENCAO' || (falta < 50 && falta >= 0)

                                    let statusColor = 'text-emerald-500'
                                    let statusBg = 'bg-emerald-500/10'
                                    let statusText = 'NO PRAZO'

                                    if (isAtrasado) {
                                        statusColor = 'text-red-500'
                                        statusBg = 'bg-red-500/10'
                                        statusText = 'ATRASADO'
                                    } else if (isAtencao) {
                                        statusColor = 'text-amber-500'
                                        statusBg = 'bg-amber-500/10'
                                        statusText = 'ATENÇÃO'
                                    }

                                    const unidade = plano.veiculo.tipoVeiculo === 'LEVE' ? 'km' : 'h'

                                    return (
                                        <tr key={plano.id} className="hover:bg-surface-highlight transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-foreground uppercase tracking-tight">
                                                    {plano.veiculo.placa || plano.veiculo.codigoInterno}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {plano.veiculo.modelo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                                    {plano.veiculo.tipoVeiculo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                    {plano.veiculo.moduloSistema || plano.modulo || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-tight">
                                                    {plano.ultimoHorimetro}{unidade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/dashboard/pcm/preventivas/${plano.id}/editar`}
                                                    className="flex items-center gap-1.5 text-primary hover:text-blue-600 transition-all font-black group/value"
                                                >
                                                    <span className="text-sm tracking-tight border-b border-primary/20 group-hover/value:border-primary">
                                                        {horimetroAtual}{unidade}
                                                    </span>
                                                    <Edit className="w-3 h-3 opacity-30 group-hover/value:opacity-100" />
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-tight">
                                                    {proximaRevisao}{unidade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-black tracking-tight ${falta < 0 ? 'text-red-500' : 'text-foreground'}`}>
                                                    {falta}{unidade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-bold text-gray-500">
                                                {plano.dataAtualizacao ? (() => {
                                                    const d = new Date(plano.dataAtualizacao);
                                                    return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), 'dd/MM/yyyy', { locale: ptBR });
                                                })() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block text-[9px] font-black px-3 py-1 rounded-lg border border-current/20 ${statusBg} ${statusColor} tracking-widest shadow-sm`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link
                                                        href={`/dashboard/pcm/preventivas/${plano.id}/editar`}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all font-black text-[10px] uppercase tracking-wider shadow-sm"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Deseja realmente excluir esta preventiva?')) {
                                                                await deletePreventiva(plano.id)
                                                            }
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all font-black text-[10px] uppercase tracking-wider shadow-sm"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Pequenas variações podem ocorrer devido ao atraso na sincronia dos dados
                </p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-surface-highlight px-3 py-1 rounded-full">
                    Total de {filteredAndSortedPlanos.length} planos listados
                </p>
            </div>
        </div>
    )
}

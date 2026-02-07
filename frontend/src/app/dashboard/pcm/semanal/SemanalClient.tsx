'use client'

import { useState, useEffect } from 'react'
import { updateSemanaPreventiva } from '@/app/actions/pcm-actions'
import { Truck, AlertCircle, CalendarClock, ChevronRight, GripVertical, CheckCircle2, X, LayoutDashboard } from 'lucide-react'
import SemanalDashboard from './SemanalDashboard'

// --- Types ---
export interface Veiculo {
    id: string
    codigoInterno: string
    placa: string | null
    modelo: string
    tipoVeiculo: string
    semanaPreventiva: number | null
    status: string
    // New fields
    programacaoStatus?: string
    programacaoProgresso?: number
    programacaoModulo?: string
    programacaoDescricao?: string
    programacaoDataInicio?: string
    programacaoDataFim?: string
}

interface ProgrammingDetails {
    status: string
    progresso: number
    modulo: string
    descricao: string
    dataInicio: string
    dataFim: string
}

const DEFAULT_DETAILS: ProgrammingDetails = {
    status: 'PENDENTE',
    progresso: 0,
    modulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: ''
}

export default function SemanalClient({ initialData }: { initialData: Veiculo[] }) {
    const [veiculos, setVeiculos] = useState<Veiculo[]>(initialData)
    const [draggedVeiculo, setDraggedVeiculo] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<string>('TODOS')
    const [view, setView] = useState<'BOARD' | 'DASHBOARD'>('BOARD')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [pendingDrop, setPendingDrop] = useState<{ veiculoId: string, week: number } | null>(null)
    const [details, setDetails] = useState<ProgrammingDetails>(DEFAULT_DETAILS)

    // Auto-calculate progress
    useEffect(() => {
        if (details.status === 'PENDENTE' || details.status === 'CANCELADO') {
            setDetails(prev => ({ ...prev, progresso: 0 }))
        } else if (details.status === 'CONCLUIDO') {
            setDetails(prev => ({ ...prev, progresso: 100 }))
        } else if (details.status === 'EM_ANDAMENTO') {
            // Optional: Time-based calculation for fun/tech-demo, but keep it clear
            if (details.dataInicio && details.dataFim) {
                const start = new Date(details.dataInicio).getTime()
                const end = new Date(details.dataFim).getTime()
                const now = new Date().getTime()
                const total = end - start

                if (total > 0) {
                    const elapsed = now - start
                    let p = Math.round((elapsed / total) * 100)
                    if (p < 0) p = 0
                    if (p > 95) p = 95 // Cap at 95 until marked done
                    setDetails(prev => ({ ...prev, progresso: p }))
                } else {
                    // Default if dates invalid/same
                    setDetails(prev => ({ ...prev, progresso: 50 }))
                }
            } else {
                setDetails(prev => ({ ...prev, progresso: 50 }))
            }
        }
    }, [details.status, details.dataInicio, details.dataFim])

    const handleDragStart = (e: React.DragEvent, veiculoId: string) => {
        e.dataTransfer.setData('veiculoId', veiculoId)
        setDraggedVeiculo(veiculoId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, targetWeek: number | null) => {
        e.preventDefault()
        const veiculoId = e.dataTransfer.getData('veiculoId')

        if (!veiculoId || loadingId) return

        const currentVeiculo = veiculos.find(v => v.id === veiculoId)
        if (currentVeiculo?.semanaPreventiva === targetWeek) return

        // If dropping into "Sem Programação" (null), execute immediately without info
        if (targetWeek === null) {
            executeMove(veiculoId, null, undefined)
            return
        }

        // If dropping into a week, open modal to get details
        setPendingDrop({ veiculoId, week: targetWeek })

        // Pre-fill existing data if available, or defaults
        setDetails({
            status: currentVeiculo?.programacaoStatus || 'PENDENTE',
            progresso: currentVeiculo?.programacaoProgresso || 0,
            modulo: currentVeiculo?.programacaoModulo || '',
            descricao: currentVeiculo?.programacaoDescricao || '',
            dataInicio: currentVeiculo?.programacaoDataInicio ? new Date(currentVeiculo.programacaoDataInicio).toISOString().split('T')[0] : '',
            dataFim: currentVeiculo?.programacaoDataFim ? new Date(currentVeiculo.programacaoDataFim).toISOString().split('T')[0] : ''
        })

        setIsModalOpen(true)
    }

    const confirmProgramming = async () => {
        if (!pendingDrop) return

        await executeMove(pendingDrop.veiculoId, pendingDrop.week, details)
        setIsModalOpen(false)
        setPendingDrop(null)
    }

    const executeMove = async (veiculoId: string, targetWeek: number | null, extraDetails?: ProgrammingDetails) => {
        const currentVeiculo = veiculos.find(v => v.id === veiculoId)

        // Optimistic update
        setVeiculos(prev => prev.map(v =>
            v.id === veiculoId ? {
                ...v,
                semanaPreventiva: targetWeek,
                ...(extraDetails ? {
                    programacaoStatus: extraDetails.status,
                    programacaoProgresso: extraDetails.progresso,
                    programacaoModulo: extraDetails.modulo,
                    programacaoDescricao: extraDetails.descricao,
                    programacaoDataInicio: extraDetails.dataInicio, // Simple string storage for optimistic
                    programacaoDataFim: extraDetails.dataFim
                } : {})
            } : v
        ))
        setLoadingId(veiculoId)

        try {
            const result = await updateSemanaPreventiva(veiculoId, targetWeek, extraDetails)
            if (!result.success) {
                // Revert
                setVeiculos(prev => prev.map(v =>
                    v.id === veiculoId ? {
                        ...v,
                        semanaPreventiva: currentVeiculo?.semanaPreventiva ?? null,
                        programacaoStatus: currentVeiculo?.programacaoStatus,
                        programacaoProgresso: currentVeiculo?.programacaoProgresso
                        // ... revert others if needed strictly
                    } : v
                ))
            }
        } catch (error) {
            console.error('Failed to update week', error)
        } finally {
            setLoadingId(null)
            setDraggedVeiculo(null)
        }
    }

    const getColumnVehicles = (week: number | null) => {
        return veiculos
            .filter(v => v.semanaPreventiva === week)
            .filter(v => filter === 'TODOS' || v.tipoVeiculo === filter)
    }

    const weeks = [
        { id: 1, label: 'Semana 1', color: 'border-l-blue-500', bg: 'bg-blue-500/5' },
        { id: 2, label: 'Semana 2', color: 'border-l-emerald-500', bg: 'bg-emerald-500/5' },
        { id: 3, label: 'Semana 3', color: 'border-l-orange-500', bg: 'bg-orange-500/5' },
        { id: 4, label: 'Semana 4', color: 'border-l-purple-500', bg: 'bg-purple-500/5' },
    ]

    if (view === 'DASHBOARD') {
        return <SemanalDashboard veiculos={veiculos} onBack={() => setView('BOARD')} />
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <CalendarClock className="w-6 h-6 text-primary" />
                        Programação Semanal
                    </h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Distribuição da Frota por Ciclo
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-purple-500/20 transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>

                    <div className="flex bg-surface-highlight rounded-lg p-1 border border-border-color">
                        {['TODOS', 'LEVE', 'PESADO'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`
                                    px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all
                                    ${filter === type ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-foreground hover:bg-surface'}
                                `}
                            >
                                {type === 'TODOS' ? 'Todos' : type}
                            </button>
                        ))}
                    </div>
                    <div className="bg-surface border border-border-color px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-500">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        Arraste para programar
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 grid grid-cols-5 gap-4 min-h-0 overflow-hidden">
                {/* Unscheduled Column */}
                <div
                    className="bg-surface border border-border-color rounded-2xl flex flex-col h-full overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, null)}
                >
                    <div className="p-4 border-b border-border-color bg-surface-highlight/20 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Sem Programação</span>
                            <span className="bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-black">
                                {getColumnVehicles(null).length}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {getColumnVehicles(null).map(veiculo => (
                            <VehicleCard
                                key={veiculo.id}
                                veiculo={veiculo}
                                onDragStart={handleDragStart}
                                isLoading={loadingId === veiculo.id}
                            />
                        ))}
                        {getColumnVehicles(null).length === 0 && (
                            <div className="h-20 flex items-center justify-center text-gray-400 text-xs font-bold italic opacity-50 border-2 border-dashed border-border-color rounded-xl">
                                Vazio
                            </div>
                        )}
                    </div>
                </div>

                {/* Weeks Columns */}
                {weeks.map(week => (
                    <div
                        key={week.id}
                        className={`bg-surface border border-border-color rounded-2xl flex flex-col h-full overflow-hidden ${draggedVeiculo ? 'border-dashed border-primary/30' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, week.id)}
                    >
                        <div className={`p-4 border-b border-border-color ${week.bg} sticky top-0 z-10 backdrop-blur-sm`}>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-foreground">{week.label}</span>
                                <span className="bg-surface text-foreground px-2 py-0.5 rounded-md text-[10px] font-black shadow-sm">
                                    {getColumnVehicles(week.id).length}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2 relative">
                            {/* Guide Lines */}
                            <div className={`absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]`} />

                            {getColumnVehicles(week.id).map(veiculo => (
                                <VehicleCard
                                    key={veiculo.id}
                                    veiculo={veiculo}
                                    onDragStart={handleDragStart}
                                    weekId={week.id}
                                    isLoading={loadingId === veiculo.id}
                                />
                            ))}
                            {getColumnVehicles(week.id).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs font-bold opacity-30">
                                    <span className="text-2xl mb-2">📅</span>
                                    <span>Arraste aqui</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Programming Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-border-color w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                            <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Detalhes da Programação
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Status</label>
                                    <select
                                        value={details.status}
                                        onChange={e => setDetails(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                        <option value="CONCLUIDO">Concluído</option>
                                        <option value="CANCELADO">Cancelado</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Progresso (%)</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        readOnly
                                        value={details.progresso}
                                        className="w-full bg-surface border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none text-gray-500 cursor-not-allowed"
                                        title="Calculado automaticamente pelo status e datas"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Módulo / Setor</label>
                                <input
                                    value={details.modulo}
                                    placeholder="Ex: MÓDULO 05"
                                    onChange={e => setDetails(prev => ({ ...prev, modulo: e.target.value }))}
                                    className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Descrição do Serviço (MPBT)</label>
                                <textarea
                                    value={details.descricao}
                                    placeholder="Ex: PLANO DE MANUTENÇÃO (REVISÃO DE 10000 HORAS)"
                                    onChange={e => setDetails(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="w-full h-20 bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Início</label>
                                    <input
                                        type="date"
                                        value={details.dataInicio}
                                        onChange={e => setDetails(prev => ({ ...prev, dataInicio: e.target.value }))}
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Término</label>
                                    <input
                                        type="date"
                                        value={details.dataFim}
                                        onChange={e => setDetails(prev => ({ ...prev, dataFim: e.target.value }))}
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-surface-highlight/5">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmProgramming}
                                className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-orange-600 transition-colors"
                            >
                                Salvar Programação
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function VehicleCard({ veiculo, onDragStart, weekId, isLoading }: { veiculo: Veiculo, onDragStart: (e: React.DragEvent, id: string) => void, weekId?: number, isLoading?: boolean }) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, veiculo.id)}
            className={`
                bg-surface-highlight border border-border-color p-3 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group relative overflow-hidden
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}
                ${veiculo.status === 'EM_MANUTENCAO' ? 'border-l-4 border-l-red-500' :
                    veiculo.status === 'EM_OPERACAO' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-gray-300'}
            `}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {veiculo.codigoInterno}
                </span>
                {veiculo.status === 'EM_MANUTENCAO' && (
                    <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <h4 className="text-sm font-bold text-foreground truncate">{veiculo.placa || 'Sem Placa'}</h4>
            </div>

            <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] text-gray-500 font-medium truncate max-w-[80px]" title={veiculo.modelo}>
                    {veiculo.modelo}
                </span>
                <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Programming Badges */}
            {weekId !== undefined && veiculo.programacaoDescricao && (
                <div className="mt-2 pt-2 border-t border-border-color/50 space-y-1">
                    <p className="text-[9px] font-bold text-foreground line-clamp-2 leading-tight">
                        {veiculo.programacaoDescricao}
                    </p>
                    <div className="flex items-center justify-between text-[8px] uppercase font-black text-gray-400">
                        <span>{veiculo.programacaoDataInicio ? new Date(veiculo.programacaoDataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}</span>
                        <span className={`
                             px-1.5 py-0.5 rounded
                             ${veiculo.programacaoStatus === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-500' :
                                veiculo.programacaoStatus === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}
                         `}>
                            {veiculo.programacaoStatus?.substring(0, 3)}
                        </span>
                    </div>
                    {veiculo.programacaoProgresso !== undefined && veiculo.programacaoProgresso > 0 && (
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${veiculo.programacaoProgresso}%` }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

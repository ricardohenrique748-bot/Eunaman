'use client'

import { useState, useMemo } from 'react'
import { Plus, History, Clock, LogIn, LogOut, Search, Filter, Calendar, Car } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format, isSameDay, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Usuario {
    nome: string;
}

interface Veiculo {
    codigoInterno: string;
    placa?: string | null;
    modelo?: string;
}

interface ChecklistResponse {
    id: string;
    dataResposta: string | Date;
    tipo?: 'ENTRADA' | 'SAIDA' | string;
    veiculo: Veiculo;
    usuario: Usuario;
    [key: string]: unknown;
}

interface ChecklistForm {
    nome: string;
    respostas?: ChecklistResponse[];
}

interface FlattenedResponse extends ChecklistResponse {
    formularioNome: string;
}

export default function ChecklistDashboard({ forms }: { forms: ChecklistForm[] }) {
    const pathname = usePathname()
    const isStandalone = pathname?.startsWith('/checklist-app')
    const novoPath = isStandalone ? '/checklist-app/novo' : '/dashboard/pcm/checklist/novo'

    // Estados de Filtro
    const [filtroVeiculo, setFiltroVeiculo] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('TODOS')
    const [filtroPeriodo, setFiltroPeriodo] = useState('TODOS') // TODOS, HOJE, 7DIAS, 30DIAS

    // Flatten e Ordenação inicial
    const allResponses = useMemo(() => {
        return (forms || []).flatMap(f => (f.respostas || []).map((r: ChecklistResponse) => ({
            ...r,
            formularioNome: f.nome
        }))).sort((a: FlattenedResponse, b: FlattenedResponse) => new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime())
    }, [forms])

    // Filtragem de Histórico
    const history = useMemo(() => {
        return allResponses.filter((item: FlattenedResponse) => {
            const matchesVeiculo = item.veiculo.codigoInterno.toLowerCase().includes(filtroVeiculo.toLowerCase())
            const matchesTipo = filtroTipo === 'TODOS' || item.tipo === filtroTipo
            
            let matchesData = true
            const dataItem = new Date(item.dataResposta)
            const hoje = new Date()
            
            if (filtroPeriodo === 'HOJE') {
                matchesData = isSameDay(dataItem, hoje)
            } else if (filtroPeriodo === '7DIAS') {
                matchesData = isWithinInterval(dataItem, { 
                    start: startOfDay(subDays(hoje, 7)), 
                    end: endOfDay(hoje) 
                })
            } else if (filtroPeriodo === '30DIAS') {
                matchesData = isWithinInterval(dataItem, { 
                    start: startOfDay(subDays(hoje, 30)), 
                    end: endOfDay(hoje) 
                })
            }

            return matchesVeiculo && matchesTipo && matchesData
        })
    }, [allResponses, filtroVeiculo, filtroTipo, filtroPeriodo])

    // Estatísticas Baseadas no Filtro
    const stats = useMemo(() => {
        const total = history.length
        const totalEntrada = history.filter(h => h.tipo === 'ENTRADA' || !h.tipo).length
        const totalSaida = history.filter(h => h.tipo === 'SAIDA').length
        
        return { total, totalEntrada, totalSaida }
    }, [history])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl">Checklist</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-sm mt-0.5">Gerencie inspeções e frota.</p>
                </div>
                {!isStandalone && (
                  <Link
                      href={novoPath}
                      className="w-full sm:w-auto bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10"
                  >
                      <Plus className="w-4 h-4 stroke-[3px]" />
                      Novo Checklist
                  </Link>
                )}
            </div>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="dashboard-card p-4 bg-surface border-border-color/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Filtrado</p>
                    <p className="text-2xl font-black text-foreground">{stats.total}</p>
                </div>
                <div className="dashboard-card p-4 bg-emerald-500/5 border-emerald-500/10">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Entradas</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.totalEntrada}</p>
                </div>
                <div className="dashboard-card p-4 bg-amber-500/5 border-amber-500/10">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Saídas</p>
                    <p className="text-2xl font-black text-amber-600">{stats.totalSaida}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-surface border border-border-color rounded-3xl p-6 shadow-xl shadow-black/5 animate-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 ml-1">
                            <Car className="w-3 h-3" />
                            Buscar Veículo
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Placa ou Código..."
                                value={filtroVeiculo}
                                onChange={(e) => setFiltroVeiculo(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-surface-highlight border border-border-color/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 ml-1">
                            <Filter className="w-3 h-3" />
                            Tipo
                        </label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-highlight border border-border-color/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="TODOS">Todas</option>
                            <option value="ENTRADA">Entrada</option>
                            <option value="SAIDA">Saída</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 ml-1">
                            <Calendar className="w-3 h-3" />
                            Período
                        </label>
                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-highlight border border-border-color/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="TODOS">Sempre</option>
                            <option value="HOJE">Hoje</option>
                            <option value="7DIAS">Últimos 7 dias</option>
                            <option value="30DIAS">Últimos 30 dias</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pb-1">
                        {(filtroVeiculo || filtroTipo !== 'TODOS' || filtroPeriodo !== 'TODOS') && (
                            <button 
                                onClick={() => {
                                    setFiltroVeiculo('')
                                    setFiltroTipo('TODOS')
                                    setFiltroPeriodo('TODOS')
                                }}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-colors whitespace-nowrap"
                            >
                                Limpar
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                            <Filter className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Histórico Recente</h2>
                </div>

                {history.length === 0 ? (
                    <div className="dashboard-card p-12 text-center border-dashed border-2">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">Nenhum checklist realizado recentemente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map((item: FlattenedResponse) => (
                            <div key={item.id} className="dashboard-card p-5 hover:border-primary/30 transition-all group overflow-hidden relative">
                                {/* Decorative indicator for entry/exit */}
                                <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rotate-45 opacity-5 ${item.tipo === 'SAIDA' ? 'bg-amber-500' : 'bg-primary'}`} />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.tipo === 'SAIDA' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                            {item.tipo === 'SAIDA' ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.tipo || 'ENTRADA'}</div>
                                            <div className="text-sm font-black text-foreground truncate max-w-[150px]">{item.veiculo.codigoInterno}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-500">{format(new Date(item.dataResposta), 'dd/MM/yyyy', { locale: ptBR })}</div>
                                        <div className="text-[10px] font-medium text-gray-400">{format(new Date(item.dataResposta), 'HH:mm', { locale: ptBR })}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                                        {item.formularioNome}
                                    </div>

                                    <div className="pt-3 border-t border-border-color/30 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-surface-highlight flex items-center justify-center text-[10px] font-black text-gray-500 border border-border-color overflow-hidden">
                                                {item.usuario.nome.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase truncate max-w-[100px]">{item.usuario.nome}</span>
                                        </div>

                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                                            Detalhes <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}


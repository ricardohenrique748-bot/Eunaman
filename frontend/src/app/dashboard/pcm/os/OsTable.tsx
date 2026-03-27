'use client'

import { useState } from 'react'
import { Plus, Filter, Search, MoreHorizontal, Calendar, Wrench, AlertCircle, CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { OrdemServico, Veiculo } from '@prisma/client'
import OsRowActions from '@/app/dashboard/pcm/os/OsRowActions'
import { deleteMultipleOrdensServico } from '@/app/actions/pcm-actions'
import { toast } from 'sonner'

type OrdemServicoComVeiculo = OrdemServico & { veiculo: Veiculo }

interface OsTableProps {
    ordens: OrdemServicoComVeiculo[]
}

export default function OsTable({ ordens }: OsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const toggleSelectAll = () => {
        if (selectedIds.length === ordens.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(ordens.map(os => os.id))
        }
    }

    const toggleSelectRow = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleMassDelete = async () => {
        if (selectedIds.length === 0) return

        if (!confirm(`Deseja realmente excluir as ${selectedIds.length} Ordens de Serviço selecionadas?`)) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteMultipleOrdensServico(selectedIds)
            if (result.success) {
                toast.success(`${selectedIds.length} O.S. excluídas com sucesso`)
                setSelectedIds([])
            } else {
                toast.error(result.error || 'Erro ao excluir O.S.')
            }
        } catch (error) {
            toast.error('Erro de conexão ao excluir O.S.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-surface border border-border-color rounded-3xl overflow-hidden shadow-sm relative group/table transition-all duration-500 hover:shadow-xl hover:shadow-black/5">
            {/* Mass Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-20 h-16 bg-surface-highlight flex items-center justify-between px-8 animate-in slide-in-from-top duration-300 border-b border-border-color">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                            {selectedIds.length} O.S. Selecionadas
                        </span>
                        <div className="h-4 w-[1px] bg-border-color mx-2" />
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="text-[10px] font-bold text-gray-500 hover:text-foreground transition-colors uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                    </div>
                    <button
                        onClick={handleMassDelete}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Excluir Selecionadas
                    </button>
                </div>
            )}

            <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-color">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface-secondary/30">
                            <th className="px-8 py-5 border-b border-border-color w-10">
                                <div className="flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-border-color bg-surface text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                                        checked={ordens.length > 0 && selectedIds.length === ordens.length}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">O.S. / Veículo</span>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tipo</span>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Descrição</span>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Abertura</span>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</span>
                            </th>
                            <th className="px-8 py-5 border-b border-border-color text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                        {ordens.length > 0 ? (
                            ordens.map((os) => (
                                <tr 
                                    key={os.id} 
                                    className={`group hover:bg-surface-highlight/50 transition-all duration-300 ${selectedIds.includes(os.id) ? 'bg-primary/5' : ''}`}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-border-color bg-surface text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                                                checked={selectedIds.includes(os.id)}
                                                onChange={() => toggleSelectRow(os.id)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-surface-highlight flex items-center justify-center border border-border-color shadow-sm group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Wrench className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground text-[11px] tracking-widest mb-0.5">#{os.numeroOS.toString().padStart(5, '0')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-primary transition-colors cursor-default uppercase">
                                                        {os.veiculo.modelo}
                                                    </span>
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-surface-secondary text-gray-500 font-bold border border-border-color">
                                                        {os.veiculo.placa}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <BadgeTipo tipo={os.tipoOS} />
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity" title={os.descricao}>
                                            &ldquo;{os.descricao}&rdquo;
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-foreground text-[10px] tracking-widest mb-0.5">
                                                {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(os.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <BadgeStatus status={os.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <OsRowActions
                                            osId={os.id}
                                            osNumero={os.numeroOS.toString().padStart(5, '0')}
                                            status={os.status}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center justify-center bg-surface-highlight/5 rounded-3xl p-12 border-2 border-dashed border-border-color max-w-md mx-auto">
                                        <div className="w-20 h-20 rounded-full bg-surface-highlight flex items-center justify-center mb-6 shadow-inner relative">
                                            <Wrench className="w-8 h-8 text-gray-400 opacity-20" />
                                            <Search className="w-5 h-5 text-primary absolute -bottom-1 -right-1" />
                                        </div>
                                        <h3 className="text-lg font-black text-foreground mb-2">Histórico não Localizado</h3>
                                        <p className="text-xs text-gray-500 mb-8 max-w-xs mx-auto font-medium">Nenhuma Ordem de Serviço corresponde aos filtros aplicados. Tente ajustar sua busca.</p>
                                        <Link href="/dashboard/pcm/os">
                                            <button className="text-primary font-black text-[10px] hover:underline uppercase tracking-widest bg-primary/10 px-6 py-2.5 rounded-xl border border-primary/20 transition-all hover:bg-primary/20">
                                                Limpar Filtros
                                            </button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function BadgeTipo({ tipo }: { tipo: string }) {
    const styles: Record<string, string> = {
        PREVENTIVA: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        CORRETIVA: 'bg-red-500/10 text-red-500 border-red-500/20',
        INSPECAO: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        MELHORIA: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    const safeStyle = styles[tipo] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'

    return (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${safeStyle}`}>
            {tipo}
        </span>
    )
}

function BadgeStatus({ status }: { status: string }) {
    const styles: Record<string, { bg: string, text: string, dot: string }> = {
        ABERTA: { bg: 'bg-gray-500/5', text: 'text-gray-500', dot: 'bg-gray-500' },
        PLANEJADA: { bg: 'bg-yellow-500/5', text: 'text-yellow-500', dot: 'bg-yellow-500' },
        EM_EXECUCAO: { bg: 'bg-orange-500/5', text: 'text-orange-500', dot: 'bg-orange-500 animate-pulse' },
        CONCLUIDA: { bg: 'bg-emerald-500/5', text: 'text-emerald-500', dot: 'bg-emerald-500' },
        CANCELADA: { bg: 'bg-red-500/5', text: 'text-red-500', dot: 'bg-red-500' },
    }
    const config = styles[status] || styles.ABERTA

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-current/10 ${config.bg} ${config.text}`}>
            {status === 'CONCLUIDA' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : status === 'CANCELADA' ? (
                <AlertCircle className="w-3.5 h-3.5" />
            ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{status.replace('_', ' ')}</span>
        </div>
    )
}


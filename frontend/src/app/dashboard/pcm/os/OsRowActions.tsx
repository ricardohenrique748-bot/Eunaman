'use client'

import { 
    Printer, 
    Pencil, 
    Trash2, 
    CheckCircle2, 
    Play, 
    XCircle, 
    ShieldCheck, 
    Wrench
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { 
    deleteOrdemServico, 
    cancelOrdemServico, 
    finishOrdemServico, 
    approveOrdemServicoPlan,
    resumeOrdemServicoExecution 
} from '@/app/actions/pcm-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface OsRowActionsProps {
    osId: string
    osNumero: string
    status: string
}

export default function OsRowActions({ osId, osNumero, status }: OsRowActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleAction = async (action: (id: string) => Promise<any>, label: string) => {
        if (isPending) return
        
        startTransition(async () => {
            const res = await action(osId)
            if (res.success) {
                toast.success(`OS #${osNumero}: ${label} com sucesso!`)
                router.refresh()
            } else {
                toast.error(res.error || `Erro ao ${label.toLowerCase()} OS`)
            }
        })
    }

    const handleDelete = async () => {
        if (!confirm(`Deseja realmente excluir permanentemente a OS #${osNumero}?`)) return
        setIsDeleting(true)
        const res = await deleteOrdemServico(osId)
        if (res.success) {
            toast.success(`OS #${osNumero} excluída.`)
            router.refresh()
        } else {
            toast.error(res.error)
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2 group/actions">
            {/* Status-specific actions */}
            {(status === 'ABERTA' || status === 'PLANEJADA') && (
                <button
                    onClick={() => handleAction(resumeOrdemServicoExecution, 'Iniciada')}
                    disabled={isPending}
                    title="Iniciar Execução"
                    className="group relative w-10 h-10 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-300 flex items-center justify-center border border-primary/20 hover:scale-110 hover:shadow-[0_0_20px_-5px_var(--primary)] disabled:opacity-50"
                >
                    <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-90" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-gray-900/90 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap">Iniciar Execução</span>
                </button>
            )}

            {status === 'PLANEJADA' && (
                <button
                    onClick={() => handleAction(approveOrdemServicoPlan, 'Plano Aprovado')}
                    disabled={isPending}
                    title="Aprovar Plano"
                    className="group relative w-10 h-10 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-emerald-500/20 hover:scale-110 hover:shadow-[0_0_20px_-5px_#10b981] disabled:opacity-50"
                >
                    <ShieldCheck className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-gray-900/90 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap">Aprovar Plano</span>
                </button>
            )}

            {status === 'EM_EXECUCAO' && (
                <button
                    onClick={() => handleAction(finishOrdemServico, 'Concluída')}
                    disabled={isPending}
                    title="Finalizar Ordem"
                    className="group relative w-10 h-10 rounded-2xl bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-blue-500/20 hover:scale-110 hover:shadow-[0_0_20px_-5px_#3b82f6] disabled:opacity-50"
                >
                    <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110 shadow-current" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-gray-900/90 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap">Finalizar Ordem</span>
                </button>
            )}

            {(status === 'ABERTA' || status === 'PLANEJADA' || status === 'EM_EXECUCAO') && (
                <button
                    onClick={() => handleAction(cancelOrdemServico, 'Cancelada')}
                    disabled={isPending}
                    title="Cancelar O.S."
                    className="group relative w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-red-500/20 hover:scale-110 hover:shadow-[0_0_20px_-5px_#ef4444] disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-gray-900/90 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap">Cancelar OS</span>
                </button>
            )}

            <div className="w-px h-6 bg-border-color/50 mx-1" />

            {/* Standard actions */}
            <Link
                href={`/print/os/${osId}`}
                target="_blank"
                title="Imprimir O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center border border-white/5 active:scale-95"
            >
                <Printer className="w-4 h-4 opacity-70" />
            </Link>
            
            <Link
                href={`/dashboard/pcm/os/editar/${osId}`}
                title="Editar O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center border border-white/5 active:scale-95"
            >
                <Pencil className="w-4 h-4 opacity-70" />
            </Link>

            {status !== 'CONCLUIDA' && status !== 'CANCELADA' && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting || isPending}
                    title="Excluir Definitivamente"
                    className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center border border-white/5 active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}


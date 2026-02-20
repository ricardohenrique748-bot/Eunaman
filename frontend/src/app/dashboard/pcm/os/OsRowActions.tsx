'use client'

import { Printer, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { deleteOrdemServico } from '@/app/actions/pcm-actions'
import { useRouter } from 'next/navigation'

interface OsRowActionsProps {
    osId: string
    osNumero: string
}

export default function OsRowActions({ osId, osNumero }: OsRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handlePrint = () => {
        // Encontra a linha da tabela e prepara para impressão ou abre uma nova aba formatada
        // Por enquanto, vamos apenas acionar o print padrao, mas idealmente seria um layout de impressao
        alert(`Gerando relatório para OS #${osNumero}... (Layout de impressão em desenvolvimento)`)
        window.print()
    }

    const handleDelete = async () => {
        if (!confirm(`Deseja realmente excluir a OS #${osNumero}?`)) return

        setIsDeleting(true)
        const res = await deleteOrdemServico(osId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
        setIsDeleting(false)
        setIsOpen(false)
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={handlePrint}
                title="Imprimir O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-primary/10 text-gray-400 hover:text-primary transition-all flex items-center justify-center"
            >
                <Printer className="w-4 h-4" />
            </button>
            <button
                onClick={() => alert('Edição em desenvolvimento...')}
                title="Editar O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 transition-all flex items-center justify-center"
            >
                <Pencil className="w-4 h-4" />
            </button>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Excluir O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    )
}

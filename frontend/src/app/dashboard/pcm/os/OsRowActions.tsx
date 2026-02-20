'use client'

import { Printer, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { deleteOrdemServico } from '@/app/actions/pcm-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OsRowActionsProps {
    osId: string
    osNumero: string
}

export default function OsRowActions({ osId, osNumero }: OsRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

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
            <Link
                href={`/print/os/${osId}`}
                target="_blank"
                title="Imprimir O.S."
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-primary/10 text-gray-400 hover:text-primary transition-all flex items-center justify-center"
            >
                <Printer className="w-4 h-4" />
            </Link>
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

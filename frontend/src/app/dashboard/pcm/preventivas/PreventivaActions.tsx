'use client'

import { MoreVertical, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { deletePreventiva } from '@/app/actions/preventiva-actions'

export default function PreventivaActions({ id }: { id: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState({ top: 0, right: 0 })

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir esta preventiva?')) {
            setLoading(true)
            await deletePreventiva(id)
            setLoading(false)
        }
    }

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                setPosition({
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right,
                })
            }
        }

        updatePosition()

        if (isOpen) {
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        }

        return () => {
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [isOpen])

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-surface-highlight rounded-full transition-colors opacity-100"
            >
                <MoreVertical className="w-5 h-5 text-gray-400 hover:text-foreground" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="fixed w-36 bg-surface text-sm border border-border-color rounded-xl shadow-xl z-50 overflow-hidden font-black tracking-widest uppercase"
                        style={{ top: `${position.top}px`, right: `${position.right}px` }}
                    >
                        <Link href={`/dashboard/pcm/preventivas/${id}/editar`} className="w-full text-left px-4 py-3 hover:bg-surface-highlight flex items-center gap-2 text-foreground transition-colors group text-[10px]">
                            <Edit className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            Editar
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors disabled:opacity-50 group text-[10px]"
                        >
                            <Trash2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                            {loading ? '...' : 'Excluir'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import Link from 'next/link'
import ImportOsDialog from './ImportOsDialog'

export default function OsHeaderActions() {
    const [importOpen, setImportOpen] = useState(false)

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setImportOpen(true)}
                    className="bg-surface hover:bg-surface-highlight text-primary border border-primary/20 px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
                >
                    <Upload className="w-4 h-4" />
                    Importar
                </button>

                <Link href="/dashboard/pcm/os/nova">
                    <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10">
                        <Plus className="w-5 h-5 stroke-[3px]" />
                        Nova Ordem de Serviço
                    </button>
                </Link>
            </div>

            <ImportOsDialog open={importOpen} onOpenChange={setImportOpen} />
        </>
    )
}

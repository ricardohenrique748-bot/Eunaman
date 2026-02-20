'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function ChecklistDashboard({ forms }: { forms: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Checklist</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie inspeções e checklists de implementos e frota.</p>
                </div>
                <Link
                    href="/dashboard/pcm/checklist/novo"
                    className="bg-primary hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10"
                >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Preencher Checklist
                </Link>
            </div>
        </div>
    )
}

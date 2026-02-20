import { Plus, ListChecks, FileText, Truck, ChevronRight, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

export default function NovoChecklistPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-lg mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Preencher Checklist</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Escolha o tipo de equipamento para preencher o checklist.</p>
            </div>

            <div className="space-y-4">
                <Link href="/dashboard/pcm/checklist/preencher?tipo=COMBOIO" className="dashboard-card group flex items-center gap-5 p-6 hover:border-primary/40 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight border border-border-color flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/40 transition-all shadow-inner shrink-0">
                        <Truck className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">Comboio</h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Inspeção completa · 43 itens</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>

                <div className="dashboard-card flex items-center gap-5 p-6 opacity-50 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight border border-border-color flex items-center justify-center shadow-inner shrink-0">
                        <Truck className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-black text-foreground">Munck</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Em breve</p>
                    </div>
                </div>

                <div className="dashboard-card flex items-center gap-5 p-6 opacity-50 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight border border-border-color flex items-center justify-center shadow-inner shrink-0">
                        <Truck className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-black text-foreground">Pipa</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Em breve</p>
                    </div>
                </div>

                <div className="dashboard-card flex items-center gap-5 p-6 opacity-50 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight border border-border-color flex items-center justify-center shadow-inner shrink-0">
                        <Truck className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-black text-foreground">Multifuncional</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Em breve</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

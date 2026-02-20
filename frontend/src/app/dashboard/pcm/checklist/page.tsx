import { Search, Plus, ListChecks } from 'lucide-react'

export default async function ChecklistPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight text-gradient bg-clip-text">Checklist de Máquinas</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie inspeções e checklists de implementos e frota.</p>
                </div>
                <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10">
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Novo Checklist
                </button>
            </div>

            {/* Content Area - Placeholder for now */}
            <div className="dashboard-card border-none shadow-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-surface-highlight flex items-center justify-center mb-6 shadow-inner relative">
                    <ListChecks className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Módulo em Construção</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto font-medium">
                    O módulo de Checklist para Munck, Pipa, Comboio e Multifuncional está sendo preparado.
                </p>
            </div>
        </div>
    )
}

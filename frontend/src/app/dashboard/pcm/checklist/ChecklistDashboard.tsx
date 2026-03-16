'use client'

import { Plus, History, Clock, LogIn, LogOut, Search } from 'lucide-react'
import Link from 'next/link'

export default function ChecklistDashboard({ forms }: { forms: any[] }) {
    // Flatten responses from all forms into a single history list
    const history = forms.flatMap(f => f.respostas.map((r: any) => ({
        ...r,
        formularioNome: f.nome
    }))).sort((a, b) => new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime())

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

            {/* History Section */}
            <div className="space-y-4">
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
                        {history.map((item: any) => (
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
                                        <div className="text-[10px] font-bold text-gray-500">{new Date(item.dataResposta).toLocaleDateString('pt-BR')}</div>
                                        <div className="text-[10px] font-medium text-gray-400">{new Date(item.dataResposta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
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


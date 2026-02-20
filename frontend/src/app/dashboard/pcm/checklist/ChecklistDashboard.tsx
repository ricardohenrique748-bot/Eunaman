'use client'

import { useState } from 'react'
import { Plus, ListChecks, FileText, Settings, Building2, Calendar, MapPin, Truck, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ChecklistDashboard({ forms }: { forms: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight text-gradient bg-clip-text">Checklist</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie inspeções e checklists de implementos e frota.</p>
                </div>
                {forms.length > 0 && (
                    <Link href={`/dashboard/pcm/checklist/novo?formularioId=${forms[0]?.id}`} className="bg-primary hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10">
                        <Plus className="w-5 h-5 stroke-[3px]" />
                        Novo Checklist
                    </Link>
                )}
            </div>

            {forms.length === 0 ? (
                <div className="dashboard-card border-none shadow-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-surface-highlight flex items-center justify-center mb-6 shadow-inner relative">
                        <ListChecks className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">Módulo em Construção</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto font-medium">
                        O módulo de Checklist para Munck, Pipa, Comboio e Multifuncional está sendo preparado.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Botões de Acesso Rápido - Principais Tipos de Formulários */}
                    {forms.map(form => (
                        <div key={form.id} className="dashboard-card group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />

                            <div className="p-6 relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-highlight border border-border-color flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shadow-inner">
                                        <Truck className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-emerald-500/20">
                                        {form.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    {form.nome}
                                </h3>

                                <p className="text-sm text-gray-500 font-medium leading-relaxed mt-2 mb-6 flex-1">
                                    {form.descricao || 'Inspeção diária recomendada para o equipamento.'}
                                </p>

                                <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-t border-border-color/50 pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <ListChecks className="w-3.5 h-3.5" />
                                        <span>{form.itens?.length || 0} Itens</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-border-color" />
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{form.respostas?.length || 0} Respostas</span>
                                    </div>
                                </div>

                                <Link href={`/dashboard/pcm/checklist/novo?formularioId=${form.id}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-primary/20">
                                    Preencher Checklist
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

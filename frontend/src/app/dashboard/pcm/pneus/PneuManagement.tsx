'use client'

import { useState } from 'react'
import { Plus, Disc, Activity, Truck, ClipboardCheck, Calendar, AlertTriangle, LayoutDashboard, ListFilter } from 'lucide-react'
import Link from 'next/link'
import PneuDashboard from './PneuDashboard'
import BoletimActions from './BoletimActions'

export default function PneuManagement({ boletins }: { boletins: any[] }) {
    const [activeTab, setActiveTab] = useState<'lista' | 'dashboard'>('dashboard')

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Controle de Pneus</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestão de vida útil, desgaste e movimentação de pneus.</p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <Link href="/dashboard/pcm/pneus/novo" className="flex-1 lg:flex-none">
                        <button className="h-12 w-full bg-surface border border-border-color text-foreground px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-surface-highlight active:scale-95">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </Link>
                    <Link href="/dashboard/pcm/pneus/inspecao" className="flex-1 lg:flex-none">
                        <button className="h-12 w-full bg-primary hover:bg-blue-600 text-white px-8 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95">
                            <ClipboardCheck className="w-4 h-4" />
                            Nova Inspeção
                        </button>
                    </Link>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex gap-2 p-1 bg-surface-highlight border border-border-color w-fit rounded-xl">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground hover:bg-surface'}`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('lista')}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'lista' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground hover:bg-surface'}`}
                >
                    <ListFilter className="w-4 h-4" />
                    Lista de Inspeções
                </button>
            </div>

            {activeTab === 'dashboard' ? (
                <PneuDashboard boletins={boletins} />
            ) : (
                <div className="bg-surface border border-border-color rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                    {boletins.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-surface-highlight border-b border-border-color text-gray-400">
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase">Frota</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-center">Data</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-center">KM</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-center">Pneus</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-left">Estado (Sulco)</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {boletins.map((boletim) => (
                                        <tr key={boletim.id} className="hover:bg-surface-highlight/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-highlight border border-border-color flex items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                                                        <Truck className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-foreground tracking-tight">
                                                            {boletim.veiculo.placa || boletim.veiculo.codigoInterno}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                            {boletim.veiculo.modelo}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {new Date(boletim.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Activity className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {boletim.km.toLocaleString()} KM
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">
                                                    {boletim.itens.length} Pneus
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-wrap gap-2 min-w-[200px]">
                                                        {boletim.itens.slice(0, 4).map((item : any, idx : number) => (
                                                            <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold ${item.sulcoMm < 3 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-surface border-border-color text-foreground'}`}>
                                                                <span className="opacity-60">{item.posicao}:</span>
                                                                <span>{item.sulcoMm}mm</span>
                                                            </div>
                                                        ))}
                                                        {boletim.itens.length > 4 && (
                                                            <span className="text-[10px] font-bold text-gray-400 flex items-center">+{boletim.itens.length - 4} mais</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <BoletimActions id={boletim.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center bg-surface/30">
                            <div className="p-8 bg-surface-highlight rounded-full mb-8 shadow-inner relative">
                                <Disc className="w-16 h-16 text-gray-400 opacity-20 animate-[spin_10s_linear_infinite]" />
                                <Plus className="w-6 h-6 text-primary absolute bottom-6 right-6" />
                            </div>
                            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Frota sem Inspeções</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed font-medium">
                                Nenhum boletim de pneu foi registrado ainda. Comece monitorando o desgaste para otimizar seus custos.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

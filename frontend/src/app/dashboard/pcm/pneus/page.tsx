import { getPneus, getBoletins } from '@/app/actions/pneu-actions'
import { Plus, Disc, Activity, Truck, ClipboardCheck, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import BoletimActions from './BoletimActions'

export const dynamic = 'force-dynamic'

export default async function PneusPage() {
    const boletins = await getBoletins()

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Boletim de Pneus</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestão de vida útil, desgaste e movimentação de pneus.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <Link href="/dashboard/pcm/pneus/novo" className="flex-1 lg:flex-none">
                        <button className="w-full bg-surface border border-border-color text-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-surface-highlight active:scale-95">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </Link>
                    <Link href="/dashboard/pcm/pneus/inspecao" className="flex-1 lg:flex-none">
                        <button className="w-full bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95">
                            <ClipboardCheck className="w-4 h-4" />
                            Nova Inspeção
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-surface border border-border-color rounded-2xl shadow-sm overflow-hidden">
                {boletins.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-surface-highlight border-b border-border-color">
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">Frota</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">KM</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">Pneus Inspecionados</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">Medições (Sulco)</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-500 uppercase text-right">Ações</th>
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
                                                        {boletim.veiculo.modelo} ({boletim.veiculo.codigoInterno.substring(0, 3)})
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold text-foreground">
                                                    {new Date(boletim.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-blue-500" />
                                                <span className="text-xs font-bold text-foreground">
                                                    {boletim.km.toLocaleString()} KM
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">
                                                {boletim.itens.length} Pneus
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-wrap gap-2 min-w-[200px]">
                                                    {boletim.itens.slice(0, 4).map((item, idx) => (
                                                        <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold ${item.sulcoMm < 3 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-surface border-border-color text-foreground'}`}>
                                                            <span className="opacity-60">{item.posicao}:</span>
                                                            <span>{item.sulcoMm}mm</span>
                                                        </div>
                                                    ))}
                                                    {boletim.itens.length > 4 && (
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center">+{boletim.itens.length - 4} mais</span>
                                                    )}
                                                </div>
                                                {boletim.observacoes && (
                                                    <div className="text-[10px] text-orange-500 max-w-[300px] truncate flex items-center gap-1 bg-orange-500/5 px-2 py-1 rounded-md border border-orange-500/10 inline-flex w-fit">
                                                        <AlertTriangle className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{boletim.observacoes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end">
                                                <BoletimActions id={boletim.id} />
                                            </div>
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dashboard/pcm/pneus/inspecao">
                                <button className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/25 active:scale-95">
                                    Primeira Inspeção
                                </button>
                            </Link>
                            <Link href="/dashboard/pcm/pneus/novo">
                                <button className="bg-surface border border-border-color text-foreground px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-surface-highlight active:scale-95">
                                    Cadastrar Pneu
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

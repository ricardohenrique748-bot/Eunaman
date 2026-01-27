import { getPneus } from '@/app/actions/pneu-actions'
import { Plus, Disc, Activity, Truck, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

export default async function PneusPage() {
    const pneus = await getPneus()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Disc className="w-6 h-6 text-primary" />
                        Boletim de Pneus
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Controle de vida útil, sulcos e movimentações.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/pcm/pneus/inspecao">
                        <button className="bg-surface hover:bg-surface-highlight border border-border-color text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                            <ClipboardCheck className="w-4 h-4" />
                            Nova Inspeção
                        </button>
                    </Link>
                    <Link href="/dashboard/pcm/pneus/novo">
                        <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pneus.map((pneu) => (
                    <div key={pneu.id} className="bg-surface border border-border-color p-4 rounded-xl hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-lg font-bold text-foreground font-mono bg-surface-highlight px-2 py-0.5 rounded border border-border-color">{pneu.codigoPneu}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${pneu.status === 'NOVO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {pneu.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Medida:</span>
                                <span className="text-gray-700 dark:text-gray-300">{pneu.medida}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Sulco Atual:</span>
                                <span className={`font-bold ${pneu.sulcoAtualMm < 3 ? 'text-red-500' : 'text-emerald-500'}`}>{pneu.sulcoAtualMm} mm</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border-color flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                <Truck className="w-3 h-3" />
                                {pneu.veiculo ? pneu.veiculo.placa : 'Em Estoque'}
                            </div>
                            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Detalhes &rarr;</span>
                        </div>
                    </div>
                ))}
                {pneus.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-surface border border-border-color rounded-xl border-dashed">
                        <Disc className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhum pneu cadastrado.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

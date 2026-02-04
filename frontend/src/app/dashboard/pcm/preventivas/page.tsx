import { Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { getPlanosManutencao } from '@/app/actions/preventiva-actions'
import PreventivaActions from './PreventivaActions'

export const dynamic = 'force-dynamic'

export default async function PreventivasListPage() {
    const planos = await getPlanosManutencao()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Programação de Preventivas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie os planos de manutenção da frota</p>
                </div>
                <Link href="/dashboard/pcm/preventivas/nova">
                    <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Wrench className="w-4 h-4" />
                        Nova Preventiva
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {planos.length === 0 ? (
                    <div className="col-span-full bg-surface border border-border-color rounded-xl h-[40vh] flex items-center justify-center flex-col text-center">
                        <div className="p-4 bg-surface-highlight rounded-full mb-4">
                            <Wrench className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Sem Planos Cadastrados</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            Cadastre a primeira manutenção preventiva clicando no botão acima.
                        </p>
                    </div>
                ) : (
                    planos.map((plano) => {
                        const horimetroAtual = plano.veiculo.horimetroAtual
                        const proximaRevisao = plano.ultimoHorimetro + plano.intervalo
                        const horasRestantes = proximaRevisao - horimetroAtual
                        const percentual = Math.min(100, Math.max(0, ((horimetroAtual - plano.ultimoHorimetro) / plano.intervalo) * 100))

                        let statusColor = 'text-green-500'
                        let statusBg = 'bg-green-100 dark:bg-green-900/30'
                        let StatusIcon = CheckCircle2
                        let statusText = 'No Prazo'

                        if (plano.status === 'ATRASADO' || horasRestantes < 0) {
                            statusColor = 'text-red-500'
                            statusBg = 'bg-red-100 dark:bg-red-900/30'
                            StatusIcon = AlertTriangle
                            statusText = 'Atrasado'
                        } else if (plano.status === 'ATENCAO' || horasRestantes < 50) {
                            statusColor = 'text-yellow-500'
                            statusBg = 'bg-yellow-100 dark:bg-yellow-900/30'
                            StatusIcon = Clock
                            statusText = 'Atenção'
                        }

                        return (
                            <div key={plano.id} className="bg-surface border border-border-color p-5 rounded-xl shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 ${statusBg.split(' ')[0].replace('100', '300')}`}></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-bold text-foreground">{plano.veiculo.placa || plano.veiculo.codigoInterno}</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${statusBg} ${statusColor}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{plano.veiculo.modelo}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={`p-2 rounded-lg ${statusBg} ${statusColor}`}>
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <PreventivaActions id={plano.id} />
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 font-medium">Tipo</span>
                                            <span className="text-foreground font-bold">{plano.tipo}</span>
                                        </div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 font-medium">Última Revisão</span>
                                            <span className="text-foreground font-bold">{plano.ultimoHorimetro} h</span>
                                        </div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 font-medium">Atual</span>
                                            <span className="text-foreground font-bold">{horimetroAtual} h</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border-color">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-gray-500">Próxima Revisão</span>
                                            <span className={`text-sm font-bold ${statusColor}`}>
                                                {proximaRevisao} h
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${statusColor.replace('text-', 'bg-')}`}
                                                style={{ width: `${percentual}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-right mt-1 text-gray-400">
                                            {horasRestantes < 0 ? `${Math.abs(horasRestantes)}h atrasado` : `${horasRestantes}h restantes`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

import { Wrench } from 'lucide-react'
import Link from 'next/link'
import { getPlanosManutencao } from '@/app/actions/preventiva-actions'
import PreventivaListClient from './PreventivaListClient'

export const dynamic = 'force-dynamic'

export default async function PreventivasListPage() {
    const planos = await getPlanosManutencao()

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Programação de Preventivas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider opacity-70">Monitore os ciclos de manutenção e evite paradas não programadas.</p>
                </div>
                <Link href="/dashboard/pcm/preventivas/nova">
                    <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest">
                        <Wrench className="w-5 h-5 stroke-[2.5px]" />
                        Novo Plano
                    </button>
                </Link>
            </div>

            <PreventivaListClient initialPlanos={planos} />
        </div>
    )
}

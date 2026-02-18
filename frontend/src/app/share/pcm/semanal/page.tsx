import { getPublicVeiculosSemanal } from '@/app/actions/pcm-actions'
import SemanalDashboard from '@/app/dashboard/pcm/semanal/SemanalDashboard'
import { Veiculo } from '@/app/dashboard/pcm/semanal/SemanalClient'

// Force dynamic rendering to ensure fresh data and valid searchParams
export const dynamic = 'force-dynamic'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SharedSemanalPage({ searchParams }: Props) {
    const params = await searchParams
    const unidadeId = typeof params.u === 'string' ? params.u : undefined

    // Fetch data using the public action with unit filter
    // We cast it to Veiculo[] because the raw query returns any[]
    // and we know the structure matches (we updated the query).
    const data = (await getPublicVeiculosSemanal(unidadeId)) as unknown as Veiculo[]

    return (
        <div className="h-screen w-screen p-4 bg-background overflow-hidden relative">
            <div className="absolute top-4 right-4 z-50 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold uppercase backdrop-blur-md pointer-events-none">
                Modo Visitante
            </div>
            <SemanalDashboard veiculos={data} />
        </div>
    )
}

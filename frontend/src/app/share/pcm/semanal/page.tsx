import { getPublicVeiculosSemanal, getWeekDates } from '@/app/actions/pcm-actions'
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

    // Fetch data and dates
    const [data, weekDates] = await Promise.all([
        getPublicVeiculosSemanal(unidadeId),
        getWeekDates()
    ])

    const veiculos = data as unknown as Veiculo[]

    // Assume week 1 dates for the dashboard display if available
    const startDate = weekDates?.[1]?.start || new Date().toISOString()
    const endDate = weekDates?.[4]?.end || new Date().toISOString()

    return (
        <div className="h-screen w-screen p-4 bg-background overflow-hidden relative">
            <div className="absolute top-4 right-4 z-50 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold uppercase backdrop-blur-md pointer-events-none text-white">
                Modo Visitante
            </div>
            <SemanalDashboard
                veiculos={veiculos}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    )
}

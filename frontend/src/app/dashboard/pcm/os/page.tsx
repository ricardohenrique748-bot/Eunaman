import { getOrdensServico } from '@/app/actions/pcm-actions'
import { cookies } from 'next/headers'
import PCMOrdersContent from './PCMOrdersContent'

export const metadata = {
    title: 'PCM - Ordens de Serviço | Eunaman',
    description: 'Gestão de manutenção e serviços Eunaman.',
}

export default async function PCMOrdersPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams
    const cookieStore = await cookies()
    const currentUnitId = cookieStore.get('currentUnitId')?.value

    const { ordens } = await getOrdensServico({
        page: 1,
        limit: 100,
        unitId: currentUnitId,
        search: searchParams.search,
        status: searchParams.status,
        tipo: searchParams.tipo,
        placa: searchParams.placa
    })

    return <PCMOrdersContent ordens={ordens} searchParams={searchParams} />
}

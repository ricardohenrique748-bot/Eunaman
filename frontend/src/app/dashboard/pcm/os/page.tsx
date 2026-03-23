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

    const response = await getOrdensServico({
        status: searchParams.status as string,
        tipo: searchParams.tipo as string,
        q: searchParams.q as string
    })

    const ordens = 'data' in response ? (response.data || []) : []

    return <PCMOrdersContent ordens={ordens} searchParams={searchParams} />
}

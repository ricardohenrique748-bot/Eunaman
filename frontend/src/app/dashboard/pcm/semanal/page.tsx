import { getVeiculosSemanal } from '@/app/actions/pcm-actions'
import { getSession } from '@/app/actions/auth-actions'
import SemanalClient from './SemanalClient'

export const dynamic = 'force-dynamic'

export default async function SemanalPage() {
    const session = await getSession()
    const data = await getVeiculosSemanal()

    return (
        <div className="h-[85vh] p-4">
            <SemanalClient initialData={data} unidadeId={session?.unidadeId} />
        </div>
    )
}

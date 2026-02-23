import { getVeiculosSemanal } from '@/app/actions/pcm-actions'
import { getSession } from '@/app/actions/auth-actions'
import SemanalClient from './SemanalClient'

export const dynamic = 'force-dynamic'

export default async function SemanalPage() {
    const session = await getSession()

    // Default filter to current month for initial load
    const d = new Date()
    const startDate = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

    const data = await getVeiculosSemanal({ startDate, endDate })

    return (
        <div className="h-[85vh] p-4">
            <SemanalClient initialData={data} unidadeId={session?.unidadeId} />
        </div>
    )
}

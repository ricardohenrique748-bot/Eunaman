import { getBoletins } from '@/app/actions/pneu-actions'
import PneuManagement from './PneuManagement'

export const dynamic = 'force-dynamic'

export default async function PneusPage() {
    const boletins = await getBoletins()

    return <PneuManagement boletins={boletins} />
}

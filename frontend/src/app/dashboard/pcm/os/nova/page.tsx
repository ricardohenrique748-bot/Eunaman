import { getVeiculosDropdown } from '@/app/actions/pcm-actions'
import { getOsOptions } from '@/app/actions/admin-actions'
import NovaOSForm from './NovaOSForm'

export default async function NovaOSPage() {
    const [veiculos, osOptions] = await Promise.all([
        getVeiculosDropdown(),
        getOsOptions()
    ])

    return <NovaOSForm veiculos={veiculos} osOptions={osOptions} />
}

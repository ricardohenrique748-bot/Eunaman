import { getVeiculosDropdown } from '@/app/actions/pcm-actions'
import NovaOSForm from './NovaOSForm'

export default async function NovaOSPage() {
    const veiculos = await getVeiculosDropdown()
    return <NovaOSForm veiculos={veiculos} />
}

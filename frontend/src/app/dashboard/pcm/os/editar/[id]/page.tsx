import { getVeiculosDropdown, getOrdemServicoById } from '@/app/actions/pcm-actions'
import { getOsOptions } from '@/app/actions/admin-actions'
import EditarOSForm from './EditarOSForm'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditarOSPage({ params }: PageProps) {
    const { id } = await params

    const [veiculos, osOptions, osResult] = await Promise.all([
        getVeiculosDropdown(),
        getOsOptions(),
        getOrdemServicoById(id)
    ])

    if (!osResult.success || !osResult.data) {
        notFound()
    }

    // Adapt data to match OrdemServicoData interface
    const initialData = {
        ...osResult.data,
        tipoOS: osResult.data.tipoOS as string,
        status: osResult.data.status as string,
        horimetro: osResult.data.veiculo.horimetroAtual // Use vehicle's current horimeter as reference
    }

    return <EditarOSForm veiculos={veiculos} osOptions={osOptions} initialData={initialData as any} />
}

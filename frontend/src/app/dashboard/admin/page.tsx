import { getAdminVeiculos, getAdminUsuarios, getAdminEmpresas, getSystemParams, getOsOptions } from '@/app/actions/admin-actions'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const [veiculos, usuarios, empresas, systemParams, osOptions] = await Promise.all([
        getAdminVeiculos(),
        getAdminUsuarios(),
        getAdminEmpresas(),
        getSystemParams(),
        getOsOptions()
    ])

    return (
        <SettingsClient
            veiculos={veiculos}
            usuarios={usuarios}
            empresas={empresas}
            systemParams={systemParams}
            osOptions={osOptions}
        />
    )
}


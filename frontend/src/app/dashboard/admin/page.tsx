import { getAdminVeiculos, getAdminUsuarios, getAdminEmpresas, getSystemParams, getOsOptions } from '@/app/actions/admin-actions'
import { getSession } from '@/app/actions/auth-actions'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const [veiculos, usuarios, empresas, systemParams, osOptions] = await Promise.all([
        getAdminVeiculos(),
        getAdminUsuarios(),
        getAdminEmpresas(),
        getSystemParams(),
        getOsOptions()
    ])

    return (
        <SettingsClient
            // @ts-ignore
            veiculos={veiculos}
            usuarios={usuarios}
            empresas={empresas}
            systemParams={systemParams}
            osOptions={osOptions}
            userSession={session}
        />
    )
}


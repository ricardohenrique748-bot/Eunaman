import { getDashboardMetrics } from '../actions/dashboard-actions'
import DashboardClient from './DashboardClient'
import { getSession } from '../actions/auth-actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getSession()
    if (session?.perfil === 'OPERACIONAL') {
        redirect('/dashboard/pcm/checklist')
    }

    const resolvedParams = await props.searchParams
    console.log('[Page] searchParams resolvidos:', resolvedParams)

    // Robust extraction to handle strings or arrays
    const getVal = (key: string) => {
        if (!resolvedParams) return undefined
        const val = resolvedParams[key]
        return Array.isArray(val) ? val[0] : val
    }

    const filters = {
        dataInicio: getVal('dataInicio'),
        dataFim: getVal('dataFim'),
        placa: getVal('placa'),
        status: getVal('status'),
        os: getVal('os'),
        tipo: getVal('tipo')
    }

    console.log('[Page] Filtros Aplicados:', filters)

    const result = await getDashboardMetrics(filters)
    const data = result?.data

    // Fallback if data fails
    const metrics = data?.kpis || {
        totalOS: 0,
        osAbertas: 0,
        osFechadas: 0,
        disponibilidadeGlobal: '0.0',
        mttr: '0.0',
        mtbf: '0.0',
        docs: { valid: 0, attention: 0, expired: 0 }
    }
    const chartData = data?.chartData || []
    const preventiveData = data?.preventiveData || []
    const recentActivity = data?.recentActivity || []

    return <DashboardClient key={JSON.stringify(filters)} metrics={metrics} chartData={chartData} preventiveData={preventiveData} recentActivity={recentActivity} filters={filters} />
}

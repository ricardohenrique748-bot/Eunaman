'use server'

import prisma from '@/lib/prisma'
import { differenceInHours, startOfMonth, endOfMonth, min } from 'date-fns'
import { getSession } from './auth-actions'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export interface DashboardFilters {
    dataInicio?: string
    dataFim?: string
    placa?: string
    status?: string
    os?: string
    tipo?: string
}

export async function getDashboardMetrics(filters: DashboardFilters = {}) {
    noStore()
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        const now = new Date()

        // Date Range Logic
        let firstDay: Date
        let lastDay: Date

        if (filters.dataInicio) {
            firstDay = new Date(filters.dataInicio)
            // Fix timezone offset issue by treating string as local date or just ensuring hours 00:00
            // Assuming string is YYYY-MM-DD, new Date(str) might be UTC. 
            // Better to use YYYY-MM-DD + 'T00:00:00' to assume local if strict, or just use as is.
            // Let's stick to simple parsing.
            firstDay.setHours(0, 0, 0, 0)
        } else {
            // Default: First day of current month
            firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        }

        if (filters.dataFim) {
            lastDay = new Date(filters.dataFim)
            lastDay.setHours(23, 59, 59, 999)
        } else {
            // Default: Last day of current month
            lastDay = endOfMonth(now)
        }

        // If the query range ends in the future or includes the current partial month, cap avail calc at 'now'
        const referenceEnd = (lastDay > now) ? now : lastDay

        const unitWhere: any = {}
        if (session.perfil !== 'ADMIN') {
            unitWhere.unidadeId = session.unidadeId
        }

        // --- 1. Filter Construction ---

        // Base vehicle filter (placa/tipo/unidade)
        const veiculoSubWhere: any = { ...unitWhere }
        if (filters.placa) {
            veiculoSubWhere.OR = [
                { placa: { contains: filters.placa, mode: 'insensitive' } },
                { codigoInterno: { contains: filters.placa, mode: 'insensitive' } }
            ]
        }
        if (filters.tipo) {
            veiculoSubWhere.tipoVeiculo = { equals: filters.tipo }
        }

        // OS Query
        const osWhere: any = {
            dataAbertura: { gte: firstDay, lte: lastDay },
            veiculo: veiculoSubWhere
        }
        if (filters.status) osWhere.status = filters.status
        if (filters.os) osWhere.numeroOS = Number(filters.os)

        // Vehicle Query (for Chart/Availability)
        const veiculoWhere: any = {
            ...veiculoSubWhere,
            status: { not: 'DESATIVADO' }
        }

        console.log('[Dashboard] Filtros Recebidos:', filters)
        console.log('[Dashboard] OS Query:', JSON.stringify(osWhere, null, 2))
        console.log('[Dashboard] Veiculo Query:', JSON.stringify(veiculoWhere, null, 2))

        // --- 2. Database Fetching ---

        const [osList, veiculos] = await Promise.all([
            prisma.ordemServico.findMany({
                where: osWhere,
                include: { veiculo: true }
            }),
            prisma.veiculo.findMany({
                where: veiculoWhere,
                include: {
                    os: {
                        where: {
                            dataAbertura: { gte: firstDay, lte: lastDay },
                            status: { in: ['CONCLUIDA', 'EM_EXECUCAO'] }
                        }
                    }
                }
            })
        ])

        // --- 3. KPI Calculations ---

        const totalOS = osList.length
        const osAbertas = osList.filter(os => ['ABERTA', 'PLANEJADA', 'EM_EXECUCAO'].includes(os.status)).length
        const osFechadas = osList.filter(os => os.status === 'CONCLUIDA').length

        // Availability Math
        const totalHoursInPeriod = Math.max(1, differenceInHours(referenceEnd, firstDay))

        const availabilityData = veiculos.map((v: any) => {
            let totalDowntimeHours = 0

            v.os.forEach((os: any) => {
                const start = new Date(os.dataAbertura)
                const end = os.dataConclusao ? new Date(os.dataConclusao) : referenceEnd
                const actualEnd = min([end, referenceEnd])
                const hours = differenceInHours(actualEnd, start)
                if (hours > 0) totalDowntimeHours += hours
            })

            const availability = Math.max(0, ((totalHoursInPeriod - totalDowntimeHours) / totalHoursInPeriod) * 100)

            return {
                id: v.id,
                placa: v.placa || v.codigoInterno || 'N/A',
                valor: Number(availability.toFixed(1))
            }
        }).sort((a, b) => a.valor - b.valor)

        const totalAvailability = availabilityData.length > 0
            ? availabilityData.reduce((acc, curr) => acc + curr.valor, 0) / availabilityData.length
            : 100

        // MTTR
        const closedOS = osList.filter(os => os.dataConclusao)
        const totalRepairHours = closedOS.reduce((acc, os) => acc + differenceInHours(new Date(os.dataConclusao!), new Date(os.dataAbertura)), 0)
        const mttr = closedOS.length > 0 ? (totalRepairHours / closedOS.length).toFixed(1) : '0.0'

        // MTBF
        const correctiveOS = osList.filter(os => os.tipoOS === 'CORRETIVA').length
        const totalPossibleHours = totalHoursInPeriod * Math.max(1, veiculos.length)
        const mtbf = correctiveOS > 0 ? (totalPossibleHours / correctiveOS).toFixed(1) : '0.0'

        // Docs Logic
        const docs = await prisma.documentoFrota.findMany({
            where: {
                veiculo: veiculoWhere,
                dataValidade: { not: null }
            },
            select: { dataValidade: true }
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(today.getDate() + 30)

        const docStats = docs.reduce((acc, doc) => {
            if (!doc.dataValidade) return acc

            const validade = new Date(doc.dataValidade)
            validade.setHours(0, 0, 0, 0)

            if (validade < today) {
                acc.expired++
            } else if (validade <= thirtyDaysFromNow) {
                acc.attention++
            } else {
                acc.valid++
            }
            return acc
        }, { valid: 0, attention: 0, expired: 0 })

        return {
            success: true,
            data: {
                kpis: {
                    totalOS,
                    osAbertas,
                    osFechadas,
                    disponibilidadeGlobal: totalAvailability.toFixed(1),
                    mttr,
                    mtbf,
                    docs: docStats
                },
                chartData: availabilityData,
                preventiveData: await (async () => {
                    const planos = await prisma.planoManutencao.findMany({
                        where: {
                            veiculo: veiculoWhere
                        },
                        include: {
                            veiculo: {
                                select: { placa: true, codigoInterno: true, horimetroAtual: true }
                            }
                        }
                    })

                    return planos.map(p => {
                        const proximaRevisao = p.ultimoHorimetro + p.intervalo
                        const horasRestantes = proximaRevisao - p.veiculo.horimetroAtual

                        let fill = '#10B981' // Green
                        if (horasRestantes < 0) fill = '#EF4444' // Red
                        else if (horasRestantes < 50) fill = '#F59E0B' // Yellow

                        return {
                            name: `${p.veiculo.placa || p.veiculo.codigoInterno} - ${p.tipo}`,
                            value: horasRestantes,
                            originalStatus: p.status, // Database status might differ if heavy logic, but let's trust calc
                            fill,
                            placa: p.veiculo.placa || p.veiculo.codigoInterno
                        }
                    }).sort((a, b) => a.value - b.value) // Sort by urgency (lowest/negative hours first)
                })(),
                recentActivity: await prisma.ordemServico.findMany({
                    where: {
                        veiculo: {
                            unidadeId: session.perfil !== 'ADMIN' ? session.unidadeId : undefined
                        }
                    },
                    take: 5,
                    orderBy: { dataAbertura: 'desc' },
                    include: { veiculo: true }
                })
            }
        }
    } catch (e: any) {
        console.error('[Dashboard Action] Error:', e)
        return { success: false, error: 'Failed to fetch metrics: ' + e.message }
    }
}

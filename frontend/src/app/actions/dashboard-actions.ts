'use server'

import prisma from '@/lib/prisma'
import { differenceInHours, startOfMonth, endOfMonth, min, max, differenceInMinutes } from 'date-fns'
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
            veiculoSubWhere.tipoVeiculo = { equals: filters.tipo, mode: 'insensitive' }
        }

        // OS Query
        const osWhere: any = {
            dataAbertura: { lte: lastDay },
            OR: [
                { dataConclusao: null },
                { dataConclusao: { gte: firstDay } }
            ],
            veiculo: veiculoSubWhere
        }
        if (filters.status) osWhere.status = filters.status
        if (filters.os && !isNaN(Number(filters.os))) {
            osWhere.numeroOS = Number(filters.os)
        }

        // Vehicle Query (for Chart/Availability)
        const veiculoWhere: any = {
            ...veiculoSubWhere,
            status: { not: 'DESATIVADO' }
        }

        if (filters.os && !isNaN(Number(filters.os))) {
            veiculoWhere.os = {
                some: { numeroOS: Number(filters.os) }
            }
        }


        // --- 2. Database Fetching (Parallel) ---
        const [osList, veiculos, docs, preventivePlanos, recentActivity] = await Promise.all([
            prisma.ordemServico.findMany({
                where: osWhere,
                include: { veiculo: true }
            }),
            prisma.veiculo.findMany({
                where: veiculoWhere,
                include: {
                    os: {
                        where: {
                            // OS que abrem antes ou durante o período
                            dataAbertura: { lte: lastDay },
                            // E que fecham DURANTE ou DEPOIS do período (ou ainda estão abertas)
                            OR: [
                                { dataConclusao: null },
                                { dataConclusao: { gte: firstDay } }
                            ],
                            // Inclui TODOS os status que representam veículo indisponível
                            status: { in: ['ABERTA', 'PLANEJADA', 'EM_EXECUCAO', 'CONCLUIDA'] }
                        }
                    }
                }
            }),
            prisma.documentoFrota.findMany({
                where: {
                    veiculo: veiculoWhere,
                    dataValidade: { not: null }
                },
                select: { dataValidade: true }
            }),
            prisma.planoManutencao.findMany({
                where: { veiculo: veiculoWhere },
                include: {
                    veiculo: {
                        select: { placa: true, codigoInterno: true, horimetroAtual: true }
                    }
                }
            }),
            prisma.ordemServico.findMany({
                where: osWhere,
                take: 5,
                orderBy: { dataAbertura: 'desc' },
                include: { veiculo: true }
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
                // Cálculo de interseção: o tempo que a OS ficou ativa dentro do período de interesse
                const osStart = new Date(os.dataAbertura)
                const osEnd = os.dataConclusao ? new Date(os.dataConclusao) : referenceEnd

                const startCalculo = max([osStart, firstDay])
                const endCalculo = min([osEnd, referenceEnd])

                const minutes = differenceInMinutes(endCalculo, startCalculo)
                if (minutes > 0) totalDowntimeHours += (minutes / 60)
            })

            const totalHoursInPeriodMath = Math.max(1, differenceInMinutes(referenceEnd, firstDay) / 60)
            const availability = Math.max(0, ((totalHoursInPeriodMath - totalDowntimeHours) / totalHoursInPeriodMath) * 100)

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


        // Preventive Data Formatting
        const preventiveData = preventivePlanos.map(p => {
            const proximaRevisao = p.ultimoHorimetro + p.intervalo
            const horasRestantes = proximaRevisao - p.veiculo.horimetroAtual

            let fill = '#10B981' // Green
            if (horasRestantes < 0) fill = '#EF4444' // Red
            else if (horasRestantes < 50) fill = '#F59E0B' // Yellow

            return {
                name: `${p.veiculo.placa || p.veiculo.codigoInterno} - ${p.tipo}`,
                value: horasRestantes,
                originalStatus: p.status,
                fill,
                placa: p.veiculo.placa || p.veiculo.codigoInterno
            }
        }).sort((a, b) => a.value - b.value)

        const response = {
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
                preventiveData,
                recentActivity
            }
        }

        // Serializar para evitar erros de objeto Date entre Server e Client
        return JSON.parse(JSON.stringify(response))
    } catch (e: any) {
        console.error('[Dashboard Action] Error:', e)
        return { success: false, error: 'Failed to fetch metrics: ' + e.message }
    }
}

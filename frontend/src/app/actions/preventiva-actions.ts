'use server'

import { StatusPreventiva } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from './auth-actions'

export async function createPreventiva(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipo = formData.get('tipo') as string
    const modulo = formData.get('modulo') as string
    const ultimoHorimetro = Number(formData.get('ultimoHorimetro'))
    const horimetroAtual = Number(formData.get('horimetroAtual'))
    const intervalo = Number(formData.get('intervalo'))
    const dataAtualizacao = new Date(formData.get('dataAtualizacao') as string)

    if (!veiculoId || !tipo || !intervalo) {
        return { success: false, error: 'Campos obrigatórios faltando' }
    }

    try {
        // 1. Atualizar horímetro do veículo se fornecido
        if (horimetroAtual > 0) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual }
            })
        }

        // 2. Calcular Status Inicial
        // Se (Ultimo + Intervalo) < Atual -> Atrasado
        let status: StatusPreventiva = 'NO_PRAZO'
        if ((ultimoHorimetro + intervalo) < horimetroAtual) {
            status = 'ATRASADO'
        } else if ((ultimoHorimetro + intervalo) - horimetroAtual < 50) {
            status = 'ATENCAO' // Menos de 50h pra vencer
        }

        // 3. Criar Plano
        await prisma.planoManutencao.create({
            data: {
                veiculoId,
                tipo,
                modulo,
                ultimoHorimetro,
                intervalo,
                dataAtualizacao,
                status: status
            }
        })

        revalidatePath('/dashboard/pcm/preventivas')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao salvar dados' }
    }
}

export async function getVeiculosSimples() {
    const session = await getSession()
    if (!session) return []

    const where: any = { status: { not: 'DESATIVADO' } }
    if (session.perfil !== 'ADMIN') {
        where.unidadeId = session.unidadeId
    }

    return await prisma.veiculo.findMany({
        where,
        select: { id: true, modelo: true, placa: true, codigoInterno: true, horimetroAtual: true }
    })
}

export async function getPlanosManutencao() {
    const session = await getSession()
    if (!session) return []

    const where: any = {}
    if (session.perfil !== 'ADMIN') {
        where.veiculo = {
            unidadeId: session.unidadeId
        }
    }

    return await prisma.planoManutencao.findMany({
        where,
        include: {
            veiculo: {
                select: {
                    placa: true,
                    modelo: true,
                    codigoInterno: true,
                    horimetroAtual: true
                }
            }
        },
        orderBy: {
            status: 'desc'
        }
    })
}

export async function deletePreventiva(id: string) {
    try {
        await prisma.planoManutencao.delete({
            where: { id }
        })
        revalidatePath('/dashboard/pcm/preventivas')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erro ao excluir plano' }
    }
}

export async function getPreventivaById(id: string) {
    return await prisma.planoManutencao.findUnique({
        where: { id },
        include: {
            veiculo: {
                select: { horimetroAtual: true, placa: true, codigoInterno: true, modelo: true }
            }
        }
    })
}

export async function updatePreventiva(id: string, formData: FormData) {
    const tipo = formData.get('tipo') as string
    const modulo = formData.get('modulo') as string
    const ultimoHorimetro = Number(formData.get('ultimoHorimetro'))
    const intervalo = Number(formData.get('intervalo'))
    const dataAtualizacao = new Date(formData.get('dataAtualizacao') as string)
    const horimetroAtual = Number(formData.get('horimetroAtual'))
    const veiculoId = formData.get('veiculoId') as string

    try {
        // Atualiza horimetro do veiculo se necessario
        if (veiculoId && horimetroAtual > 0) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual }
            })
        }

        // Recalcula Status
        let status: StatusPreventiva = 'NO_PRAZO'
        if ((ultimoHorimetro + intervalo) < horimetroAtual) {
            status = 'ATRASADO'
        } else if ((ultimoHorimetro + intervalo) - horimetroAtual < 50) {
            status = 'ATENCAO'
        }

        await prisma.planoManutencao.update({
            where: { id },
            data: {
                tipo,
                modulo,
                ultimoHorimetro,
                intervalo,
                dataAtualizacao,
                status
            }
        })

        revalidatePath('/dashboard/pcm/preventivas')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar dados' }
    }
}

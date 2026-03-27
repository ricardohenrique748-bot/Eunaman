'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface BacklogItem {
  id: string
  semana?: string | null
  mes?: string | null
  ano?: string | null
  dataEvidencia?: Date | null
  modulo?: string | null
  regiaoProgramacao?: string | null
  diasPendenciaAberta?: number | null
  frota?: string | null
  tag?: string | null
  unidade?: string | null
  tipo?: string | null
  descricaoAtividade?: string | null
  origem?: string | null
  criticidade?: string | null
  tempoExecucaoPrevisto?: string | null
  campoBase?: string | null
  os?: string | null
  material?: string | null
  numeroRc?: string | null
  numeroOrdem?: string | null
  fornecedor?: string | null
  dataRc?: Date | null
  detalhamentoPedido?: string | null
  dataNecessidadeMaterial?: Date | null
  tipoPedido?: string | null
  previsaoMaterial?: Date | null
  situacaoRc?: string | null
  diasAberturaReqCompras?: number | null
  dataProgramacao?: Date | null
  maoDeObra?: string | null
  deltaEvidenciaProgramacao?: number | null
  statusProgramacao?: string | null
  previsaoConclusaoPendencia?: Date | null
  dataConclusaoPendencia?: Date | null
  diasResolucaoPendencia?: number | null
  status?: string | null
  observacao?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export async function getBacklogItems(params?: {
  unidade?: string
  status?: string
  search?: string
}) {
  try {
    const where: any = {}

    if (params?.unidade && params.unidade !== 'Todas') {
      where.unidade = params.unidade
    }

    if (params?.status && params.status !== 'Todos') {
      where.status = params.status
    }

    // Remover itens com origem 'CORRETIVA' conforme solicitado pelo usuário
    where.NOT = {
      origem: {
        equals: 'CORRETIVA',
        mode: Prisma.QueryMode.insensitive
      }
    }

    if (params?.search) {
      where.OR = [
        { frota: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
        { tag: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
        { descricaoAtividade: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
        { os: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      ]
    }

    const items = await prisma.backlog.findMany({
      where,
      orderBy: [
        { dataEvidencia: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return { success: true, data: items }
  } catch (error) {
    console.error('Erro ao buscar backlog:', error)
    return { success: false, data: [], error: 'Erro ao buscar backlog' }
  }
}

export async function getUnidades() {
  try {
    const unidades = await prisma.backlog.findMany({
      select: { unidade: true },
      distinct: ['unidade'],
      where: { 
        NOT: [
          { unidade: null },
          { origem: { equals: 'CORRETIVA', mode: Prisma.QueryMode.insensitive } }
        ]
      }
    })
    return unidades.map((u: any) => u.unidade as string).sort()
  } catch (error) {
    console.error('Erro ao buscar unidades:', error)
    return []
  }
}

export async function getResumoBacklog() {
  try {
    const where: Prisma.BacklogWhereInput = {
      NOT: {
        origem: { equals: 'CORRETIVA', mode: Prisma.QueryMode.insensitive }
      }
    }

    const resumo = await prisma.backlog.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    })

    const total = await prisma.backlog.count({ where })

    const formattedResumo = {
      total,
      concluidos: resumo.find((r: any) => r.status?.toUpperCase() === 'CONCLUÍDO' || r.status?.toUpperCase() === 'CONCLUIDO')?._count.status || 0,
      pendentes: resumo.find((r: any) => r.status?.toUpperCase() === 'PENDENTE')?._count.status || 0,
      emAndamento: resumo.find((r: any) => r.status?.toUpperCase() === 'EM ANDAMENTO' || r.status?.toUpperCase() === 'EM_ANDAMENTO')?._count.status || 0,
      aguardandoMaterial: resumo.find((r: any) => r.status?.toUpperCase() === 'AGUARDANDO MATERIAL')?._count.status || 0
    }

    return formattedResumo
  } catch (error) {
    console.error('Erro ao buscar resumo:', error)
    return {
      total: 0,
      concluidos: 0,
      pendentes: 0,
      emAndamento: 0,
      aguardandoMaterial: 0
    }
  }
}

export async function createBacklogItem(data: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const item = await prisma.backlog.create({
      data: {
        ...data,
        dataEvidencia: data.dataEvidencia ? new Date(data.dataEvidencia) : null,
        dataRc: data.dataRc ? new Date(data.dataRc) : null,
        dataNecessidadeMaterial: data.dataNecessidadeMaterial ? new Date(data.dataNecessidadeMaterial) : null,
        previsaoMaterial: data.previsaoMaterial ? new Date(data.previsaoMaterial) : null,
        dataProgramacao: data.dataProgramacao ? new Date(data.dataProgramacao) : null,
        previsaoConclusaoPendencia: data.previsaoConclusaoPendencia ? new Date(data.previsaoConclusaoPendencia) : null,
        dataConclusaoPendencia: data.dataConclusaoPendencia ? new Date(data.dataConclusaoPendencia) : null,
      } as any
    })

    revalidatePath('/pcm/backlog')
    return { success: true, item }
  } catch (error) {
    console.error('Erro ao criar item no backlog:', error)
    return { success: false, error: 'Erro ao criar item' }
  }
}

export async function updateBacklogItem(id: string, data: Partial<BacklogItem>) {
  try {
    const item = await prisma.backlog.update({
      where: { id },
      data: {
        ...data,
        dataEvidencia: data.dataEvidencia ? new Date(data.dataEvidencia) : null,
        dataRc: data.dataRc ? new Date(data.dataRc) : null,
        dataNecessidadeMaterial: data.dataNecessidadeMaterial ? new Date(data.dataNecessidadeMaterial) : null,
        previsaoMaterial: data.previsaoMaterial ? new Date(data.previsaoMaterial) : null,
        dataProgramacao: data.dataProgramacao ? new Date(data.dataProgramacao) : null,
        previsaoConclusaoPendencia: data.previsaoConclusaoPendencia ? new Date(data.previsaoConclusaoPendencia) : null,
        dataConclusaoPendencia: data.dataConclusaoPendencia ? new Date(data.dataConclusaoPendencia) : null,
      } as any
    })

    revalidatePath('/pcm/backlog')
    return { success: true, item }
  } catch (error) {
    console.error('Erro ao atualizar item no backlog:', error)
    return { success: false, error: 'Erro ao atualizar item' }
  }
}

export async function deleteBacklogItem(id: string) {
  try {
    await prisma.backlog.delete({
      where: { id }
    })

    revalidatePath('/pcm/backlog')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir item do backlog:', error)
    return { success: false, error: 'Erro ao excluir item' }
  }
}

export async function getBacklogByVehicle(identifiers: string[]) {
  try {
    if (!identifiers || identifiers.length === 0) {
      return { success: true, data: [] }
    }

    const orConditions: any[] = []

    for (const id of identifiers) {
      if (id) {
        orConditions.push({ frota: { contains: id, mode: 'insensitive' } })
        orConditions.push({ tag: { contains: id, mode: 'insensitive' } })
      }
    }

    if (orConditions.length === 0) {
      return { success: true, data: [] }
    }

    const items = await prisma.backlog.findMany({
      where: {
        OR: orConditions,
        NOT: {
          status: {
            in: ['CONCLUÍDO', 'CONCLUIDO', 'Concluído', 'Concluido']
          }
        }
      },
      orderBy: { dataEvidencia: 'desc' },
      take: 20
    })

    return { success: true, data: items }
  } catch (error) {
    console.error('Erro ao buscar backlog por veículo:', error)
    return { success: false, data: [], error: 'Erro ao buscar pendências do backlog' }
  }
}

export async function importBacklogItems(items: any[]) {
  try {
    const CHUNK_SIZE = 100
    const chunks = []
    
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      chunks.push(items.slice(i, i + CHUNK_SIZE))
    }

    for (const chunk of chunks) {
      const formattedChunk = chunk.map(item => ({
        semana: item.semana?.toString(),
        mes: item.mes?.toString(),
        ano: item.ano?.toString(),
        dataEvidencia: item.dataEvidencia ? new Date(item.dataEvidencia) : null,
        modulo: item.modulo?.toString(),
        regiaoProgramacao: item.regiaoProgramacao?.toString(),
        diasPendenciaAberta: item.diasPendenciaAberta ? parseInt(item.diasPendenciaAberta.toString()) : null,
        frota: item.frota?.toString(),
        tag: item.tag?.toString(),
        unidade: item.unidade?.toString(),
        tipo: item.tipo?.toString(),
        descricaoAtividade: item.descricaoAtividade?.toString(),
        origem: item.origem?.toString(),
        criticidade: item.criticidade?.toString(),
        tempoExecucaoPrevisto: item.tempoExecucaoPrevisto?.toString(),
        campoBase: item.campoBase?.toString(),
        os: item.os?.toString(),
        material: item.material?.toString(),
        numeroRc: item.numeroRc?.toString(),
        numeroOrdem: item.numeroOrdem?.toString(),
        fornecedor: item.fornecedor?.toString(),
        dataRc: item.dataRc ? new Date(item.dataRc) : null,
        detalhamentoPedido: item.detalhamentoPedido?.toString(),
        dataNecessidadeMaterial: item.dataNecessidadeMaterial ? new Date(item.dataNecessidadeMaterial) : null,
        tipoPedido: item.tipoPedido?.toString(),
        previsaoMaterial: item.previsaoMaterial ? new Date(item.previsaoMaterial) : null,
        situacaoRc: item.situacaoRc?.toString(),
        diasAberturaReqCompras: item.diasAberturaReqCompras ? parseInt(item.diasAberturaReqCompras.toString()) : null,
        dataProgramacao: item.dataProgramacao ? new Date(item.dataProgramacao) : null,
        maoDeObra: item.maoDeObra?.toString(),
        deltaEvidenciaProgramacao: item.deltaEvidenciaProgramacao ? parseInt(item.deltaEvidenciaProgramacao.toString()) : null,
        statusProgramacao: item.statusProgramacao?.toString(),
        previsaoConclusaoPendencia: item.previsaoConclusaoPendencia ? new Date(item.previsaoConclusaoPendencia) : null,
        dataConclusaoPendencia: item.dataConclusaoPendencia ? new Date(item.dataConclusaoPendencia) : null,
        diasResolucaoPendencia: item.diasResolucaoPendencia ? parseInt(item.diasResolucaoPendencia.toString()) : null,
        status: item.status?.toString(),
        observacao: item.observacao?.toString(),
      }))

      await (prisma.backlog as any).createMany({
        data: formattedChunk
      })
    }

    revalidatePath('/pcm/backlog')
    return { success: true, count: items.length }
  } catch (error) {
    console.error('Erro ao importar itens:', error)
    return { success: false, error: 'Erro ao importar dados' }
  }
}

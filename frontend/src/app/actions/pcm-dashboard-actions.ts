'use server'

import prisma from '@/lib/prisma'

export async function getPCMSummary() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalVeiculos,
      osAbertas,
      backlogPendente,
      pneusCriticos,
      checklistsHoje,
      veiculosAtivos,
      veiculosManutencao,
      osRecentes,
      ultimasInspecoes
    ] = await Promise.all([
      // Totais para os cards
      prisma.veiculo.count(),
      prisma.ordemServico.count({ where: { status: 'ABERTA' } }),
      prisma.backlog.count({ 
        where: { 
          status: 'PENDENTE',
          NOT: { origem: { equals: 'CORRETIVA', mode: 'insensitive' } }
        } 
      }),
      prisma.pneu.count({ where: { sulcoAtualMm: { lt: 4 } } }),
      prisma.checklistResposta.count({ 
        where: { 
          dataResposta: { 
            gte: today
          } 
        } 
      }),
      // Gráficos e tabelas
      prisma.veiculo.count({
        where: { 
          status: { 
            in: ['DISPONIVEL', 'EM_OPERACAO', 'PARADO'] 
          } 
        }
      }),
      prisma.veiculo.count({
        where: { status: 'EM_MANUTENCAO' }
      }),
      prisma.ordemServico.findMany({
        take: 5,
        orderBy: { dataAbertura: 'desc' },
        include: {
          veiculo: {
            select: { codigoInterno: true }
          }
        }
      }),
      prisma.boletimPneu.findMany({
        include: {
          veiculo: {
            select: { codigoInterno: true }
          }
        },
        orderBy: {
          data: 'desc'
        },
        take: 5
      })
    ])

    return {
      stats: {
        totalVeiculos,
        osAbertas,
        backlogPendente,
        pneusCriticos,
        checklistsHoje
      },
      chartData: {
        veiculosAtivos,
        veiculosManutencao
      },
      ultimasOS: osRecentes,
      ultimasInspecoes
    }
  } catch (error) {
    console.error('Error fetching PCM summary:', error)
    return null
  }
}

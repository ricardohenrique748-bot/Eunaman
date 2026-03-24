'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPneus() {
  try {
    return await prisma.pneu.findMany({
      include: {
        veiculo: true
      },
      orderBy: {
        codigoPneu: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching pneus:', error)
    return []
  }
}

export async function getPneuById(id: string) {
  try {
    return await prisma.pneu.findUnique({
      where: { id },
      include: {
        veiculo: true,
        historicoInspecao: {
          include: {
            boletim: {
              include: {
                veiculo: true
              }
            }
          },
          orderBy: {
            boletim: {
              data: 'desc'
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching pneu:', error)
    return null
  }
}

export async function createPneu(data: any) {
  try {
    const pneu = await prisma.pneu.create({
      data: {
        codigoPneu: data.codigoPneu,
        medida: data.medida,
        vida: data.vida ? parseInt(data.vida) : 1,
        status: data.status || 'ESTOQUE',
        sulcoAtualMm: data.sulcoAtualMm ? parseFloat(data.sulcoAtualMm) : 0,
        veiculoAtualId: data.veiculoAtualId || null,
        posicao: data.posicao || null
      }
    })
    revalidatePath('/dashboard/pcm/pneus')
    return { success: true, data: pneu }
  } catch (error: any) {
    console.error('Error creating pneu:', error)
    return { success: false, error: error.message }
  }
}

export async function updatePneu(id: string, data: any) {
  try {
    const pneu = await prisma.pneu.update({
      where: { id },
      data: {
        codigoPneu: data.codigoPneu,
        medida: data.medida,
        vida: data.vida ? parseInt(data.vida) : undefined,
        status: data.status,
        sulcoAtualMm: data.sulcoAtualMm ? parseFloat(data.sulcoAtualMm) : undefined,
        veiculoAtualId: data.veiculoAtualId || null,
        posicao: data.posicao || null
      }
    })
    revalidatePath('/dashboard/pcm/pneus')
    return { success: true, data: pneu }
  } catch (error: any) {
    console.error('Error updating pneu:', error)
    return { success: false, error: error.message }
  }
}

export async function deletePneu(id: string) {
  try {
    await prisma.pneu.delete({
      where: { id }
    })
    revalidatePath('/dashboard/pcm/pneus')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting pneu:', error)
    return { success: false, error: error.message }
  }
}

export async function getBoletins() {
  try {
    return await prisma.boletimPneu.findMany({
      include: {
        veiculo: true,
        itens: {
          include: {
            pneu: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      },
      take: 50
    })
  } catch (error) {
    console.error('Error fetching boletins:', error)
    return []
  }
}

export async function deleteBoletim(id: string) {
  try {
    await prisma.$transaction([
      prisma.itemBoletimPneu.deleteMany({
        where: { boletimId: id }
      }),
      prisma.boletimPneu.delete({
        where: { id }
      })
    ])
    revalidatePath('/dashboard/pcm/pneus')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting boletim:', error)
    return { success: false, error: error.message }
  }
}

export async function createBoletimPneu(data: any) {
  try {
    let veiculoId, dataBoletim, km, observacoes, itens: any[] = []

    if (data instanceof FormData) {
      veiculoId = data.get('veiculoId') as string
      dataBoletim = data.get('data') as string
      km = data.get('km') as string
      observacoes = data.get('observacoes') as string
      
      const posicoes = [
        'DE', 'DD', 'TEI', 'TEE', 'TDI', 'TDE', 'TEI1', 'TEE1', 'TDI1', 'TDE1', 'ESTEPE'
      ]
      
      itens = posicoes.map(pos => {
        const sulco = data.get(`sulco_${pos}`)
        if (sulco) {
          return {
            posicao: pos,
            sulcoMm: parseFloat(sulco as string),
            pneuId: null // TODO: Relacionar com pneu real se necessário
          }
        }
        return null
      }).filter(Boolean) as any[]
    } else {
      ({ veiculoId, data: dataBoletim, km, observacoes, itens } = data)
    }

    if (!veiculoId || !dataBoletim) {
      throw new Error('Veículo e Data são obrigatórios')
    }
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar o boletim
      const boletim = await tx.boletimPneu.create({
        data: {
          veiculoId,
          data: new Date(dataBoletim),
          km: km ? parseInt(km) : 0,
          observacoes,
          itens: {
            create: itens.map((item: any) => ({
              posicao: item.posicao,
              sulcoMm: parseFloat(item.sulcoMm),
              pneuId: item.pneuId || null
            }))
          }
        }
      })

      // 2. Atualizar o sulco_atual_mm de cada pneu (se tiver pneuId)
      for (const item of itens) {
        if (item.pneuId) {
          await tx.pneu.update({
            where: { id: item.pneuId },
            data: {
              sulcoAtualMm: parseFloat(item.sulcoMm)
            }
          })
        }
      }

      return boletim
    })

    revalidatePath('/dashboard/pcm/pneus')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error saving boletim:', error)
    return { success: false, error: error.message }
  }
}

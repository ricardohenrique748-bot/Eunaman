'use server'

import { getSession } from './auth-actions'
import { TipoOS, StatusOS } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOrdensServico(filters: { status?: string, q?: string, tipo?: string } = {}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        const where: any = {}

        // Restricted to unit if not admin
        if (session.perfil !== 'ADMIN' && session.perfil !== 'GESTOR' && session.perfil !== 'PCM') {
            where.veiculo = { unidadeId: session.unidadeId }
        }

        // Status Filter
        if (filters.status && filters.status !== 'TODAS') {
            where.status = filters.status
        }

        // Tipo OS Filter
        if (filters.tipo && filters.tipo !== 'TODOS') {
            where.tipoOS = filters.tipo as any
        }

        // Search Query
        if (filters.q) {
            where.OR = [
                { veiculo: { placa: { contains: filters.q, mode: 'insensitive' } } },
                { veiculo: { codigoInterno: { contains: filters.q, mode: 'insensitive' } } },
                { descricao: { contains: filters.q, mode: 'insensitive' } }
            ]
        }

        const os = await prisma.ordemServico.findMany({
            where,
            include: {
                veiculo: true
            },
            orderBy: {
                dataAbertura: 'desc'
            }
        })
        return { success: true, data: os }
    } catch (error: any) {
        console.error('[PCM] Error fetching OS:', error)
        return { success: false, error: 'Falha ao carregar OS' }
    }
}

export async function getOrdemServicoById(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        const os = await prisma.ordemServico.findUnique({
            where: { id },
            include: {
                veiculo: true
            }
        })

        if (!os) return { success: false, error: 'OS não encontrada' }

        return { success: true, data: os }
    } catch (error: any) {
        console.error('[PCM] Error fetching OS by ID:', error)
        return { success: false, error: 'Falha ao carregar OS' }
    }
}

export async function createOrdemServico(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipoOS = formData.get('tipoOS') as TipoOS
    const descricao = formData.get('descricao') as string
    const status = (formData.get('status') as any) || 'ABERTA'
    const dataAberturaStr = formData.get('dataAbertura') as string
    const dataConclusaoStr = formData.get('dataConclusao') as string | null

    const horimetro = Number(formData.get('horimetro')) || null
    const motivoId = formData.get('motivoId') as string || null
    const sistemaId = formData.get('sistemaId') as string || null
    const subSistemaId = formData.get('subSistemaId') as string || null

    if (!veiculoId || !descricao) {
        return { success: false, error: 'O veículo e a descrição são obrigatórios.' }
    }

    try {
        const dataAbertura = dataAberturaStr ? new Date(dataAberturaStr) : new Date()
        let dataConclusao = null;

        if (status === 'FECHADA' && dataConclusaoStr) {
            dataConclusao = new Date(dataConclusaoStr);
        }

        // Sync horimetro if provided
        if (horimetro) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual: horimetro }
            })
        }

        const os = await prisma.ordemServico.create({
            data: {
                veiculoId,
                tipoOS,
                status: status === 'FECHADA' ? 'CONCLUIDA' : (status as any),
                descricao,
                dataAbertura,
                dataConclusao,
                origem: 'MANUAL',
                motivoId,
                sistemaId,
                subSistemaId
            }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true, osId: os.id }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao criar OS:', error)
        return { success: false, error: `Falha ao registrar O.S.: ${error.message}` }
    }
}

export async function updateOrdemServico(id: string, formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipoOS = formData.get('tipoOS') as TipoOS
    const descricao = formData.get('descricao') as string
    const status = (formData.get('status') as any)
    const dataAberturaStr = formData.get('dataAbertura') as string
    const dataConclusaoStr = formData.get('dataConclusao') as string | null

    const horimetro = Number(formData.get('horimetro')) || null
    const motivoId = formData.get('motivoId') as string || null
    const sistemaId = formData.get('sistemaId') as string || null
    const subSistemaId = formData.get('subSistemaId') as string || null

    if (!veiculoId || !descricao) {
        return { success: false, error: 'O veículo e a descrição são obrigatórios.' }
    }

    try {
        const dataAbertura = dataAberturaStr ? new Date(dataAberturaStr) : new Date()
        let dataConclusao = null;

        if (status === 'FECHADA' && dataConclusaoStr) {
            dataConclusao = new Date(dataConclusaoStr);
        }

        // Sync horimetro if provided
        if (horimetro) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual: horimetro }
            })
        }

        const os = await prisma.ordemServico.update({
            where: { id },
            data: {
                veiculoId,
                tipoOS,
                status: status === 'FECHADA' ? 'CONCLUIDA' : (status as any),
                descricao,
                dataAbertura,
                dataConclusao,
                motivoId,
                sistemaId,
                subSistemaId
            }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true, osId: os.id }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao atualizar OS:', error)
        return { success: false, error: `Falha ao atualizar O.S.: ${error.message}` }
    }
}

export async function getVeiculosDropdown() {
    const session = await getSession()
    if (!session) return []

    const where: any = { status: { not: 'DESATIVADO' } }
    if (session.perfil !== 'ADMIN') {
        where.unidadeId = session.unidadeId
    }

    return await prisma.veiculo.findMany({
        select: { id: true, codigoInterno: true, modelo: true, placa: true },
        where
    })
}

export async function getVeiculosSemanal(filters?: { startDate?: string, endDate?: string }) {
    const session = await getSession()
    if (!session) return []

    // Use raw query to bypass client validation error if the schema wasn't regenerated
    let whereClause = `WHERE "status_operacional" != 'DESATIVADO'`

    if (session.perfil !== 'ADMIN' && session.perfil !== 'PCM') {
        whereClause += ` AND "unidade_id" = '${session.unidadeId}'`
    }

    let dateFilters = []
    if (filters?.startDate) {
        dateFilters.push(`"prog_data_inicio" >= '${filters.startDate}'::timestamp`)
    }
    if (filters?.endDate) {
        dateFilters.push(`"prog_data_fim" <= '${filters.endDate}'::timestamp`)
    }

    if (dateFilters.length > 0) {
        const dateClause = dateFilters.join(' AND ')
        whereClause += ` AND (${dateClause} OR "semana_preventiva" IS NULL)`
    }

    const query = `
        SELECT 
            id, 
            "codigo_interno" as "codigoInterno", 
            placa, 
            modelo, 
            "tipo_veiculo" as "tipoVeiculo", 
            "status_operacional" as status, 
            "semana_preventiva" as "semanaPreventiva",
            "modulo_sistema" as "moduloSistema",
            "prog_status" as "programacaoStatus",
            "prog_progresso" as "programacaoProgresso",
            "prog_modulo" as "programacaoModulo",
            "prog_descricao" as "programacaoDescricao",
            "prog_data_inicio" as "programacaoDataInicio",
            "prog_data_fim" as "programacaoDataFim"
        FROM "veiculos_frota" 
        ${whereClause} 
        ORDER BY "codigo_interno" ASC
    `

    try {
        const data = await prisma.$queryRawUnsafe(query)
        return data as any[]
    } catch (e) {
        console.error("Raw query failed, falling back to basic findMany (missing new field)", e)
        // Fallback: use normal prisma client but without the new field, so the page at least loads
        const where: any = { status: { not: 'DESATIVADO' } }
        if (session.perfil !== 'ADMIN' && session.perfil !== 'PCM' && session.perfil !== 'GESTOR') {
            where.unidadeId = session.unidadeId
        }

        const fallback = await prisma.veiculo.findMany({
            where,
            select: {
                id: true, codigoInterno: true, placa: true, modelo: true, tipoVeiculo: true, status: true
            },
            orderBy: { codigoInterno: 'asc' }
        })
        return fallback.map(v => ({ ...v, semanaPreventiva: null })) as any[]
    }
}

export async function updateSemanaPreventiva(
    veiculoId: string,
    semana: number | null,
    details?: {
        status?: string,
        progresso?: number,
        modulo?: string,
        descricao?: string,
        dataInicio?: string,
        dataFim?: string
    }
) {
    try {
        const valSemana = semana === null ? 'NULL' : semana

        // If details provided, update them too
        let updateFields = `"semana_preventiva" = ${valSemana}`

        if (details) {
            if (details.status !== undefined) updateFields += `, "prog_status" = '${details.status}'`
            if (details.progresso !== undefined) updateFields += `, "prog_progresso" = ${details.progresso}`
            if (details.modulo !== undefined) updateFields += `, "prog_modulo" = '${details.modulo}'`
            if (details.descricao !== undefined) updateFields += `, "prog_descricao" = '${details.descricao}'`
            if (details.dataInicio) updateFields += `, "prog_data_inicio" = '${details.dataInicio}'::timestamp`
            if (details.dataFim) updateFields += `, "prog_data_fim" = '${details.dataFim}'::timestamp`
        }

        // If removing from week (semana === null), maybe clear fields? Let's clear them for now.
        if (semana === null) {
            updateFields += `, "prog_status" = 'PENDENTE', "prog_progresso" = 0, "prog_modulo" = NULL, "prog_descricao" = NULL, "prog_data_inicio" = NULL, "prog_data_fim" = NULL`
        }

        await prisma.$executeRawUnsafe(`UPDATE "veiculos_frota" SET ${updateFields} WHERE id = '${veiculoId}'`)

        revalidatePath('/dashboard/pcm/semanal')
        revalidatePath('/share/pcm/semanal')
        return { success: true }
    } catch (error) {
        console.error('Error updating weekly schedule:', error)
        return { success: false, error: 'Failed to update schedule' }
    }
}

export async function getPublicVeiculosSemanal(unidadeId?: string, filters?: { startDate?: string, endDate?: string }) {
    // Public access - read only
    // Use raw query
    let whereClause = `WHERE "status_operacional" != 'DESATIVADO'`

    if (unidadeId) {
        whereClause += ` AND "unidade_id" = '${unidadeId}'`
    }

    let dateFilters = []
    if (filters?.startDate) {
        dateFilters.push(`"prog_data_inicio" >= '${filters.startDate}'::timestamp`)
    }
    if (filters?.endDate) {
        dateFilters.push(`"prog_data_fim" <= '${filters.endDate}'::timestamp`)
    }

    if (dateFilters.length > 0) {
        const dateClause = dateFilters.join(' AND ')
        whereClause += ` AND (${dateClause} OR "semana_preventiva" IS NULL)`
    }

    const query = `
        SELECT 
            id, 
            "codigo_interno" as "codigoInterno", 
            placa, 
            modelo, 
            "tipo_veiculo" as "tipoVeiculo", 
            "status_operacional" as status, 
            "semana_preventiva" as "semanaPreventiva",
            "modulo_sistema" as "moduloSistema",
            "prog_status" as "programacaoStatus",
            "prog_progresso" as "programacaoProgresso",
            "prog_modulo" as "programacaoModulo",
            "prog_descricao" as "programacaoDescricao",
            "prog_data_inicio" as "programacaoDataInicio",
            "prog_data_fim" as "programacaoDataFim"
        FROM "veiculos_frota" 
        ${whereClause} 
        ORDER BY "codigo_interno" ASC
    `

    try {
        const data = await prisma.$queryRawUnsafe(query)
        return data as any[]
    } catch (e) {
        console.error("Public raw query failed", e)
        return []
    }
}

export async function deleteOrdemServico(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        // Optional: Add permission check here if needed

        await prisma.ordemServico.delete({
            where: { id }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao excluir OS:', error)
        return { success: false, error: `Falha ao excluir O.S.: ${error.message}` }
    }
}

export async function deleteMultipleOrdensServico(ids: string[]) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        if (!ids || ids.length === 0) return { success: false, error: 'Nenhuma OS selecionada' }

        await prisma.ordemServico.deleteMany({
            where: {
                id: { in: ids }
            }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao excluir múltiplas OS:', error)
        return { success: false, error: `Falha ao excluir O.S. selecionadas: ${error.message}` }
    }
}
export async function updateAllVehiclesToPesado() {
    try {
        await prisma.veiculo.updateMany({
            data: { tipoVeiculo: 'PESADO' }
        })
        revalidatePath('/dashboard/admin')
        revalidatePath('/dashboard/pcm/semanal')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating all vehicles:', error)
        return { success: false, error: error.message }
    }
}

export async function getWeekDates() {
    try {
        const param = await prisma.systemParameters.findUnique({
            where: { key: 'PROGRAMACAO_SEMANAL_DATAS' }
        })
        if (!param) return null
        return JSON.parse(param.value) as Record<number, { start: string, end: string }>
    } catch (error) {
        console.error('Error fetching week dates:', error)
        return null
    }
}

export async function updateWeekDates(dates: Record<number, { start: string, end: string }>) {
    try {
        const session = await getSession()
        if (!session || (session.perfil !== 'ADMIN' && session.perfil !== 'PCM' && session.perfil !== 'GESTOR')) {
            return { success: false, error: 'Sem permissão' }
        }

        await prisma.systemParameters.upsert({
            where: { key: 'PROGRAMACAO_SEMANAL_DATAS' },
            update: { value: JSON.stringify(dates) },
            create: {
                key: 'PROGRAMACAO_SEMANAL_DATAS',
                value: JSON.stringify(dates),
                group: 'PCM',
                description: 'Datas de início e fim das 4 semanas da programação semanal'
            }
        })

        revalidatePath('/dashboard/pcm/semanal')
        revalidatePath('/share/pcm/semanal')
        return { success: true }
    } catch (error) {
        console.error('Error updating week dates:', error)
        return { success: false, error: 'Falha ao salvar datas' }
    }
}
export async function saveChecklist(data: {
    formularioId: string,
    veiculoId: string,
    tipo: string,
    dataResposta: Date,
    observacoesGerais: string,
    respostas: Array<{ itemId: string, status: string, observacao?: string, fotos?: string[] }>,
    pneus?: Record<string, string>,
    assinatura?: string,
    responsavel?: string
}) {
    try {
        const session = await getSession()
        
        // Se for público, não precisamos de sessão mas precisamos de um nome no responsavel
        if (!session && !data.responsavel) {
            return { success: false, error: 'Acesso não autorizado ou nome do responsável ausente' }
        }

        const checklistResposta = await prisma.checklistResposta.create({
            data: {
                formularioId: data.formularioId,
                veiculoId: data.veiculoId,
                usuarioId: session?.id,
                responsavel: data.responsavel || session?.nome,
                assinatura: data.assinatura,
                tipo: data.tipo,
                dataResposta: data.dataResposta,
                observacoesGerais: data.observacoesGerais,
                pneus: data.pneus || {},
                respostasItem: {
                    create: data.respostas.map(r => ({
                        itemId: r.itemId,
                        status: r.status,
                        observacao: r.observacao,
                        fotos: r.fotos || []
                    }))
                }
            }
        })

        // Gerar OS automaticamente para itens "NÃO OK"
        const itensNaoOk = data.respostas.filter(r => r.status === 'NAO_OK')
        
        if (itensNaoOk.length > 0) {
            // Buscar os textos dos itens para a descrição da OS
            const itensInfo = await prisma.checklistItem.findMany({
                where: { id: { in: itensNaoOk.map(i => i.itemId) } },
                select: { id: true, texto: true }
            })

            for (const resposta of itensNaoOk) {
                const item = itensInfo.find(i => i.id === resposta.itemId)
                const itemTexto = item?.texto || 'Item não identificado'
                const obs = resposta.observacao ? ` | Observação: ${resposta.observacao}` : ''

                await prisma.ordemServico.create({
                    data: {
                        veiculoId: data.veiculoId,
                        tipoOS: 'CORRETIVA',
                        status: 'ABERTA',
                        descricao: `[CHECKLIST ${data.tipo.toUpperCase()}] Falha identificada: ${itemTexto}${obs}`,
                        origem: 'CHECKLIST',
                        dataAbertura: new Date()
                    }
                })
            }
        }

        revalidatePath('/dashboard/pcm/checklist')
        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        
        return { success: true, id: checklistResposta.id }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao salvar checklist:', error)
        return { success: false, error: `Falha ao salvar checklist: ${error.message}` }
    }
}

export async function importOrdensServico(data: any[]) {
    try {
        console.log('Starting OS import. Type of data:', typeof data)
        console.log('Is array:', Array.isArray(data))
        console.log('Content of data:', JSON.stringify(data).substring(0, 100))
        
        if (!Array.isArray(data)) {
            console.error('Import aborted: data is not an array')
            return { success: false, message: 'Dados inválidos recebidos pelo servidor.' }
        }

        console.log('Starting OS import with', data.length, 'records')
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        let count = 0
        let errors = 0

        for (const rawItem of data) {
            try {
                // Normalize keys to allow 'Placa', 'PLACA', 'placa ', etc.
                const item: any = {}
                Object.keys(rawItem).forEach(key => {
                    const normalizedKey = key.trim().toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                        .replace(/\s+/g, '') // Remove spaces
                    item[normalizedKey] = rawItem[key]
                })

                // Improved header mapping (after normalization)
                const placaRaw = item.placa || item.veiculo || item.veiculo || item.equipamento || item.prefixo || item.prefixoitem || item.codigoexterno
                const codigoInternoRaw = item.codigointerno || item.interno || item.id_veiculo || item.id_veiculo || item.idveiculo
                const statusInput = item.status || item.situacao || item.situacao || item.estado || item.condicao || item.condicao
                const tipoInput = item.tipo || item.tipoos || item.tiposervico || item.tiposervico || item.categoria
                const descricaoVal = item.descricao || item.descricao || item.problema || item.atividades || item.observacao || item.observacao || item.diagnostico || item.diagnostico || 'Importado via sistema'
                const dataAberturaInput = item.dataabertura || item.data_abertura || item.data || item.abertura || item.aberturaos || item.dataos

                if (!placaRaw && !codigoInternoRaw) {
                    console.error('Record skipped: No plate or internal code found', item)
                    errors++
                    continue
                }

                // Clean-up identification fields
                const placa = placaRaw ? placaRaw.toString().trim().replace(/[-\s]/g, '').toUpperCase() : null
                const codigoInterno = codigoInternoRaw ? codigoInternoRaw.toString().trim() : null

                // Find vehicle by plate or code
                const veiculo = await prisma.veiculo.findFirst({
                    where: {
                        OR: [
                            placa ? { 
                                OR: [
                                    { placa: { contains: placa, mode: 'insensitive' } },
                                    { placa: { equals: placa, mode: 'insensitive' } }
                                ]
                            } : undefined,
                            codigoInterno ? { codigoInterno: { equals: codigoInterno, mode: 'insensitive' } } : undefined
                        ].filter(Boolean) as any
                    }
                })

                if (!veiculo) {
                    console.error(`Vehicle not found for OS import: Placa=${placa}, Codigo=${codigoInterno}`)
                    errors++
                    continue
                }

                // Map status and type
                const statusMap: Record<string, any> = {
                    'ABERTA': 'ABERTA',
                    'EM_ABERTO': 'ABERTA',
                    'OPEN': 'ABERTA',
                    'PLANEJADA': 'PLANEJADA',
                    'AGENDADA': 'PLANEJADA',
                    'PLANNED': 'PLANEJADA',
                    'EM_EXECUCAO': 'EM_EXECUCAO',
                    'EM_ANDAMENTO': 'EM_EXECUCAO',
                    'IN_PROGRESS': 'EM_EXECUCAO',
                    'CONCLUIDA': 'CONCLUIDA',
                    'FECHADA': 'CONCLUIDA',
                    'FINALIZADA': 'CONCLUIDA',
                    'COMPLETED': 'CONCLUIDA',
                    'CLOSED': 'CONCLUIDA',
                    'CANCELADA': 'CANCELADA',
                    'CANCELED': 'CANCELADA'
                }

                const tipoMap: Record<string, any> = {
                    'PREVENTIVA': 'PREVENTIVA',
                    'MANUTENCAO_PREVENTIVA': 'PREVENTIVA',
                    'CORRETIVA': 'CORRETIVA',
                    'MANUTENCAO_CORRETIVA': 'CORRETIVA',
                    'INSPECAO': 'INSPECAO',
                    'INSPEÇÃO': 'INSPECAO',
                    'MELHORIA': 'MELHORIA',
                    'PREDITIVA': 'INSPECAO'
                }

                const rawStatusStr = (statusInput?.toString() || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_')
                const osStatus = statusMap[rawStatusStr] || 'ABERTA'
                
                const rawTipoStr = (tipoInput?.toString() || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_')
                const osTipo = tipoMap[rawTipoStr] || 'CORRETIVA'

                // Robust date parsing (handling strings and Excel serial numbers)
                let dataAbertura = new Date()
                if (dataAberturaInput) {
                    if (typeof dataAberturaInput === 'number') {
                        // Excel serial date (days since 1900-01-01)
                        dataAbertura = new Date((dataAberturaInput - 25569) * 86400 * 1000)
                    } else {
                        const parsed = new Date(dataAberturaInput)
                        if (!isNaN(parsed.getTime())) dataAbertura = parsed
                    }
                }

                await prisma.ordemServico.create({
                    data: {
                        veiculoId: veiculo.id,
                        tipoOS: osTipo,
                        status: osStatus,
                        descricao: descricaoVal.toString(),
                        dataAbertura: dataAbertura,
                        origem: 'IMPORT',
                    }
                })
                count++
            } catch (e) {
                console.error('Error importing OS item:', e)
                errors++
            }
        }

        revalidatePath('/dashboard/pcm/os')
        return { success: true, count, errors }
    } catch (error: any) {
        console.error('[PCM Action] Erro na importação:', error)
        return { success: false, error: `Falha na importação: ${error.message}` }
    }
}


export async function cancelOrdemServico(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        await prisma.ordemServico.update({
            where: { id },
            data: { status: 'CANCELADA' as StatusOS }
        })

        revalidatePath('/dashboard/pcm/os')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao cancelar OS:', error)
        return { success: false, error: `Falha ao cancelar O.S.: ${error.message}` }
    }
}

export async function finishOrdemServico(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        await prisma.ordemServico.update({
            where: { id },
            data: {
                status: 'CONCLUIDA' as StatusOS,
                dataConclusao: new Date()
            }
        })

        revalidatePath('/dashboard/pcm/os')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao concluir OS:', error)
        return { success: false, error: `Falha ao concluir O.S.: ${error.message}` }
    }
}

export async function approveOrdemServicoPlan(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        await prisma.ordemServico.update({
            where: { id },
            data: { status: 'EM_EXECUCAO' }
        })

        revalidatePath('/dashboard/pcm/os')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao aprovar plano OS:', error)
        return { success: false, error: `Falha ao aprovar plano O.S.: ${error.message}` }
    }
}

export async function resumeOrdemServicoExecution(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        await prisma.ordemServico.update({
            where: { id },
            data: { status: 'EM_EXECUCAO' }
        })

        revalidatePath('/dashboard/pcm/os')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao retomar execução OS:', error)
        return { success: false, error: `Falha ao iniciar execução O.S.: ${error.message}` }
    }
}

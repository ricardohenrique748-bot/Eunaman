'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { getSession } from './auth-actions'

const docTypes = [
    { prefix: 'laudo', type: 'LAUDO_ELETROMECANICO' },
    { prefix: 'crlv', type: 'CRLV' },
    { prefix: 'implemento', type: 'IMPLEMENTO' },
    { prefix: 'tacografo', type: 'TACOGRAFO' },
    { prefix: 'civ', type: 'CIV_CIPP' }
]

export async function createVeiculo(formData: FormData) {
    const session = await getSession()
    if (!session) return { success: false, error: 'Usuário não autenticado.' }

    const placa = formData.get('placa') as string
    const tipo = formData.get('tipo') as string
    const categoria = formData.get('categoria') as string
    const modulo = formData.get('modulo') as string
    const horimetro = parseInt(formData.get('horimetro') as string) || 0
    const dataAtualizacao = formData.get('dataAtualizacao') as string

    try {
        let unidadeId = session.unidadeId
        let empresaId: string | undefined

        if (!unidadeId) {
            const firstUnit = await prisma.unidade.findFirst()
            if (!firstUnit) return { success: false, error: 'Nenhuma unidade encontrada.' }
            unidadeId = firstUnit.id
            empresaId = firstUnit.empresaId
        } else {
            const unit = await prisma.unidade.findUnique({ where: { id: unidadeId } })
            empresaId = unit?.empresaId
        }

        if (!empresaId) return { success: false, error: 'Empresa não encontrada para esta unidade.' }

        await prisma.$transaction(async (tx: any) => {
            await tx.veiculo.create({
                data: {
                    codigoInterno: placa,
                    placa,
                    tipoVeiculo: typeMap(tipo),
                    categoria,
                    moduloSistema: modulo,
                    horimetroAtual: horimetro,
                    dataAtualizacaoHorimetro: dataAtualizacao ? new Date(dataAtualizacao) : new Date(),
                    fabricante: 'N/A',
                    modelo: 'N/A',
                    ano: new Date().getFullYear(),
                    status: 'DISPONIVEL',
                    empresaId: empresaId!,
                    unidadeId: unidadeId!,
                    kmAtual: 0,
                    documentos: {
                        create: docTypes.map(d => {
                            const num = formData.get(`${d.prefix}_numero`) as string
                            if (!num) return null

                            return {
                                tipo: d.type,
                                numero: num,
                                dataEmissao: formData.get(`${d.prefix}_emissao`) ? new Date(formData.get(`${d.prefix}_emissao`) as string) : null,
                                dataValidade: formData.get(`${d.prefix}_validade`) ? new Date(formData.get(`${d.prefix}_validade`) as string) : null
                            }
                        }).filter(Boolean)
                    }
                }
            })
        })

        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao criar veículo' }
    }
}

export async function importVeiculosExcel(formData: FormData) {
    console.log('[Import] --- INÍCIO ---')
    try {
        const file = formData.get('file') as File
        if (!file || file.size === 0) return { success: false, error: 'Arquivo não recebido ou vazio.' }

        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: true })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data: any[] = XLSX.utils.sheet_to_json(worksheet)

        console.log(`[Import] Linhas lidas: ${data.length}`)
        if (data.length > 0) {
            console.log('[Import] Cabeçalhos encontrados:', Object.keys(data[0]))
        }

        const unidade = await prisma.unidade.findFirst()
        if (!unidade) {
            console.error('[Import] Erro: Sem unidade.')
            return { success: false, error: 'Erro: Nenhuma unidade encontrada no sistema.' }
        }

        let successCount = 0
        let errors = []
        let lastErrorMessage = ''

        if (data.length > 0) {
            console.log('[Import] Cabeçalhos reais do Excel:', Object.keys(data[0]))
        }

        const docConfig = [
            { type: 'LAUDO_ELETROMECANICO', kw: 'laudo' },
            { type: 'CRLV', kw: 'crlv' },
            { type: 'IMPLEMENTO', kw: 'implemento' },
            { type: 'TACOGRAFO', kw: 'tacografo' },
            { type: 'CIV_CIPP', kw: 'civ' }
        ]

        for (const [index, row] of data.entries()) {
            const normalize = (s: any) => s ? s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

            const findCol = (targetKw: string) => {
                const target = normalize(targetKw);
                const key = Object.keys(row).find(k => normalize(k).includes(target));
                if (key) console.log(`[Import] Found column for ${targetKw}: "${key}"`);
                return key ? row[key] : null
            }

            const placaRaw = findCol('placa') || findCol('cod') || findCol('interno') || findCol('veiculo')
            if (!placaRaw) {
                if (index === 0) console.warn('[Import] Falha ao encontrar placa na primeira linha. Chaves:', Object.keys(row));
                console.warn(`[Import] Linha ${index + 1} pulada (sem placa)`)
                continue
            }

            const placa = String(placaRaw).trim()
            console.log(`[Import] Linha ${index + 1} -> Placa: ${placa}`)
            const tipo = String(findCol('tipo') || 'LEVE')
            const categoria = String(findCol('categoria') || 'PROPRIO')
            const modulo = String(findCol('modulo') || 'BASE')
            const horimetro = findCol('horimetro')
            const dataAtu = findCol('atualizacao')

            try {
                // Execute individual elements to track errors better
                const veiculo = await prisma.veiculo.upsert({
                    where: { codigoInterno: placa },
                    update: {
                        tipoVeiculo: typeMap(tipo),
                        // @ts-ignore
                        categoria: categoria,
                        // @ts-ignore
                        moduloSistema: modulo,
                        horimetroAtual: Math.floor(Number(horimetro)) || 0,
                        dataAtualizacaoHorimetro: dataAtu instanceof Date ? dataAtu : (dataAtu ? new Date(dataAtu as any) : null),
                        modelo: String(findCol('modelo') || 'VEICULO')
                    },
                    create: {
                        codigoInterno: placa,
                        placa: placa,
                        tipoVeiculo: typeMap(tipo),
                        // @ts-ignore
                        categoria: categoria,
                        // @ts-ignore
                        moduloSistema: modulo,
                        horimetroAtual: Math.floor(Number(horimetro)) || 0,
                        dataAtualizacaoHorimetro: dataAtu instanceof Date ? dataAtu : (dataAtu ? new Date(dataAtu as any) : null),
                        fabricante: 'GENERICO',
                        modelo: String(findCol('modelo') || 'VEICULO'),
                        ano: new Date().getFullYear(),
                        status: 'DISPONIVEL',
                        empresaId: unidade.empresaId,
                        unidadeId: unidade.id,
                        kmAtual: 0
                    }
                })

                for (const d of docConfig) {
                    const rowKeys = Object.keys(row);
                    const numKey = rowKeys.find(k => normalize(k).includes(d.kw) && (normalize(k).includes('n') || normalize(k).includes('numero')));
                    const emiKey = rowKeys.find(k => normalize(k).includes(d.kw) && (normalize(k).includes('exp') || normalize(k).includes('emissao') || normalize(k).includes('dat')));
                    const valKey = rowKeys.find(k => normalize(k).includes(d.kw) && (normalize(k).includes('val')));

                    if (numKey) {
                        const num = row[numKey];
                        const emissao = emiKey ? row[emiKey] : null;
                        const validade = valKey ? row[valKey] : null;

                        // @ts-ignore
                        await prisma.documentoFrota.upsert({
                            where: { veiculoId_tipo: { veiculoId: veiculo.id, tipo: d.type } },
                            update: {
                                numero: String(num),
                                dataEmissao: emissao instanceof Date ? emissao : (emissao ? new Date(emissao as any) : null),
                                dataValidade: validade instanceof Date ? validade : (validade ? new Date(validade as any) : null)
                            },
                            create: {
                                veiculoId: veiculo.id,
                                tipo: d.type,
                                numero: String(num),
                                dataEmissao: emissao instanceof Date ? emissao : (emissao ? new Date(emissao as any) : null),
                                dataValidade: validade instanceof Date ? validade : (validade ? new Date(validade as any) : null)
                            }
                        })
                    }
                }

                successCount++
                console.log(`[Import] OK: ${placa}`)
            } catch (err: any) {
                console.error(`[Import] Erro no veículo ${placa}:`, err.message)
                errors.push(placa)
                lastErrorMessage = err.message
            }
        }

        revalidatePath('/dashboard/admin')
        return {
            success: true,
            count: successCount,
            errors,
            error: lastErrorMessage // Pass back the last error message for UI debugging
        }
    } catch (e: any) {
        console.error('[Import] Erro Crítico:', e)
        return { success: false, error: 'Erro Crítico: ' + e.message }
    }
}

function getData(val: string) {
    return val ? new Date(val) : null
}

function typeMap(val: string) {
    if (!val) return 'LEVE'
    const v = val.toString().toUpperCase()
    if (v.includes('PESADO') || v.includes('CAMINHAO')) return 'PESADO'
    if (v.includes('MAQUINA')) return 'MAQUINA'
    return 'LEVE'
}

export async function getVehicleDetails(id: string) {
    try {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id },
            include: {
                documentos: {
                    orderBy: { tipo: 'asc' }
                }
            }
        })
        if (!veiculo) return { success: false, error: 'Veículo não encontrado.' }
        return { success: true, data: veiculo }
    } catch (e: any) {
        return { success: false, error: 'Erro ao buscar veículo: ' + e.message }
    }
}

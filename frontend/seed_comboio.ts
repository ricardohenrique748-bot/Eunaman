import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log("Criando Formulário de Checklist: COMBOIO...")

    // Check if it already exists to avoid duplicates during tests
    let form = await prisma.checklistFormulario.findFirst({
        where: { nome: 'Checklist - COMBOIO' }
    })

    if (!form) {
        form = await prisma.checklistFormulario.create({
            data: {
                nome: 'Checklist - COMBOIO',
                descricao: 'Checklist operacional e de segurança para caminhão Comboio',
                ativo: true,
            }
        })
    } else {
        // Clear items to recreate them
        await prisma.checklistItem.deleteMany({
            where: { formularioId: form.id }
        })
    }

    const items = [
        // EQUIPAMENTO INTERDITADO
        { texto: 'BARRAS DE PROTEÇÃO', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 10 },
        { texto: 'CINTO DE SEGURANÇA', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 20 },
        { texto: 'TACOGRAFO / CRONOTACOGRAFO / APR / LAUDO ELETROMECANICO / ART', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 30 },
        { texto: 'CRLV / CIV / CIPP / ANTT / FISPQ', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 40 },
        { texto: 'PARTIDA (Ignição)', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 50 },
        { texto: 'SISTEMA DE FREIO / FREIO ESTACIONÁRIO', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 60 },
        { texto: 'BARRA DE DIREÇÃO', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 70 },
        { texto: 'KIT AMBIENTAL (Capa, Cones, Enxada, etc.)', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 80 },
        { texto: 'ATERRAMENTO CHASSI TANQUE / TANQUE MVE', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 90 },
        { texto: 'ESCADA DE ACESSO / GUARDA CORPO', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 100 },
        { texto: 'TRÊS PONTOS DE ACESSO / PISO ANTIDERRAPANTE', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 110 },
        { texto: 'VAZAMENTO DE COMBUSTÍVEL', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 120 },
        { texto: 'EXTINTOR / SUPORTE', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 130 },
        { texto: 'SINALIZAÇÃO / TRAVA DO RADIADOR', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 140 },
        { texto: 'SIRENE DE RÉ', categoria: 'EQUIPAMENTO INTERDITADO', ordem: 150 },

        // OBRIGATÓRIOS PARA OPERAÇÃO
        { texto: 'PROPULSORA / PISTOLA DIESEL / GRAXA / INSUMOS / CALIBRADOR PNEU / REGUA TRANQUE / TABELA', categoria: 'OBRIGATÓRIOS PARA OPERAÇÃO', ordem: 160 },
        { texto: 'REGISTRADORA DE DIESEL / INSUMO', categoria: 'OBRIGATÓRIOS PARA OPERAÇÃO', ordem: 170 },

        // MANUTENÇÃO PROGRAMADA
        { texto: 'MACACO / CHAVE DE RODA / TRIANGULO / MÃO DE FORÇA', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 180 },
        { texto: 'ESTEPE / CALÇOS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 190 },
        { texto: 'PORCAS / PARAFUSOS / TRINCAS RODAS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 200 },
        { texto: 'PARABRISA / VIDROS DAS PORTAS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 210 },
        { texto: 'DISPOSITIVO DE LIMITAÇÃO DA PORTA', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 220 },
        { texto: 'LIMPADOR DO PARABISA / INJETOR / PALHETA', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 230 },
        { texto: 'ESPELHOS RETROVISOR / QUEBRA SOL', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 240 },
        { texto: 'PEDAIS / BORRACHAS / ESTRIBOS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 250 },
        { texto: 'CABINE / ASSOALHO / BANCOS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 260 },
        { texto: 'AR-CONDICIONADO / CILMATIZADOR', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 270 },
        { texto: 'PLACAS DE SINALIZAÇÃO / ISOLAMENTO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 280 },
        { texto: 'SISTEMA DE ILUMINAÇÃO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 290 },
        { texto: 'VAZAMENTO DE AR', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 300 },
        { texto: 'VAZAMENTO DE OLEO - IMPLEMENTO OU CAMINHÃO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 310 },
        { texto: 'SUSPENÇÃO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 320 },
        { texto: 'FAIXAS REFLETIVAS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 330 },
        { texto: 'TOMADA DE FORÇA (ruido, vazamento, funcionamento)', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 340 },
        { texto: 'MANGUEIRA DOS CARRETEIS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 350 },
        { texto: 'INTEGRIDADE DOS CARRETEIS', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 360 },
        { texto: 'AMORTECEDOR DE CASARIA', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 370 },
        { texto: 'CORREIA DO IMPLEMENTO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 380 },
        { texto: 'SUPORTE DE FIXAÇÃO DO TANQUE HIDRÁULICO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 390 },
        { texto: 'GRAXEIROS DO EQUIPAMENTO (CATRACA, CRUZETA ETC...)', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 400 },
        { texto: 'SETOR DE DIREÇÃO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 410 },
        { texto: 'LIQUIDO DE ARREFECIMENTO', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 420 },
        { texto: 'CHASSI (TRINCAS ETC...)', categoria: 'MANUTENÇÃO PROGRAMADA', ordem: 430 }
    ]

    for (const item of items) {
        await prisma.checklistItem.create({
            data: {
                formularioId: form.id,
                texto: item.texto,
                categoria: item.categoria,
                ordem: item.ordem,
                obrigatorio: true
            }
        })
    }

    console.log("Checklist do COMBOIO populado com sucesso com", items.length, "itens!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

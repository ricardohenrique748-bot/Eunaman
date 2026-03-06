import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting Caminhão Pipa Checklist seed...')

    // 1. Criar o Formulário do Pipa
    const formulario = await prisma.checklistFormulario.create({
        data: {
            nome: 'Checklist Diário - Caminhão Pipa',
            descricao: 'Checklist de inspeção diária para Caminhões Pipa',
            ativo: true,
        }
    })

    console.log('Created Form:', formulario.nome)

    // Lista de Itens do Pipa
    const itens = [
        // EQUIPAMENTO INTERDITADO
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'BARRAS DE PROTEÇÃO (Laterais e Traseira)', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'CINTO DE SEGURANÇA (Motorista / Passageiro)', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'TACOGRAFO / CRONOTACOGRAFO/ APR/ LAUDO ELETROMECANICO/ART', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'CRLV / CIV/CIPP/ ANTT/ FISPQ', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'PARTIDA (Ignição)', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'SISTEMA DE FREIO / FREIO ESTACIONÁRIO', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'BARRA DE DIREÇÃO', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'ESCADA DE ACESSO / GUARDA CORPO', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'TRES PONTOS DE ACESSO / PISO ANTIDERRAPANTE', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'VAZAMENTO DE COMBUSTÍVEL', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'SIRENE DE RÉ / BUZINA', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'SINALIZAÇÃO / TRAVA DO RADIADOR', obrigatorio: true },
        { categoria: 'EQUIPAMENTO INTERDITADO', texto: 'EXTINTOR / SUPORTE', obrigatorio: true },

        // OBRIGATÓRIOS PARA OPERAÇÃO
        { categoria: 'OBRIGATÓRIOS PARA OPERAÇÃO', texto: 'ESCADA DE ALUMINIO 08 DEGRAUS 2,70 x 4,50 mt / GANCHO COM PONTA CURVADA / CANHÃO LGE / MARACA', obrigatorio: true },

        // MANUTENÇÃO PROGRAMADA
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'ESTADO GERAL DOS PNEUS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'MACACO / CHAVE DE RODA / TRIANGULO / MÃO DE FORÇA', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'ESTEPE / CALÇOS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'PORCAS / PARAFUSOS / TRINCAS RODAS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'PARABRISA / VIDROS DAS PORTAS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'ESPELHOS RETROVISOR / QUEBRA SOL', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'PEDAIS / BORRACHAS / ESTRIBOS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'CONES / PLACAS DE SINALIZAÇÃO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'SISTEMA DE ILUMINAÇÃO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'LIMPADOR DO PARABISA / INJETOR / PALHETA', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'VAZAMENTO DE AR', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'VAZAMENTO DE OLEO - IMPLEMENTO OU CAMINHÃO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'SUSPENSÃO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'VAZAMENTO DE ÁGUA NA BOMBA', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: "MANGUEIRAS D'ÁGUA", obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'CABINE / ASSOALHO / BANCOS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'AR-CONDICIONADO / CLIMATIZADOR', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'FAIXAS REFLETIVAS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'DISPOSITIVO DE LIMITAÇÃO DA PORTA', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'CARROCERIA', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'GRAXEIROS DO EQUIPAMENTO (CATRACA, CRUZETA ETC...)', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'MANGUEIRAS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'SETOR DE DIREÇÃO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'LIQUIDO DE ARREFECIMENTO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'CHASSI (TRINCAS ETC...)', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'TOMADA DE FORÇA (ruido, vazamento, funcionamento)', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'CAIXOTE GUARDA VOLUMES', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'MONÔMETRO DE PRESSÃO DA BOMBA DO IMPLEMENTO', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'REGISTROS', obrigatorio: true },
        { categoria: 'MANUTENÇÃO PROGRAMADA', texto: 'MARACA', obrigatorio: true },
    ]

    for (let i = 0; i < itens.length; i++) {
        await prisma.checklistItem.create({
            data: {
                ...itens[i],
                formularioId: formulario.id,
                ordem: i + 1
            }
        })
    }

    console.log(`Created ${itens.length} items for the checklist.`)
    console.log('✅ Seed finished successfully')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

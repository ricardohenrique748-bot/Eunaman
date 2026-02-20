import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting import of fleet...')

    // Obter primeira empresa e unidade para associar a frota
    const empresa = await prisma.empresa.findFirst()
    const unidade = await prisma.unidade.findFirst()

    if (!empresa || !unidade) {
        console.error('❌ Nenhuma empresa ou unidade encontrada no banco de dados. Cadastre primeiro!')
        return
    }

    const frota = [
        { placa: 'LMT 7E29', tipo: 'COMBOIO', modelo: 'VW-17.190 CRM 4X2 ROB', modulo: 'CARREG', ano: 2022 },
        { placa: 'PTF 4236', tipo: 'PIPA', modelo: 'VW-17.190 CRM 4X2', modulo: 'RESERVA', ano: 2017 },
        { placa: 'PTF 9280', tipo: 'MUNCK', modelo: 'VW 26.280 CRM 6X4', modulo: 'SILVICULTURA', ano: 2017 },
        { placa: 'LUC 7J90', tipo: 'PIPA', modelo: 'VW 26.280 CRM 6X4', modulo: 'MD 07', ano: 2022 },
        { placa: 'ROG 1I38', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'CARREG', ano: 2021 },
        { placa: 'ROE 8F63', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'MD 05', ano: 2021 },
        { placa: 'ROE 8F66', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'MD 02', ano: 2021 },
        { placa: 'ROG 1I26', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'MD 05', ano: 2021 },
        { placa: 'ROG 1I40', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'MD 07', ano: 2021 },
        { placa: 'ROG 1I41', tipo: 'COMBOIO', modelo: 'VM 270 6X4R - VOLVO', modulo: 'MD 05', ano: 2021 },
        { placa: 'ROS 1D66', tipo: 'MUNCK', modelo: 'VM 270 6X4R - VOLVO', modulo: 'SILVICULTURA', ano: 2022 },
        { placa: 'PTV 4G53', tipo: 'MULTIFUNCIONAL', modelo: 'MBB-ATEGO-17.190 -CL', modulo: 'RESERVA', ano: 2020 },
        { placa: 'PTV 4G49', tipo: 'MULTIFUNCIONAL', modelo: 'MBB-ATEGO-17.190 -CL', modulo: 'CARREG', ano: 2020 },
        { placa: 'PTV 3A59', tipo: 'MULTIFUNCIONAL', modelo: 'MBB-ATEGO-17.190 -CL', modulo: 'CARREG', ano: 2020 },
        { placa: 'PTT 8D76', tipo: 'MUNCK', modelo: 'MBB-ATEGO-17.190 -CL', modulo: 'RESERVA', ano: 2020 },
        { placa: 'TCN 7J72', tipo: 'COMBOIO', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'RESERVA', ano: 2024 },
        { placa: 'TCN 7J90', tipo: 'COMBOIO', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'RESERVA', ano: 2024 },
        { placa: 'TCN 7J82', tipo: 'COMBOIO', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'RESERVA', ano: 2024 },
        { placa: 'TCA 4B23', tipo: 'PIPA', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 02', ano: 2024 },
        { placa: 'TCA 4B26', tipo: 'PIPA', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 07', ano: 2024 },
        { placa: 'TCC 2E83', tipo: 'PIPA', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 05', ano: 2024 },
        { placa: 'TCC 6G17', tipo: 'PIPA', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 05', ano: 2024 },
        { placa: 'SFR 4F28', tipo: 'MUNCK', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MALHA VIARIA', ano: 2024 },
        { placa: 'SFR 4F37', tipo: 'MUNCK', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'RESERVA', ano: 2024 },
        { placa: 'SGJ 1G11', tipo: 'MUNCK', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 02', ano: 2024 },
        { placa: 'SGJ 7H05', tipo: 'MUNCK', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'SILVICULTURA', ano: 2024 },
        { placa: 'SGJ 7I82', tipo: 'MUNCK', modelo: 'M. BENZ / ATEGO 2730 CE', modulo: 'MD 07', ano: 2024 },
        { placa: 'PTW 0F01', tipo: 'SKID MOVEL', modelo: 'LT20.000 / SEMI REBOQUE SKID', modulo: 'MD 02', ano: 2020 },
        { placa: 'PTV 5G37', tipo: 'SKID MOVEL', modelo: 'LT15.003 / SEMI REBOQUE SKID', modulo: 'MD 05', ano: 2017 },
    ]

    for (let i = 0; i < frota.length; i++) {
        const item = frota[i];

        let fabricante = 'N/A';
        if (item.modelo.includes('VW')) fabricante = 'Volkswagen';
        else if (item.modelo.includes('VOLVO') || item.modelo.includes('VOLVO')) fabricante = 'Volvo';
        else if (item.modelo.includes('MBB') || item.modelo.includes('BENZ')) fabricante = 'Mercedes-Benz';

        const codigo = `FRT-${String(i + 1).padStart(3, '0')}`;

        try {
            await prisma.veiculo.create({
                data: {
                    codigoInterno: codigo,
                    placa: item.placa.replace(' ', ''),
                    tipoVeiculo: item.tipo,
                    fabricante: fabricante,
                    modelo: item.modelo,
                    ano: item.ano,
                    empresaId: empresa.id,
                    unidadeId: unidade.id,
                    status: 'DISPONIVEL',
                    moduloSistema: item.modulo
                }
            })
            console.log(`✅ Cadastrado: ${item.placa} - ${item.modelo}`)
        } catch (error) {
            console.error(`❌ Erro ao cadastrar ${item.placa}:`, error)
        }
    }

    console.log('🎉 Finalizado o cadastro da frota!')
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

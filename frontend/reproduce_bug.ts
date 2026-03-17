
import { PrismaClient } from '@prisma/client'
import { differenceInHours, startOfMonth, endOfMonth, min, max, differenceInMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
    const now = new Date('2026-03-16T23:30:00Z') // March 16 23:30 UTC
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = endOfMonth(now)
    const referenceEnd = now

    let log = '--- DIAGNOSTICO DISPONIBILIDADE ---\n'
    log += `Now (Ref): ${now.toISOString()}\n`
    log += `Periodo: ${firstDay.toISOString()} a ${lastDay.toISOString()}\n`

    const veiculos = await prisma.veiculo.findMany({
        where: { codigoInterno: 'FRT-003' },
        include: {
            os: {
                where: {
                    dataAbertura: { lte: lastDay },
                    OR: [
                        { dataConclusao: null },
                        { dataConclusao: { gte: firstDay } }
                    ],
                    status: { in: ['ABERTA', 'PLANEJADA', 'EM_EXECUCAO', 'CONCLUIDA'] }
                }
            }
        }
    })

    log += `Veiculos encontrados: ${veiculos.length}\n`
    if (veiculos.length > 0) {
        const v = veiculos[0]
        log += `Veiculo: ${v.codigoInterno} Status: ${v.status}\n`
        log += `O.S. Vinculadas: ${v.os.length}\n`

        let totalDowntimeHours = 0
        v.os.forEach((os: any, i: number) => {
            const osStart = new Date(os.dataAbertura)
            const osEnd = os.dataConclusao ? new Date(os.dataConclusao) : referenceEnd

            const startCalculo = max([osStart, firstDay])
            const endCalculo = min([osEnd, referenceEnd])

            const minutes = differenceInMinutes(endCalculo, startCalculo)
            log += `OS #${i+1}: ${os.numeroOS || 'S/N'}\n`
            log += `  Status: ${os.status}\n`
            log += `  Data Abertura: ${os.dataAbertura.toISOString()}\n`
            log += `  Start Calc: ${startCalculo.toISOString()}\n`
            log += `  End Calc: ${endCalculo.toISOString()}\n`
            log += `  Minutes: ${minutes}\n`
            
            if (minutes > 0) totalDowntimeHours += (minutes / 60)
        })

        const totalHoursInPeriodMath = Math.max(1, differenceInMinutes(referenceEnd, firstDay) / 60)
        const availability = Math.max(0, ((totalHoursInPeriodMath - totalDowntimeHours) / totalHoursInPeriodMath) * 100)

        log += `Total Downtime (H): ${totalDowntimeHours}\n`
        log += `Total Period (H): ${totalHoursInPeriodMath}\n`
        log += `Disponibilidade: ${availability.toFixed(1)}%\n`
    }

    require('fs').writeFileSync('diagnosis_output.txt', log)
    console.log('Result written to diagnosis_output.txt')
}

main().catch(console.error).finally(() => prisma.$disconnect())

import prisma from '@/lib/prisma'
import ChecklistDashboard from './ChecklistDashboard'

export default async function ChecklistPage() {
    const forms = await prisma.checklistFormulario.findMany({
        where: { ativo: true },
        include: {
            itens: true,
            respostas: {
                include: {
                    veiculo: { select: { codigoInterno: true, placa: true } },
                    usuario: { select: { nome: true } }
                },
                orderBy: { dataResposta: 'desc' },
                take: 50
            }
        }
    })

    // Serialize dates for Client Component
    const serializedForms = JSON.parse(JSON.stringify(forms))

    return (
        <ChecklistDashboard forms={serializedForms} />
    )
}

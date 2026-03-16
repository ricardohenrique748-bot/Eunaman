import prisma from '@/lib/prisma'
import ChecklistDashboard from '../dashboard/pcm/checklist/ChecklistDashboard'

export const dynamic = 'force-dynamic'

export default async function ChecklistAppDashboardPage() {
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

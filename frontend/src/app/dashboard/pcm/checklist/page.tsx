import prisma from '@/lib/prisma'
import ChecklistDashboard from './ChecklistDashboard'

export default async function ChecklistPage() {
    const forms = await prisma.checklistFormulario.findMany({
        where: { ativo: true },
        include: {
            itens: true,
            respostas: true
        }
    })

    return (
        <ChecklistDashboard forms={forms} />
    )
}

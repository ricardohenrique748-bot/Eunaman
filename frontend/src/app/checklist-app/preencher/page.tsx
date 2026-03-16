import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getSession } from '@/app/actions/auth-actions'
import ChecklistForm from '../../dashboard/pcm/checklist/preencher/ChecklistForm'

export default async function PreencherChecklistStandalonePage(props: any) {
    const { tipo } = await props.searchParams
    const session = await getSession()

    // Fetch form matching the tipo
    const formulario = await prisma.checklistFormulario.findFirst({
        where: {
            nome: { equals: tipo, mode: 'insensitive' },
            ativo: true
        },
        include: {
            itens: {
                orderBy: { ordem: 'asc' }
            }
        }
    })

    if (!formulario) return notFound()

    // Group items by categoria
    const grouped = formulario.itens.reduce((acc: Record<string, any[]>, item) => {
        const cat = item.categoria || 'Geral'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {})

    // Fetch all active vehicles
    const veiculos = await prisma.veiculo.findMany({
        where: { status: { not: 'DESATIVADO' } },
        select: { id: true, codigoInterno: true, placa: true, modelo: true },
        orderBy: { codigoInterno: 'asc' }
    })

    // Serialização JSON para evitar erros de data nativa entre Server e Client Component
    const serializedForm = JSON.parse(JSON.stringify(formulario))
    const serializedVeiculos = JSON.parse(JSON.stringify(veiculos))

    return (
        <div className="max-w-screen-md mx-auto">
            <ChecklistForm
                formulario={serializedForm}
                //@ts-ignore
                grouped={grouped}
                tipoLabel={tipo}
                veiculos={serializedVeiculos}
                usuarioNome={session?.nome || ''}
            />
        </div>
    )
}

import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ChecklistForm from './ChecklistForm'

export default async function PreencherChecklistPage(props: any) {
    const { tipo } = await props.searchParams

    // Fetch form matching the tipo (e.g. "COMBOIO")
    const formulario = await prisma.checklistFormulario.findFirst({
        where: {
            nome: { contains: tipo, mode: 'insensitive' },
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
    const grouped = formulario.itens.reduce((acc: Record<string, typeof formulario.itens>, item) => {
        const cat = item.categoria || 'Geral'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {})

    return (
        <ChecklistForm formulario={formulario} grouped={grouped} tipoLabel={tipo} />
    )
}

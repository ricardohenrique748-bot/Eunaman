
import Link from 'next/link'
import { Plus, Truck } from 'lucide-react'

export default function FrotaPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Truck className="w-6 h-6 text-primary" />
                    Frota e Ativos
                </h1>
                <Link href="/dashboard/frota/novo">
                    <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-orange-500/20">
                        <Plus className="w-4 h-4" />
                        Novo Ativo
                    </button>
                </Link>
            </div>
            <div className="bg-surface border border-border-color rounded-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-highlight mb-4">
                    <Truck className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Gestão de Frota</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Gerencie todos os ativos da empresa, incluindo veículos leves, pesados e maquinários.</p>
                <Link href="/dashboard/frota/novo">
                    <button className="text-primary font-bold hover:underline">Cadastrar primeiro ativo &rarr;</button>
                </Link>
            </div>
        </div>
    )
}

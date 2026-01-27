
import { createBoletimPneu } from '@/app/actions/pneu-actions'
import { getVeiculosDropdown } from '@/app/actions/pcm-actions'
import { ArrowLeft, Save, Calendar, Gauge } from 'lucide-react'
import Link from 'next/link'

export default async function NovaInspecaoPage() {
    const veiculos = await getVeiculosDropdown()

    const posicoes = [
        { id: 'DE', label: 'DE' }, { id: 'DD', label: 'DD' },
        { id: 'TEI', label: 'TEI' }, { id: 'TEE', label: 'TEE' },
        { id: 'TDI', label: 'TDI' }, { id: 'TDE', label: 'TDE' },
        { id: 'TEI1', label: 'TEI1' }, { id: 'TEE1', label: 'TEE1' },
        { id: 'TDI1', label: 'TDI1' }, { id: 'TDE1', label: 'TDE1' },
        { id: 'ESTEPE', label: 'ESTEPE' }
    ]

    return (
        <div className="max-w-3xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/pneus" className="text-gray-500 hover:text-foreground text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Nova Inspeção de Pneu</h1>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={async (formData) => {
                    'use server'
                    await createBoletimPneu(formData)
                }} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Placa *</label>
                            <select name="veiculoId" required className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary">
                                <option value="">Selecione</option>
                                {veiculos.map(v => (
                                    <option key={v.id} value={v.id}>{v.placa}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Data *</label>
                            <div className="relative">
                                <input type="date" name="data" required className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary pl-10" />
                                <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Km</label>
                            <div className="relative">
                                <input type="number" name="km" placeholder="0" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary pl-10" />
                                <Gauge className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-border-color pb-1 block">Posição do Pneu *</label>
                        <div className="bg-surface-highlight/30 rounded-lg p-4 grid grid-cols-2 gap-x-8 gap-y-4">
                            {posicoes.map((pos) => (
                                <div key={pos.id} className="flex items-center gap-4">
                                    <span className="font-bold text-gray-600 dark:text-gray-400 w-12 text-right text-sm">{pos.label}</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name={`sulco_${pos.id}`}
                                        placeholder="Sulco (mm)"
                                        className="flex-1 bg-surface border border-border-color rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Condição</label>
                        <select name="condicao" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary">
                            <option value="BOM">BOM</option>
                            <option value="REGULAR">REGULAR</option>
                            <option value="RUIM">RUIM</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Observações</label>
                        <textarea name="observacoes" placeholder="Observações sobre o pneu..." rows={3} className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"></textarea>
                    </div>

                    <div className="pt-4 border-t border-border-color flex justify-end gap-3">
                        <Link href="/dashboard/pcm/pneus">
                            <button type="button" className="px-6 py-3 rounded-lg border border-border-color text-gray-300 font-medium hover:bg-surface-highlight transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                            <Save className="w-4 h-4" />
                            Salvar Inspeção
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

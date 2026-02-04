'use client'

import { useState, useEffect } from 'react'
import { getPreventivaById, updatePreventiva, getVeiculosSimples } from '@/app/actions/preventiva-actions'
import { ArrowLeft, Save, Calendar, Clock, Settings, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface VeiculoSimple {
    id: string;
    modelo: string;
    placa: string | null;
    codigoInterno: string;
    horimetroAtual: number;
}

export default function EditarPreventivaPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [veiculos, setVeiculos] = useState<VeiculoSimple[]>([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    const [formData, setFormData] = useState({
        veiculoId: '',
        tipo: '',
        modulo: '',
        ultimoHorimetro: 0,
        horimetroAtual: 0,
        intervalo: 500,
        dataAtualizacao: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        Promise.all([
            getVeiculosSimples(),
            getPreventivaById(id)
        ]).then(([veiculosData, preventivaData]) => {
            setVeiculos(veiculosData)

            if (preventivaData) {
                setFormData({
                    veiculoId: preventivaData.veiculoId,
                    tipo: preventivaData.tipo,
                    modulo: preventivaData.modulo || '',
                    ultimoHorimetro: preventivaData.ultimoHorimetro,
                    horimetroAtual: preventivaData.veiculo.horimetroAtual,
                    intervalo: preventivaData.intervalo,
                    dataAtualizacao: new Date(preventivaData.dataAtualizacao).toISOString().split('T')[0]
                })
            }

            setInitialLoading(false)
        })
    }, [id])

    const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vId = e.target.value
        const v = veiculos.find(x => x.id === vId)
        setFormData(prev => ({
            ...prev,
            veiculoId: vId,
            horimetroAtual: v ? v.horimetroAtual : 0
        }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (initialLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando dados...</div>
    }

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/preventivas" className="text-gray-500 hover:text-foreground text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Editar Preventiva</h1>
                </div>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={async (form) => {
                    setLoading(true)
                    await updatePreventiva(id, form)
                    setLoading(false)
                    router.push('/dashboard/pcm/preventivas')
                }} className="space-y-6">

                    {/* Hidden field for veiculoId since we disable select */}
                    <input type="hidden" name="veiculoId" value={formData.veiculoId} />

                    {/* Placa */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Placa / Veículo</label>
                        <select
                            name="veiculoId_display"
                            disabled
                            className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground opacity-60 cursor-not-allowed"
                            value={formData.veiculoId}
                        >
                            <option value="">Selecione o veículo</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.codigoInterno} - {v.modelo} ({v.placa || 'Sem Placa'})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400">* Não é possível alterar o veículo de uma preventiva já criada.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipo */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Tipo</label>
                            <div className="relative">
                                <Wrench className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    placeholder="Ex: Motor, Hidráulico"
                                    required
                                    className="w-full bg-surface-highlight border border-border-color rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Módulo */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Módulo</label>
                            <div className="relative">
                                <Settings className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    name="modulo"
                                    value={formData.modulo}
                                    onChange={handleChange}
                                    placeholder="Ex: Sistema de Freio"
                                    className="w-full bg-surface-highlight border border-border-color rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Último Horímetro */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Último Horímetro (h)</label>
                            <input
                                type="number"
                                name="ultimoHorimetro"
                                value={formData.ultimoHorimetro}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Horímetro Atual */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Horímetro Atual (h)</label>
                            <input
                                type="number"
                                name="horimetroAtual"
                                value={formData.horimetroAtual}
                                onChange={handleChange}
                                className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Intervalo (h)</label>
                        <input
                            type="number"
                            name="intervalo"
                            value={formData.intervalo}
                            onChange={handleChange}
                            required
                            className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Data da Atualização</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="dataAtualizacao"
                                value={formData.dataAtualizacao}
                                onChange={handleChange}
                                className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            />
                            <Calendar className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                    </div>

                    <div className="pt-4 border-t border-border-color flex justify-end gap-3">
                        <Link href="/dashboard/pcm/preventivas">
                            <button type="button" className="px-6 py-3 rounded-lg border border-border-color text-gray-500 hover:text-foreground font-medium hover:bg-surface-highlight transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50">
                            {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

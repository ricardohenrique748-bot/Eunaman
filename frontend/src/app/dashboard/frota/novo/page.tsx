
'use client'

import { createVeiculo } from '@/app/actions/frota-actions'
import { ArrowLeft, Save, Truck, Info, Clock, Route, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { DocCard } from './components/DocCard'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoVeiculoPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await createVeiculo(formData)
            if (result.success) {
                router.push('/dashboard/admin')
            } else {
                alert(result.error || 'Erro ao criar veículo')
            }
        } catch (err) {
            console.error(err)
            alert('Erro inesperado ao salvar veículo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            {/* Cabeçalho de Navegação */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard/admin"
                        className="p-2.5 rounded-xl border border-border-color bg-surface hover:bg-surface-highlight text-gray-400 hover:text-foreground transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Novo Veículo</h1>
                        <p className="text-sm text-gray-500">Cadastre um novo veículo ou máquina na frota da Eunaman</p>
                    </div>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Coluna Principal: Dados do Veículo */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Seção 1: Informações Gerais */}
                        <div className="bg-surface border border-border-color rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Info className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-foreground">Informações Gerais</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                        Placa <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="placa" 
                                        placeholder="ABC1234" 
                                        required 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1 font-sans">Código Interno</label>
                                    <input 
                                        name="codigoInterno" 
                                        placeholder="EX: 320L-01" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Fabricante</label>
                                    <input 
                                        name="fabricante" 
                                        placeholder="EX: Caterpillar, Scania, Toyota" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Modelo</label>
                                    <input 
                                        name="modelo" 
                                        placeholder="EX: 320L, G450" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Ano de Fabricação</label>
                                    <input 
                                        name="ano" 
                                        type="number" 
                                        placeholder={new Date().getFullYear().toString()} 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Tipo de Veículo *</label>
                                    <select 
                                        name="tipo" 
                                        defaultValue="LEVE"
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="LEVE">Leve (Carro / Caminhonete)</option>
                                        <option value="PESADO">Pesado (Caminhão / Ônibus)</option>
                                        <option value="MAQUINA">Máquina (Escavadeira / Trator)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Categoria *</label>
                                    <select 
                                        name="categoria" 
                                        defaultValue="PROPRIO"
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="PROPRIO">Próprio</option>
                                        <option value="ALUGADO">Alugado</option>
                                        <option value="TERCEIRO">Terceiro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Módulo do Sistema *</label>
                                    <input 
                                        name="modulo" 
                                        defaultValue="BASE" 
                                        required 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Semana Preventiva (1-52)</label>
                                    <input 
                                        name="semanaPreventiva" 
                                        type="number"
                                        min="1"
                                        max="52"
                                        placeholder="EX: 12" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end pb-1 px-1">
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input name="critico" type="checkbox" value="" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                            <span className="ms-3 text-xs font-bold text-gray-500 uppercase">Veículo Crítico</span>
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Seção 2: Medidores Atuais */}
                        <div className="bg-surface border border-border-color rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-foreground">Horímetro & Quilometragem</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> Horímetro Inicial (h)
                                    </label>
                                    <input 
                                        name="horimetro" 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1 flex items-center gap-1.5">
                                        <Route className="w-3 h-3" /> Quilometragem Inicial (km)
                                    </label>
                                    <input 
                                        name="kmAtual" 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1 flex items-center gap-1.5">
                                        Data da Última Leitura
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            name="dataAtualizacao" 
                                            type="date" 
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 px-1">Utilizada como base para os cálculos de manutenção preventiva.</p>
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Documentação */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                                    <FileCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-foreground">Documentos Obrigatórios</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DocCard title="CRLV (Documento do Veículo)" prefix="crlv" />
                                <DocCard title="Laudo Eletromecânico" prefix="laudo" />
                                <DocCard title="Documento do Implemento" prefix="implemento" />
                                <DocCard title="Certificado Tacógrafo" prefix="tacografo" />
                                <DocCard title="CIV / CIPP (Cargas Especiais)" prefix="civ" />
                            </div>
                        </div>

                        {/* Seção 4: Observações */}
                        <div className="bg-surface border border-border-color rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400">
                                    <FileCheck className="w-5 h-5 opacity-50" />
                                </div>
                                <h3 className="font-bold text-foreground">Observações Adicionais</h3>
                            </div>
                            <div className="space-y-4">
                                <textarea 
                                    name="observacoes" 
                                    rows={4}
                                    placeholder="Informações relevantes sobre o veículo, histórico de uso, restrições ou detalhes técnicos adicionais..." 
                                    className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" 
                                />
                                <p className="text-xs text-gray-400">Este campo é opcional e serve para manter o histórico detalhado do ativo.</p>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Lateral: Resumo / Ajuda */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20 overflow-hidden relative group">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg mb-2">Resumo do Cadastro</h4>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                        As informações preenchidas aqui serão utilizadas para o controle de manutenções e documentações da frota.
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                            <div className="p-1.5 bg-white/20 rounded-lg">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <span>Placa visível em todo sistema</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                            <div className="p-1.5 bg-white/20 rounded-lg">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span>Início de ciclo preventivo</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Truck className="w-48 h-48" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {loading ? 'Salvando...' : 'Salvar Veículo'}
                                </button>
                                <Link 
                                    href="/dashboard/admin"
                                    className="w-full text-center py-4 text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
                                >
                                    Cancelar Cadastro
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

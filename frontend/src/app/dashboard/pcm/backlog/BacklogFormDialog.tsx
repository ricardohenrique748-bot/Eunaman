'use client'

import React, { useState } from 'react'
import { createBacklogItem, updateBacklogItem, BacklogItem } from '@/app/actions/backlog-actions'
import { X, Save, Calendar, Truck, FileText, Package, Clock, CheckSquare } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: BacklogItem
}

export default function BacklogFormDialog({ isOpen, onClose, onSuccess, initialData }: Props) {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('EQUIPAMENTO')
    const [formData, setFormData] = useState<Partial<BacklogItem>>(initialData || {
        status: 'ABERTO',
        criticidade: 'NORMAL',
        origem: 'PREVENTIVA',
        diasPendenciaAberta: 0
    })

    const handleChange = (field: keyof BacklogItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            let result;
            if (initialData && initialData.id) {
                // Update
                // @ts-ignore
                result = await updateBacklogItem(initialData.id, formData)
            } else {
                // Create
                // @ts-ignore
                result = await createBacklogItem(formData)
            }

            if (result.success) {
                onSuccess()
                onClose()
            } else {
                alert('Erro ao salvar: ' + result.error)
            }
        } catch (e) {
            console.error(e)
            alert('Erro inesperado')
        } finally {
            setLoading(false)
        }
    }

    // ... (rest of render code)

    // Components
    function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string, value: any, onChange: (v: any) => void, placeholder?: string, type?: string }) {
        let displayValue = value || ''
        if (type === 'date' && value) {
            try {
                if (value instanceof Date) displayValue = value.toISOString().split('T')[0]
                else if (typeof value === 'string' && value.includes('T')) displayValue = value.split('T')[0]
            } catch (e) { }
        }

        return (
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">{label}</label>
                <input
                    type={type}
                    value={displayValue}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-surface border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                />
            </div>
        )
    }

    function Select({ label, value, onChange, options }: { label: string, value: any, onChange: (v: any) => void, options: string[] }) {
        return (
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">{label}</label>
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-surface border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
                >
                    <option value="">Selecione...</option>
                    {options.map((o: string) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </div>
        )
    }

    if (!isOpen) return null

    const tabs = [
        { id: 'EQUIPAMENTO', label: 'Equipamento', icon: Truck },
        { id: 'ATIVIDADE', label: 'Atividade', icon: FileText },
        { id: 'MATERIAL', label: 'Material', icon: Package },
        { id: 'TEMPORAL', label: 'Datas e Prazos', icon: Calendar },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border-color w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                    <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                        {initialData ? 'Editar Item' : 'Nova Pendência'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex min-h-0">
                    {/* Sidebar Tabs */}
                    <div className="w-48 border-r border-border-color bg-surface-highlight/5 p-2 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                                    ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-surface-highlight hover:text-foreground'}
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {activeTab === 'EQUIPAMENTO' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Frota" value={formData.frota} onChange={v => handleChange('frota', v)} placeholder="Ex: CAM-01" />
                                <Input label="TAG" value={formData.tag} onChange={v => handleChange('tag', v)} />
                                <Input label="Tipo" value={formData.tipo} onChange={v => handleChange('tipo', v)} />
                                <Input label="Módulo" value={formData.modulo} onChange={v => handleChange('modulo', v)} />
                                <Input label="Campo / Base" value={formData.campoBase} onChange={v => handleChange('campoBase', v)} />
                                <Select label="Região" value={formData.regiaoProgramacao} onChange={v => handleChange('regiaoProgramacao', v)} options={['Norte', 'Sul', 'Leste', 'Oeste']} />
                            </div>
                        )}

                        {activeTab === 'ATIVIDADE' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Select label="Origem" value={formData.origem} onChange={v => handleChange('origem', v)} options={['PREVENTIVA', 'CORRETIVA', 'INSPECAO', 'MELHORIA']} />
                                    <Select label="Criticidade" value={formData.criticidade} onChange={v => handleChange('criticidade', v)} options={['NORMAL', 'ALTA', 'CRITICO']} />
                                    <Select label="Status" value={formData.status} onChange={v => handleChange('status', v)} options={['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Descrição da Atividade</label>
                                    <textarea
                                        className="w-full h-32 bg-surface border border-border-color rounded-xl p-3 text-xs font-bold outline-none focus:border-primary resize-none"
                                        value={formData.descricaoAtividade || ''}
                                        onChange={e => handleChange('descricaoAtividade', e.target.value)}
                                    />
                                </div>
                                <Input label="Observação" value={formData.observacao} onChange={v => handleChange('observacao', v)} />
                            </div>
                        )}

                        {activeTab === 'MATERIAL' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Número RC" value={formData.numeroRc} onChange={v => handleChange('numeroRc', v)} />
                                <Input label="Número Ordem" value={formData.numeroOrdem} onChange={v => handleChange('numeroOrdem', v)} />
                                <Input label="OS" value={formData.os} onChange={v => handleChange('os', v)} />
                                <Input label="Fornecedor" value={formData.fornecedor} onChange={v => handleChange('fornecedor', v)} />
                                <Input label="Material" value={formData.material} onChange={v => handleChange('material', v)} />
                                <Input label="Situação RC" value={formData.situacaoRc} onChange={v => handleChange('situacaoRc', v)} />
                                <div className="col-span-2">
                                    <Input label="Detalhamento Pedido" value={formData.detalhamentoPedido} onChange={v => handleChange('detalhamentoPedido', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'TEMPORAL' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Data Evidência" type="date" value={formData.dataEvidencia} onChange={v => handleChange('dataEvidencia', v)} />
                                <Input label="Previsão Material" type="date" value={formData.previsaoMaterial} onChange={v => handleChange('previsaoMaterial', v)} />
                                <Input label="Data Programação" type="date" value={formData.dataProgramacao} onChange={v => handleChange('dataProgramacao', v)} />
                                <Input label="Mão de Obra" value={formData.maoDeObra} onChange={v => handleChange('maoDeObra', v)} />
                                <Input label="Tempo Exec. Previsto" value={formData.tempoExecucaoPrevisto} onChange={v => handleChange('tempoExecucaoPrevisto', v)} />
                                <Input label="Semana" value={formData.semana} onChange={v => handleChange('semana', v)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-surface-highlight/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <Save className="w-4 h-4" />
                        Salvar Item
                    </button>
                </div>
            </div>
        </div>
    )
}

function Input({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-surface border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
            />
        </div>
    )
}

function Select({ label, value, onChange, options }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">{label}</label>
            <select
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-surface border border-border-color rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary transition-colors"
            >
                <option value="">Selecione...</option>
                {options.map((o: string) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    )
}

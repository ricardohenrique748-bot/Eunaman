'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, ArrowLeft, Send, Truck, User, Calendar, Clock, Camera, X, ImagePlus } from 'lucide-react'
import Link from 'next/link'

type StatusType = 'OK' | 'NC' | 'NA' | null

interface ChecklistItem {
    id: string
    texto: string
    categoria: string | null
    obrigatorio: boolean
    ordem: number
}

interface Formulario {
    id: string
    nome: string
    descricao: string | null
}

interface Veiculo {
    id: string
    codigoInterno: string
    placa: string | null
    modelo: string
}

interface Props {
    formulario: Formulario
    grouped: Record<string, ChecklistItem[]>
    tipoLabel: string
    veiculos: Veiculo[]
    usuarioNome: string
}

const STATUS_CONFIG = {
    OK: { label: 'Conforme', color: 'bg-emerald-500 text-white ring-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-600' },
    NC: { label: 'Não Conforme', color: 'bg-red-500 text-white ring-red-500', icon: XCircle, textColor: 'text-red-600' },
    NA: { label: 'N/A', color: 'bg-gray-400 text-white ring-gray-400', icon: MinusCircle, textColor: 'text-gray-500' },
}

export default function ChecklistForm({ formulario, grouped, tipoLabel, veiculos, usuarioNome }: Props) {
    const [respostas, setRespostas] = useState<Record<string, StatusType>>({})
    const [veiculoId, setVeiculoId] = useState('')
    const [responsavel, setResponsavel] = useState(usuarioNome)
    const [dataHora, setDataHora] = useState(() => {
        const now = new Date()
        return {
            data: now.toISOString().slice(0, 10),
            hora: now.toTimeString().slice(0, 5)
        }
    })
    const [observacoes, setObservacoes] = useState<Record<string, string>>({})
    const [fotos, setFotos] = useState<Record<string, string[]>>({})
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
    const [obsGerais, setObsGerais] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const allItems = Object.values(grouped).flat()
    const totalItems = allItems.length
    const answered = allItems.filter(i => respostas[i.id] !== null && respostas[i.id] !== undefined).length
    const ncCount = allItems.filter(i => respostas[i.id] === 'NC').length
    const progress = Math.round((answered / totalItems) * 100)

    const setStatus = (itemId: string, status: StatusType) => {
        setRespostas(p => ({ ...p, [itemId]: p[itemId] === status ? null : status }))
    }

    const addFoto = (itemId: string, file: File) => {
        const current = fotos[itemId] || []
        if (current.length >= 4) return
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            setFotos(p => ({ ...p, [itemId]: [...(p[itemId] || []), base64] }))
        }
        reader.readAsDataURL(file)
    }

    const removeFoto = (itemId: string, idx: number) => {
        setFotos(p => ({ ...p, [itemId]: (p[itemId] || []).filter((_, i) => i !== idx) }))
    }

    const toggleCollapse = (cat: string) => {
        setCollapsed(p => ({ ...p, [cat]: !p[cat] }))
    }

    const handleSubmit = async () => {
        if (!veiculoId) {
            alert('Por favor, selecione o veículo/placa.')
            return
        }
        if (!responsavel.trim()) {
            alert('Por favor, informe o nome do responsável.')
            return
        }
        const unanswered = allItems.filter(i => !respostas[i.id] && i.obrigatorio)
        if (unanswered.length > 0) {
            alert(`Por favor, responda todos os itens obrigatórios. Faltam ${unanswered.length} item(ns).`)
            return
        }
        setLoading(true)
        // TODO: save to backend
        await new Promise(r => setTimeout(r, 1000))
        setSubmitted(true)
        setLoading(false)
    }

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto text-center py-20 animate-in fade-in duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">Checklist Enviado!</h2>
                <p className="text-gray-500 font-medium mb-2">
                    {answered} itens respondidos · <span className="text-red-500 font-bold">{ncCount} não conformes</span>
                </p>
                <p className="text-sm text-gray-400 mb-8">O checklist foi registrado com sucesso.</p>
                <Link href="/dashboard/pcm/checklist" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Checklist
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pcm/checklist/novo" className="w-10 h-10 rounded-xl bg-surface-highlight border border-border-color flex items-center justify-center hover:border-primary/40 transition-all">
                    <ArrowLeft className="w-4 h-4 text-foreground" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-foreground tracking-tight">{formulario.nome}</h1>
                    <p className="text-sm text-gray-500 font-medium">{totalItems} itens de verificação</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-primary">{progress}%</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{answered}/{totalItems}</div>
                </div>
            </div>

            {/* Identification Card */}
            <div className="dashboard-card p-5 space-y-4">
                <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Identificação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Placa / Veículo */}
                    <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Truck className="w-3 h-3" /> Placa / Equipamento *</label>
                        <select
                            value={veiculoId}
                            onChange={e => setVeiculoId(e.target.value)}
                            required
                            className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">Selecione o veículo...</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.codigoInterno}{v.placa ? ` · ${v.placa}` : ''} — {v.modelo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Data *</label>
                        <input
                            type="date"
                            value={dataHora.data}
                            onChange={e => setDataHora(p => ({ ...p, data: e.target.value }))}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Hora */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Hora *</label>
                        <input
                            type="time"
                            value={dataHora.hora}
                            onChange={e => setDataHora(p => ({ ...p, hora: e.target.value }))}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Responsável */}
                    <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Nome do Responsável *</label>
                        <input
                            type="text"
                            value={responsavel}
                            onChange={e => setResponsavel(e.target.value)}
                            placeholder="Nome completo do motorista/operador"
                            className="w-full bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-sm font-semibold text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-surface-highlight rounded-full overflow-hidden border border-border-color/50">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stats */}
            {answered > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="dashboard-card p-4 text-center">
                        <div className="text-xl font-black text-emerald-500">{allItems.filter(i => respostas[i.id] === 'OK').length}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Conformes</div>
                    </div>
                    <div className="dashboard-card p-4 text-center">
                        <div className="text-xl font-black text-red-500">{ncCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Não Conformes</div>
                    </div>
                    <div className="dashboard-card p-4 text-center">
                        <div className="text-xl font-black text-gray-400">{allItems.filter(i => respostas[i.id] === 'NA').length}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">N/A</div>
                    </div>
                </div>
            )}

            {/* Checklist Categories */}
            {Object.entries(grouped).map(([categoria, items]) => (
                <div key={categoria} className="dashboard-card overflow-hidden">
                    {/* Category Header */}
                    <button
                        onClick={() => toggleCollapse(categoria)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-highlight/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="font-black text-sm text-foreground uppercase tracking-widest">{categoria}</span>
                            <span className="text-[10px] font-bold text-gray-400 bg-surface-highlight px-2 py-0.5 rounded-full border border-border-color/50">
                                {items.filter(i => respostas[i.id]).length}/{items.length}
                            </span>
                        </div>
                        {collapsed[categoria] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Items */}
                    {!collapsed[categoria] && (
                        <div className="divide-y divide-border-color/50 border-t border-border-color/50">
                            {items.map((item, idx) => {
                                const status = respostas[item.id]
                                const isNC = status === 'NC'
                                return (
                                    <div key={item.id} className={`px-5 py-4 transition-colors ${isNC ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                                        <div className="flex items-start gap-4">
                                            {/* Item number */}
                                            <div className="w-7 h-7 rounded-lg bg-surface-highlight border border-border-color flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-[10px] font-black text-gray-500">{idx + 1}</span>
                                            </div>

                                            {/* Item text */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground leading-snug">
                                                    {item.texto}
                                                    {item.obrigatorio && <span className="text-red-400 ml-1 text-xs">*</span>}
                                                </p>

                                                {/* Status buttons */}
                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                    {(['OK', 'NC', 'NA'] as StatusType[]).map(s => {
                                                        const cfg = STATUS_CONFIG[s!]
                                                        const Icon = cfg.icon
                                                        const isSelected = status === s
                                                        return (
                                                            <button
                                                                key={s}
                                                                onClick={() => setStatus(item.id, s)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ring-2 ${isSelected
                                                                    ? `${cfg.color} ring-opacity-50 scale-105 shadow-lg`
                                                                    : 'bg-surface-highlight text-gray-500 ring-transparent hover:ring-1 hover:ring-border-color'
                                                                    }`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                                {cfg.label}
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                {/* NC: Observation + Photos */}
                                                {isNC && (
                                                    <div className="mt-3 space-y-3">
                                                        <textarea
                                                            value={observacoes[item.id] || ''}
                                                            onChange={e => setObservacoes(p => ({ ...p, [item.id]: e.target.value }))}
                                                            placeholder="Descreva o problema encontrado..."
                                                            rows={2}
                                                            className="w-full text-sm bg-white dark:bg-surface border border-red-200 dark:border-red-900/30 rounded-xl px-3 py-2 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800 resize-none"
                                                        />

                                                        {/* Photo upload section */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <Camera className="w-3 h-3" /> Fotos ({(fotos[item.id] || []).length}/4)
                                                                </span>
                                                                {(fotos[item.id] || []).length < 4 && (
                                                                    <label className="cursor-pointer flex items-center gap-1.5 text-[11px] font-black text-red-500 hover:text-red-700 transition-colors">
                                                                        <ImagePlus className="w-4 h-4" />
                                                                        Adicionar foto
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            capture="environment"
                                                                            className="hidden"
                                                                            onChange={e => {
                                                                                const file = e.target.files?.[0]
                                                                                if (file) addFoto(item.id, file)
                                                                                e.target.value = ''
                                                                            }}
                                                                        />
                                                                    </label>
                                                                )}
                                                            </div>

                                                            {/* Thumbnails */}
                                                            {(fotos[item.id] || []).length > 0 && (
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {(fotos[item.id] || []).map((src, photoIdx) => (
                                                                        <div key={photoIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-red-200 dark:border-red-900/40 shadow-md group/photo">
                                                                            <img src={src} alt={`foto-${photoIdx + 1}`} className="w-full h-full object-cover" />
                                                                            <button
                                                                                onClick={() => removeFoto(item.id, photoIdx)}
                                                                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-lg"
                                                                            >
                                                                                <X className="w-3 h-3 text-white stroke-[3px]" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Observações Gerais */}
            <div className="dashboard-card p-5 space-y-3">
                <h3 className="font-black text-sm text-foreground uppercase tracking-widest">Observações Gerais</h3>
                <textarea
                    value={obsGerais}
                    onChange={e => setObsGerais(e.target.value)}
                    placeholder="Observações adicionais do executante do checklist..."
                    rows={3}
                    className="w-full text-sm bg-surface-highlight border border-border-color rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={loading || answered === 0}
                className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : `Finalizar Checklist (${answered}/${totalItems})`}
            </button>

            <p className="text-center text-[11px] text-gray-400 font-medium pb-8">
                * Itens obrigatórios devem ser respondidos antes de finalizar
            </p>
        </div>
    )
}

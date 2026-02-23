'use client'

import { updateOrdemServico } from '@/app/actions/pcm-actions'
import { ArrowLeft, Calendar, Clock, CheckCircle2, List, Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VeiculoDropdown {
    id: string;
    codigoInterno: string;
    modelo: string;
    placa: string | null;
}

interface OsMotivo {
    id: string;
    nome: string;
}

interface OsSubSistema {
    id: string;
    nome: string;
    sistemaId: string;
}

interface OsSistema {
    id: string;
    nome: string;
    subSistemas: OsSubSistema[];
}

interface OrdemServicoData {
    id: string;
    veiculoId: string;
    tipoOS: string;
    status: string;
    descricao: string;
    dataAbertura: Date;
    dataConclusao: Date | null;
    horimetro: number | null;
    motivoId: string | null;
    sistemaId: string | null;
    subSistemaId: string | null;
    local: string | null;
    modulo: string | null;
    veiculoReservaId: string | null;
}

export default function EditarOSForm({ veiculos, osOptions, initialData }: {
    veiculos: VeiculoDropdown[],
    osOptions: { motivos: OsMotivo[], sistemas: OsSistema[] },
    initialData: OrdemServicoData
}) {
    const router = useRouter()
    const [selectedSistemaId, setSelectedSistemaId] = useState<string>(initialData.sistemaId || '')
    const [descricao, setDescricao] = useState(initialData.descricao)
    const [isSuccess, setIsSuccess] = useState(false)
    const [statusOS, setStatusOS] = useState(initialData.status === 'CONCLUIDA' ? 'FECHADA' : initialData.status)

    // Searchable Vehicle Selection
    const [searchTerm, setSearchTerm] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoDropdown | undefined>(() =>
        veiculos.find(v => v.id === initialData.veiculoId)
    )

    const filteredVeiculos = veiculos.filter(v =>
        v.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.placa && v.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredSubSistemas = osOptions.sistemas.find(s => s.id === selectedSistemaId)?.subSistemas || []

    const handleDescricaoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            const cursorPosition = e.currentTarget.selectionStart;
            const textBeforeCursor = descricao.slice(0, cursorPosition);
            const textAfterCursor = descricao.slice(cursorPosition);

            const lines = textBeforeCursor.split('\n');
            const lastLine = lines[lines.length - 1];

            const match = lastLine.match(/^(\d+)([.\-)]\s*)(.*)$/);

            if (match) {
                e.preventDefault();
                if (match[3].trim() === '') {
                    const withoutNumber = textBeforeCursor.slice(0, cursorPosition - lastLine.length);
                    const newText = withoutNumber + '\n' + textAfterCursor;
                    setDescricao(newText);
                    setTimeout(() => {
                        const ta = document.getElementsByName('descricao')[0] as HTMLTextAreaElement;
                        if (ta) ta.selectionStart = ta.selectionEnd = withoutNumber.length + 1;
                    }, 0);
                    return;
                }
                const currentNumber = parseInt(match[1], 10);
                const separator = match[2];
                const insertText = `\n${currentNumber + 1}${separator}`;
                const newText = textBeforeCursor + insertText + textAfterCursor;
                setDescricao(newText);
                setTimeout(() => {
                    const ta = document.getElementsByName('descricao')[0] as HTMLTextAreaElement;
                    if (ta) {
                        const newPos = cursorPosition + insertText.length;
                        ta.selectionStart = ta.selectionEnd = newPos;
                    }
                }, 0);
            }
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">O.S. Atualizada com Sucesso!</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                        As alterações foram salvas no histórico do sistema.
                    </p>
                </div>

                <div className="flex justify-center pt-8">
                    <Link href="/dashboard/pcm/os">
                        <button className="flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
                            <List className="w-5 h-5" />
                            Ver Histórico
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/pcm/os" className="text-gray-500 hover:text-primary text-xs font-bold flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar ao Controle
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Editar O.S.</h1>
                    <p className="text-gray-500 text-sm mt-1">Atualize as informações da Ordem de Serviço #{initialData.id.slice(-5)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Clock className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="dashboard-card p-8">
                <form action={async (formData) => {
                    const res = await updateOrdemServico(initialData.id, formData)
                    if (res.success) {
                        setIsSuccess(true)
                    } else {
                        alert(res.error || 'Erro ao atualizar a OS.')
                    }
                }} className="space-y-10">

                    {/* Section: Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Informações Básicas</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 relative">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Veículo / Placa *</label>
                                <div className="relative group">
                                    <input
                                        type="hidden"
                                        name="veiculoId"
                                        value={selectedVeiculo?.id || ''}
                                        required
                                    />
                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedVeiculo ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary font-black">{selectedVeiculo.codigoInterno}</span>
                                                    <span className="text-gray-400">|</span>
                                                    <span>{selectedVeiculo.modelo} ({selectedVeiculo.placa || 'Interno'})</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 font-medium italic">Selecione o Veículo</span>
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-color rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-border-color bg-surface-highlight/30 flex items-center gap-3">
                                                <Search className="w-4 h-4 text-primary shrink-0" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Buscar por placa, código ou modelo..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-transparent border-none outline-none text-xs font-bold text-foreground placeholder:text-gray-500"
                                                />
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {filteredVeiculos.length > 0 ? (
                                                    filteredVeiculos.map((v) => (
                                                        <div
                                                            key={v.id}
                                                            onClick={() => {
                                                                setSelectedVeiculo(v)
                                                                setIsDropdownOpen(false)
                                                                setSearchTerm('')
                                                            }}
                                                            className={`px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-4 group ${selectedVeiculo?.id === v.id ? 'bg-primary/5' : ''}`}
                                                        >
                                                            <div className="w-12 py-1 rounded-lg bg-surface-highlight border border-border-color flex items-center justify-center group-hover:border-primary/40 transition-all bg-gray-500/5">
                                                                <span className="text-[10px] font-black text-foreground">{v.codigoInterno}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-foreground uppercase">{v.placa || 'INTERNO'}</span>
                                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{v.modelo}</span>
                                                            </div>
                                                            {selectedVeiculo?.id === v.id && (
                                                                <div className="ml-auto">
                                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-gray-500 text-xs italic font-medium">
                                                        Nenhum veículo localizado
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Tipo de Manutenção *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['CORRETIVA', 'PREVENTIVA', 'INSPECAO', 'MELHORIA'].map(tipo => (
                                        <label key={tipo} className="cursor-pointer">
                                            <input type="radio" name="tipoOS" value={tipo} className="peer hidden" defaultChecked={tipo === initialData.tipoOS} />
                                            <div className="text-center py-3 rounded-xl border border-border-color font-bold text-[10px] transition-all peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:bg-surface-highlight uppercase tracking-tighter">
                                                {tipo}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Data/Hora Abertura *</label>
                                <div className="relative">
                                    <input type="datetime-local" name="dataAbertura" defaultValue={new Date(initialData.dataAbertura).toISOString().slice(0, 16)} required className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11" />
                                    <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">
                                    Data/Hora Fechamento {statusOS === 'FECHADA' && '*'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        name="dataConclusao"
                                        defaultValue={initialData.dataConclusao ? new Date(initialData.dataConclusao).toISOString().slice(0, 16) : ''}
                                        required={statusOS === 'FECHADA'}
                                        className="w-full bg-background border border-primary/30 rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11"
                                    />
                                    <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Status</label>
                                <select
                                    name="status"
                                    value={statusOS}
                                    onChange={(e) => setStatusOS(e.target.value)}
                                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ABERTA">ABERTA</option>
                                    <option value="EM_EXECUCAO">EM EXECUÇÃO</option>
                                    <option value="PLANEJADA">PLANEJADA</option>
                                    <option value="FECHADA">FECHADA</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Horímetro</label>
                                <input type="number" name="horimetro" defaultValue={initialData.horimetro || ''} placeholder="Ex: 1450" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Detailed Diagnosis */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Diagnóstico & Local</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Motivo / Causa</label>
                                <select name="motivoId" defaultValue={initialData.motivoId || ''} className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione o Motivo</option>
                                    {osOptions.motivos.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Sistema Afetado</label>
                                <select
                                    name="sistemaId"
                                    value={selectedSistemaId}
                                    onChange={(e) => setSelectedSistemaId(e.target.value)}
                                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Selecione o Sistema</option>
                                    {osOptions.sistemas.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Sub-Sistema</label>
                                <select name="subSistemaId" defaultValue={initialData.subSistemaId || ''} className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione o Sub-Sistema</option>
                                    {filteredSubSistemas.map((ss: OsSubSistema) => (
                                        <option key={ss.id} value={ss.id}>{ss.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Descrição Detalhada do Problema *</label>
                            <textarea
                                name="descricao"
                                rows={6}
                                required
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                onKeyDown={handleDescricaoKeyDown}
                                className="w-full bg-background border border-border-color rounded-xl px-4 py-4 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Section: Logistics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Logística & Apoio</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Veículo Reserva Enviado</label>
                                    <select name="veiculoReservaId" defaultValue={initialData.veiculoReservaId || ''} className="w-full bg-background border border-primary/30 rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="">Selecione o reserva...</option>
                                        {veiculos.map((v) => (
                                            <option key={v.id} value={v.id}>{v.codigoInterno} - {v.placa}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Local do Equipamento</label>
                                    <input type="text" name="local" defaultValue={initialData.local || ''} placeholder="Ex: Frente 02, Oficina Sul..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Módulo / Equipamento Específico</label>
                                    <input type="text" name="modulo" defaultValue={initialData.modulo || ''} placeholder="Ex: Motor, Caçamba, Implemento..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-color flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/dashboard/pcm/os" className="w-full sm:w-auto">
                            <button type="button" className="w-full px-8 py-3.5 rounded-xl border border-border-color text-gray-400 font-bold hover:bg-surface-highlight transition-all uppercase text-[10px] tracking-widest">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-12 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] uppercase text-[10px] tracking-widest">
                            <Clock className="w-4 h-4 stroke-[3px]" />
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

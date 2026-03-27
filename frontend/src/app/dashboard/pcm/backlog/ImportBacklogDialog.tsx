'use client'

import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, Info, AlertTriangle, Upload, X, FileText, CheckCircle2 } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportBacklogDialog({ isOpen, onClose, onSuccess, onImport }: Props & { onImport?: (items: any[]) => Promise<void> }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [previewData, setPreviewData] = useState<any[] | null>(null)
    const [showInstructions, setShowInstructions] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            
            try {
                const rawData = await processExcel(selectedFile)
                const mappedItems = mapDataToBacklogItems(rawData)
                setPreviewData(mappedItems.slice(0, 5)) // Show first 5 rows
            } catch (err) {
                console.error(err)
            }
        }
    }

    const downloadTemplate = () => {
        const headers = [
            'Semana', 'Mes', 'Ano', 'Data Evidencia', 'Modulo', 'Regiao Programacao', 
            'Frota', 'TAG', 'Unidade', 'Tipo', 'Descricao Atividade', 'Origem', 
            'Criticidade', 'Tempo Execucao Previsto', 'Campo Base', 'OS', 'Material', 
            'Numero RC', 'Numero Ordem', 'Fornecedor', 'Data RC', 'Detalhamento Pedido',
            'Data Necessidade Material', 'Tipo Pedido', 'Previsao Material', 'Situacao RC',
            'Data Programacao', 'Mao de Obra', 'Status Programacao', 'Previsao Conclusao',
            'Data Conclusao', 'Status', 'Observacao'
        ]
        
        const worksheet = XLSX.utils.aoa_to_sheet([headers])
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'modelo_backlog_eunaman.xlsx')
    }

    const processExcel = async (file: File) => {
        return new Promise<any[]>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer)
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
                    resolve(jsonData)
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = (err) => reject(err)
            reader.readAsArrayBuffer(file)
        })
    }

    const mapDataToBacklogItems = (data: any[]) => {
        // Safe date parse helper to handle string dates from Excel, e.g. "DD/MM/YYYY" or valid Date instances
        const parseDate = (val: any) => {
            if (!val) return undefined;
            if (val instanceof Date) {
                if (!isNaN(val.getTime())) return val;
                return undefined;
            }
            if (typeof val === 'number') {
                const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                if (!isNaN(date.getTime())) return date;
                return undefined;
            }
            if (typeof val === 'string') {
                const parts = val.trim().split(/[\/\-]/);
                if (parts.length === 3) {
                    // Assuming DD/MM/YYYY
                    if (parts[0].length <= 2 && parts[2].length === 4) {
                        const d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T12:00:00Z`);
                        if (!isNaN(d.getTime())) return d;
                    }
                    // Assuming YYYY/MM/DD
                    else if (parts[0].length === 4) {
                        const d = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T12:00:00Z`);
                        if (!isNaN(d.getTime())) return d;
                    }
                }
                const d = new Date(val);
                if (!isNaN(d.getTime())) return d;
            }
            return undefined;
        }

        return data.map(row => {
            // Helper to find key case-insensitively and handle variations
            // We create a map of normalized keys to values for faster lookup
            const normalizedRow: Record<string, any> = {}
            Object.keys(row).forEach(k => {
                const cleanKey = k.toLowerCase().trim()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .replace(/[^a-z0-9]/g, "") // Remove special chars
                normalizedRow[cleanKey] = row[k]
            })

            const get = (keyPattern: string) => {
                // keyPattern should be the clean version (lowercase, no accents, no spaces)
                return normalizedRow[keyPattern]
            }

            return {
                semana: get('semana')?.toString(),
                mes: get('mes')?.toString(),
                ano: get('ano')?.toString(),
                dataEvidencia: parseDate(get('dataevidencia') || get('datadaevidencia') || get('data') || get('datadeabertura') || get('dataabertura') || get('dataevidenc')),
                modulo: get('modulo')?.toString(),
                regiaoProgramacao: get('regiaoxprogramacao') || get('regiaoprogramacao'),
                diasPendenciaAberta: Number(get('diaspendencia') || get('diasdependenciaaberta') || 0),
                frota: get('frota')?.toString() || get('placa')?.toString() || get('equipamento')?.toString(),
                tag: get('tag')?.toString(),
                tipo: get('tipo')?.toString(),
                descricaoAtividade: (get('descricao') || get('descricaodaatividade') || get('descricaodoproblema') || get('atividade') || get('sintoma') || get('problema') || get('falha') || get('historico') || get('descricaofalha'))?.toString(),
                origem: get('origem')?.toString(),
                criticidade: get('criticidade')?.toString() || get('grau')?.toString(),
                tempoExecucaoPrevisto: get('tempoexecucao')?.toString() || get('tempodeexecucaoprevisto')?.toString(),
                campoBase: get('campobase')?.toString(),
                os: get('os')?.toString(),
                material: get('material')?.toString(),
                numeroRc: get('nrc')?.toString() || get('numerorc')?.toString() || get('reqcompras')?.toString(),
                numeroOrdem: get('nordem')?.toString() || get('numeroordem')?.toString() || get('npedido')?.toString() || get('numeropedido')?.toString() || get('descrevaasolicitacao')?.toString(),
                fornecedor: get('fornecedor')?.toString(),
                dataRc: parseDate(get('datarc')),
                detalhamentoPedido: get('detalhamento') || get('detalhamentodopedido'),
                dataNecessidadeMaterial: parseDate(get('datanecmaterial') || get('datanecessidadematerial') || get('datanecessidadedomaterial')),
                tipoPedido: get('tipopedido')?.toString(),
                previsaoMaterial: parseDate(get('previsaomaterial') || get('previsaodomaterial')),
                situacaoRc: get('situacaorc')?.toString(),
                diasAberturaReqCompras: Number(get('diasabertura') || get('diasaberturapendenciareqcompras') || 0),
                dataProgramacao: parseDate(get('dataprogramacao') || get('datadeprogramacao')),
                maoDeObra: get('maodeobra')?.toString(),
                deltaEvidenciaProgramacao: Number(get('delta') || get('deltaevidenciavsdataprogramacao') || get('deltaevidencia') || 0),
                statusProgramacao: get('statusprogramacao') || get('situacaoprogramacao'),
                previsaoConclusaoPendencia: parseDate(get('previsaoconclusao') || get('previsaodeconclusaopendencia')),
                dataConclusaoPendencia: parseDate(get('dataconclusao') || get('dataconclusaodapendencia')),
                diasResolucaoPendencia: Number(get('diasresolucao') || get('diasderesolucaodapendencia') || 0),
                status: get('status')?.toString(),
                unidade: get('unidade')?.toString() || get('projeto')?.toString(),
                observacao: get('observacao') || get('obeservacao')
            }
        })
    }

    const handleImport = async () => {
        if (!file) return
        setUploading(true)

        try {
            // Emulate progress
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return prev + 10
                })
            }, 100)

            let items: any[] = []
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const rawData = await processExcel(file)
                items = mapDataToBacklogItems(rawData)
            } else {
                // PDF import not supported yet
                alert('Importação de PDF requer processamento específico. Por favor use Excel.')
                setUploading(false)
                clearInterval(interval)
                return
            }

            clearInterval(interval)
            setProgress(100)

            if (onImport) {
                await onImport(items)
            } else {
                // Fallback for simulation
                await new Promise(r => setTimeout(r, 500))
            }

            setUploading(false)
            onSuccess()
            onClose()

        } catch (error) {
            console.error(error)
            alert('Erro ao processar arquivo.')
            setUploading(false)
            setProgress(0)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border-color w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                    <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Importar Backlog
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={downloadTemplate}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-black uppercase"
                            title="Baixar Modelo Excel"
                        >
                            <Download className="w-4 h-4" />
                            Modelo
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    {!file ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">
                                    Selecione o arquivo Excel
                                </h4>
                                <p className="text-xs text-gray-400 max-w-[250px] mx-auto">
                                    Certifique-se que as colunas correspondam aos campos do sistema. Baixe o modelo se tiver dúvidas.
                                </p>
                            </div>

                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />

                            <label
                                htmlFor="file-upload"
                                className="px-8 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-primary/20"
                            >
                                Escolher Arquivo
                            </label>

                            <button 
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1"
                            >
                                <Info className="w-3 h-3" />
                                {showInstructions ? 'Ocultar instruções' : 'Ver campos suportados'}
                            </button>

                            {showInstructions && (
                                <div className="w-full text-left bg-surface-highlight/20 p-4 rounded-xl space-y-2 border border-border-color">
                                    <h5 className="text-[10px] font-black uppercase text-foreground">Mapeamento Inteligente:</h5>
                                    <ul className="text-[10px] text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                                        <li>• Frota / Placa / Equip.</li>
                                        <li>• TAG / Local Inst.</li>
                                        <li>• Data / Evidência</li>
                                        <li>• Descrição / Falha</li>
                                        <li>• Criticidade / Grau</li>
                                        <li>• Unidade / Projeto</li>
                                    </ul>
                                    <p className="text-[9px] text-gray-500 italic mt-2">
                                        *O sistema tenta identificar automaticamente colunas com nomes similares.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                                    ) : (
                                        <CheckCircle2 className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-foreground truncate">
                                        {file.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB • Pronto para importar
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setPreviewData(null); }}
                                    className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase"
                                >
                                    Trocar
                                </button>
                            </div>

                            {previewData && (
                                <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        Prévia dos Dados (Top 5)
                                    </h5>
                                    <div className="bg-surface rounded-xl border border-border-color overflow-hidden">
                                        <table className="w-full text-[10px]">
                                            <thead className="bg-surface-highlight/10 border-b border-border-color">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold text-gray-500">Frota</th>
                                                    <th className="px-3 py-2 text-left font-bold text-gray-500">Atividade</th>
                                                    <th className="px-3 py-2 text-left font-bold text-gray-500">Unidade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-color">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-surface-highlight/5">
                                                        <td className="px-3 py-2 font-mono text-primary">{row.frota || '-'}</td>
                                                        <td className="px-3 py-2 truncate max-w-[150px]">{row.descricaoAtividade || '-'}</td>
                                                        <td className="px-3 py-2">{row.unidade || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {uploading && (
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-primary animate-pulse">Processando dados...</span>
                                        <span className="text-gray-500">{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-surface-highlight rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border-color flex justify-between items-center bg-surface-highlight/5">
                    <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                            Evite duplicatas
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!file || uploading}
                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Importando...' : 'Iniciar Importação'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import React, { useState } from 'react'
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportBacklogDialog({ isOpen, onClose, onSuccess, onImport }: Props & { onImport?: (items: any[]) => Promise<void> }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
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
                dataEvidencia: get('dataevidencia') || get('datadaevidencia') || get('data') || get('datadeabertura'),
                modulo: get('modulo')?.toString(),
                regiaoProgramacao: get('regiaoxprogramacao') || get('regiaoprogramacao'),
                diasPendenciaAberta: Number(get('diaspendencia') || get('diasdependenciaaberta') || 0),
                frota: get('frota')?.toString() || get('placa')?.toString() || get('equipamento')?.toString(),
                tag: get('tag')?.toString(),
                tipo: get('tipo')?.toString(),
                descricaoAtividade: get('descricao') || get('descricaodaatividade'),
                origem: get('origem')?.toString(),
                criticidade: get('criticidade')?.toString() || get('grau')?.toString(),
                tempoExecucaoPrevisto: get('tempoexecucao')?.toString() || get('tempodeexecucaoprevisto')?.toString(),
                campoBase: get('campobase')?.toString(),
                os: get('os')?.toString(),
                material: get('material')?.toString(),
                numeroRc: get('nrc')?.toString() || get('numerorc')?.toString() || get('reqcompras')?.toString(),
                numeroOrdem: get('nordem')?.toString() || get('numeroordem')?.toString() || get('npedido')?.toString() || get('numeropedido')?.toString() || get('descrevaasolicitacao')?.toString(),
                fornecedor: get('fornecedor')?.toString(),
                dataRc: get('datarc'),
                detalhamentoPedido: get('detalhamento') || get('detalhamentodopedido'),
                dataNecessidadeMaterial: get('datanecmaterial') || get('datanecessidadematerial') || get('datanecessidadedomaterial'),
                tipoPedido: get('tipopedido')?.toString(),
                previsaoMaterial: get('previsaomaterial') || get('previsaodomaterial'),
                situacaoRc: get('situacaorc')?.toString(),
                diasAberturaReqCompras: Number(get('diasabertura') || get('diasaberturapendenciareqcompras') || 0),
                dataProgramacao: get('dataprogramacao') || get('datadeprogramacao'),
                maoDeObra: get('maodeobra')?.toString(),
                deltaEvidenciaProgramacao: Number(get('delta') || get('deltaevidenciavsdataprogramacao') || get('deltaevidencia') || 0),
                statusProgramacao: get('statusprogramacao') || get('situacaoprogramacao'),
                previsaoConclusaoPendencia: get('previsaoconclusao') || get('previsaodeconclusaopendencia'),
                dataConclusaoPendencia: get('dataconclusao') || get('dataconclusaodapendencia'),
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
                        Importar Backlog
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${file ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'} transition-colors`}>
                        {file ? <CheckCircle2 className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-foreground">
                            {file ? file.name : 'Selecione o arquivo Excel'}
                        </h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                            Arraste e solte ou clique para selecionar o arquivo de backlog (.xlsx) para importação.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />

                    {!file && (
                        <label
                            htmlFor="file-upload"
                            className="px-6 py-2 bg-surface text-foreground border border-border-color hover:bg-surface-highlight rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
                        >
                            Escolher Arquivo
                        </label>
                    )}

                    {uploading && (
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                                <span>Processando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-surface-highlight/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || uploading}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Importar Dados
                    </button>
                </div>
            </div>
        </div>
    )
}

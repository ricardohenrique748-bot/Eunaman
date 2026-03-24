'use client'

import { useState } from 'react'
import { Upload, X, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { importOrdensServico } from '@/app/actions/pcm-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function ImportOsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean, count?: number, errors?: number, message?: string, error?: string } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setResult(null)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        try {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                const plainData = JSON.parse(JSON.stringify(jsonData))
                const res = await importOrdensServico(plainData)
                setResult(res)
                if (res.success) {
                    setFile(null)
                }
            }
            reader.readAsArrayBuffer(file)
        } catch (error) {
            console.error('Import error:', error)
            setResult({ success: false, message: 'Erro ao processar o arquivo.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                        Importar O.S. (Excel)
                    </DialogTitle>
                    <DialogDescription className="font-medium text-gray-500">
                        Selecione um arquivo Excel (.xlsx ou .xls) com as colunas:
                        <span className="block mt-1 font-bold text-foreground">placa, codigoInterno, tipo, status, descricao, dataAbertura</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {!result?.success && (
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border-color hover:border-primary/30 bg-surface-highlight/30'}`}>
                                <Upload className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-primary' : 'text-gray-400'}`} />
                                <p className="text-sm font-black text-foreground">
                                    {file ? file.name : 'Clique ou arraste o arquivo aqui'}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Excel (.xlsx ou .xls)</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                            {result.success ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">{result.success ? 'Importação Concluída!' : 'Erro na Importação'}</h4>
                                {result.success ? (
                                    <p className="text-xs font-bold mt-1">
                                        {result.count} O.S. importadas com sucesso. {result.errors ? `(${result.errors} falhas)` : ''}
                                    </p>
                                ) : (
                                    <p className="text-xs font-bold mt-1">{result.message || result.error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="flex-1 px-6 py-3 rounded-2xl bg-surface-highlight border border-border-color text-foreground font-black text-xs uppercase tracking-widest hover:border-gray-400 transition-all"
                        >
                            Fechar
                        </button>
                        {!result?.success && (
                            <button
                                onClick={handleImport}
                                disabled={!file || loading}
                                className="flex-[2] px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Iniciar Importação
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

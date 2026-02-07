'use client'

import React, { useState } from 'react'
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportBacklogDialog({ isOpen, onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (!file) return
        setUploading(true)

        // Simulate upload/process
        for (let i = 0; i <= 100; i += 10) {
            setProgress(i)
            await new Promise(r => setTimeout(r, 200))
        }

        // Mock success
        setUploading(false)
        alert('Simulação: Arquivo processado com sucesso! (Funcionalidade de PDF requer API de extração)')
        onSuccess()
        onClose()
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
                            {file ? file.name : 'Selecione o arquivo PDF ou Excel'}
                        </h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                            Arraste e solte ou clique para selecionar o arquivo de backlog para importação.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".pdf,.xlsx,.xls"
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

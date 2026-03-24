'use client'

import { useState, useRef } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { importOrdensServico } from '@/app/actions/pcm-actions'

export default function ImportOsButton() {
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        const toastId = toast.loading('Processando planilha...')

        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer)
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)

                    if (jsonData.length === 0) {
                        toast.error('A planilha está vazia.', { id: toastId })
                        setIsImporting(false)
                        return
                    }

                    const plainData = JSON.parse(JSON.stringify(jsonData))
                    const result = await importOrdensServico(plainData)

                    if (result.success) {
                        toast.success(`Sucesso! ${result.count} OS importadas. ${result.errors} erros.`, { id: toastId, duration: 5000 })
                    } else {
                        toast.error(result.error || 'Falha na importação.', { id: toastId })
                    }
                } catch (error) {
                    console.error('Error parsing Excel:', error)
                    toast.error('Erro ao ler o arquivo Excel. Verifique o formato.', { id: toastId })
                } finally {
                    setIsImporting(false)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }
            }
            reader.readAsArrayBuffer(file)
        } catch (error) {
            console.error('Error handling file:', error)
            toast.error('Erro ao processar arquivo.', { id: toastId })
            setIsImporting(false)
        }
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
            />
            <button
                onClick={handleButtonClick}
                disabled={isImporting}
                className="bg-surface hover:bg-surface-dark border border-border-color text-foreground px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-all transform hover:scale-[1.03] active:scale-[0.97] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                    <FileDown className="w-4 h-4 transition-transform group-hover:-translate-y-1 duration-300 text-primary" />
                )}
                {isImporting ? 'Importando...' : 'Importar Planilha'}
            </button>
        </>
    )
}

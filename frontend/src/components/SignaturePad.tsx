'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Eraser, Check, PenTool } from 'lucide-react'

interface Props {
  onSave: (base64: string) => void
  onClear: () => void
  label?: string
}

export default function SignaturePad({ onSave, onClear, label = 'Assinatura' }: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [hasSignature, setHasSignature] = useState(false)

  const clear = () => {
    sigCanvas.current?.clear()
    setHasSignature(false)
    onClear()
  }

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return
    const base64 = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
    if (base64) {
      onSave(base64)
      setHasSignature(true)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        <PenTool className="w-3 h-3 text-primary" /> {label}
      </label>
      <div className="relative dashboard-card p-2 bg-white dark:bg-surface-highlight border-2 border-dashed border-border-color overflow-hidden group">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair',
          }}
          onEnd={save}
          penColor="#10b981"
        />
        
        <div className="absolute top-2 right-2 flex gap-1 transform opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            type="button"
            onClick={clear}
            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
            title="Limpar assinatura"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Assine aqui</span>
          </div>
        )}
      </div>
      
      {hasSignature && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 animate-in fade-in slide-in-from-left-2 duration-300">
          <Check className="w-3 h-3" /> Assinatura capturada
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  ChevronLeft, 
  ClipboardCheck, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  LayoutGrid
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import SignaturePad from './SignaturePad'
import Image from 'next/image'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  observation?: string
  photo?: string
}

interface Checklist {
  id: string
  title: string
  clientName: string
  location: string
  date: string
  startTime: string
  endTime: string
  responsible: string
  items: ChecklistItem[]
  signature?: string
  status: 'PENDING' | 'COMPLETED'
}

export default function ChecklistForm() {
  const [step, setStep] = useState(1)
  const [checklist, setChecklist] = useState<Checklist>({
    id: uuidv4(),
    title: 'Checklist de Manutenção Eunaman',
    clientName: '',
    location: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: '',
    responsible: 'Ricardo Henrique',
    items: [
      { id: uuidv4(), text: 'Verificar filtros de ar', completed: false },
      { id: uuidv4(), text: 'Limpeza da unidade interna', completed: false },
      { id: uuidv4(), text: 'Teste de drenagem', completed: false },
      { id: uuidv4(), text: 'Verificar pressão do gás', completed: false },
      { id: uuidv4(), text: 'Verificar conexões elétricas', completed: false },
    ],
    status: 'PENDING'
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setChecklist(prev => ({ ...prev, [name]: value }))
  }

  const toggleItem = (id: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }))
  }

  const updateItemObservation = (id: string, obs: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, observation: obs } : item
      )
    }))
  }

  const addItem = () => {
    const text = prompt('Descrição do item:')
    if (text) {
      setChecklist(prev => ({
        ...prev,
        items: [...prev.items, { id: uuidv4(), text, completed: false }]
      }))
    }
  }

  const removeItem = (id: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleSignature = (base64: string) => {
    setChecklist(prev => ({ ...prev, signature: base64 }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    // Simular API
    await new Promise(r => setTimeout(r, 2000))
    setChecklist(prev => ({ ...prev, status: 'COMPLETED', endTime: format(new Date(), 'HH:mm') }))
    setSaving(false)
    setSaved(true)
    
    // Auto reset após 3 segundos
    setTimeout(() => {
      setSaved(false)
      setStep(1)
    }, 3000)
  }

  const progress = (step / 3) * 100

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-4 overflow-hidden relative">
      {/* Dynamic Progress Header */}
      <div className="sticky top-0 z-50 pt-4 pb-2 bg-gradient-to-b from-[#0a0a0b] via-[#0a0a0b] to-transparent">
        <div className="dashboard-card p-4 overflow-hidden relative border-primary bg-surface-highlight shadow-2xl shadow-primary/10">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status do Checklist</span>
            <span className="text-xs font-black text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1.5px]">
            <div 
              className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary-glow rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-4 px-1">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${step >= s ? 'opacity-100 scale-100' : 'opacity-40 scale-90 hover:opacity-100'}`}
                onClick={() => setStep(s)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                  step === s ? 'bg-primary border-primary shadow-[0_0_15px_rgba(16,185,129,0.4)] text-[#0a0a0b] rotate-[-5deg]' : 
                  step > s ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 
                  'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{s}</span>}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest mt-2 text-gray-500 group-hover:text-primary transition-colors">
                  {s === 1 ? 'Info' : s === 2 ? 'Items' : 'Final'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {saved ? (
        <div className="dashboard-card p-12 text-center animate-in zoom-in-95 duration-500 border-emerald-500/30">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Checklist Salvo!</h2>
          <p className="text-sm text-gray-400 font-medium">Os dados foram enviados para o sistema.</p>
        </div>
      ) : (
        <>
          {/* STEP 1: INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight uppercase">Definições <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Obridatório</span></h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Informações básicas do serviço</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="group relative">
                  <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary transform origin-bottom scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300" />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" /> Cliente / Razão Social
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={checklist.clientName}
                    onChange={handleInputChange}
                    placeholder="Nome Fantasia ou Cliente"
                    className="w-full bg-[#18181b] border-2 border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary/50 focus:outline-none transition-all placeholder:text-gray-600 focus:bg-[#1a1a1f]"
                  />
                </div>

                <div className="group relative">
                   <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary transform origin-bottom scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300" />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" /> Endereço / Unidade
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={checklist.location}
                    onChange={handleInputChange}
                    placeholder="Cidade, Unidade ou Setor"
                    className="w-full bg-[#18181b] border-2 border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary/50 focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-primary" /> Data
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={checklist.date}
                      onChange={handleInputChange}
                      className="w-full bg-[#18181b] border-2 border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-primary/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="group relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                      <Clock className="w-3 h-3 text-primary" /> Início
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={checklist.startTime}
                      onChange={handleInputChange}
                      className="w-full bg-[#18181b] border-2 border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-black focus:border-primary/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="group relative pt-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                    <FileText className="w-3 h-3 text-primary" /> Título do Checklist
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={checklist.title}
                    onChange={handleInputChange}
                    className="w-full bg-[#18181b] border-2 border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary/50 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ITEMS */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Inspeção</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Itens de verificação</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {checklist.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`dashboard-card group transition-all duration-300 relative overflow-hidden border-2 p-0 ${item.completed ? 'border-emerald-500/20 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'border-white/5'}`}
                  >
                    <div className="p-4 flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          item.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                          : 'border-white/20 hover:border-primary'
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1 space-y-3">
                        <p className={`text-sm font-black transition-all ${item.completed ? 'text-emerald-400' : 'text-gray-200'}`}>
                          {item.text}
                        </p>
                        
                        {item.completed && (
                          <div className="animate-in slide-in-from-top-2 duration-300">
                             <input
                              type="text"
                              value={item.observation || ''}
                              onChange={(e) => updateItemObservation(item.id, e.target.value)}
                              placeholder="Adicionar observação técnica..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/30"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-1 opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: FINAL */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Assinatura</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Finalização do relatório</p>
                </div>
              </div>

              <div className="space-y-4">
                <SignaturePad 
                  onSave={handleSignature}
                  onClear={() => setChecklist(prev => ({ ...prev, signature: '' }))}
                />

                <div className="dashboard-card p-6 bg-primary/5 border-primary/20 flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-1 mt-0.5">Confirmação</h4>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                      Ao finalizar este checklist, declaro que as informações acima são verdadeiras e que todos os itens foram inspecionados conforme as normas técnicas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b] to-transparent z-40">
            <div className="max-w-xl mx-auto flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex-1 h-14 rounded-2xl bg-[#18181b] border border-white/5 text-gray-300 font-black uppercase tracking-widest text-[10px] hover:bg-[#1a1a1f] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  className="flex-[2] h-14 rounded-2xl bg-primary text-[#0a0a0b] font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-primary/20"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !checklist.signature}
                  className={`flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl ${
                    saving || !checklist.signature
                    ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-emerald-400 text-[#0a0a0b] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95'
                  }`}
                >
                  {saving ? (
                    'Salvando...'
                  ) : (
                    <>Salvar Relatório <Save className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

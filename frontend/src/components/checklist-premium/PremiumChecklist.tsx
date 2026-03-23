"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  AlertCircle,
  Truck,
  User,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
  Zap,
  Hammer,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import SignaturePad from "@/components/SignaturePad";
import { getVeiculosParaChecklist, savePremiumChecklist } from "@/app/actions/checklist-actions";

// Types
type ItemStatus = "OK" | "NAO_OK" | "NA";

interface ChecklistItem {
  id: string;
  texto: string;
  categoria: string;
  obrigatorio?: boolean;
}

interface ItemResponse {
  itemId: string;
  status: ItemStatus;
  observacao?: string;
  fotos?: string[];
}

interface Veiculo {
  id: string;
  codigoInterno: string;
  modelo: string;
  status: string;
}

// Data
const CATEGORIES = [
  { 
    id: "EQUIPAMENTO INTERDITADO", 
    label: "Interdição", 
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    description: "Itens críticos: Se reprovado, o veículo é BLOQUEADO imediatamente.",
    color: "from-red-500/10 to-transparent",
    border: "border-red-500/20"
  },
  { 
    id: "OBRIGATÓRIOS PARA OPERAÇÃO", 
    label: "Operacional", 
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    description: "Equipamentos obrigatórios para a segurança e conformidade operacional.",
    color: "from-amber-500/10 to-transparent",
    border: "border-amber-500/20"
  },
  { 
    id: "MANUTENÇÃO PROGRAMADA", 
    label: "Manutenção", 
    icon: <Hammer className="w-5 h-5 text-blue-500" />,
    description: "Itens de desgaste e manutenção preventiva periódica.",
    color: "from-blue-500/10 to-transparent",
    border: "border-blue-500/20"
  }
];

// Placeholder items
const INITIAL_ITEMS: ChecklistItem[] = [
  { id: "1", texto: "Sinal sonoro de ré operando?", categoria: "EQUIPAMENTO INTERDITADO" },
  { id: "2", texto: "Freio de estacionamento / serviço operando?", categoria: "EQUIPAMENTO INTERDITADO" },
  { id: "3", texto: "Direção (folga excessiva ou vazamentos)?", categoria: "EQUIPAMENTO INTERDITADO" },
  { id: "4", texto: "Pneus (cortes profundos ou TWI baixo)?", categoria: "EQUIPAMENTO INTERDITADO" },
  { id: "5", texto: "Cinto de segurança operando?", categoria: "OBRIGATÓRIOS PARA OPERAÇÃO" },
  { id: "6", texto: "Extintor de incêndio (pressão e validade)?", categoria: "OBRIGATÓRIOS PARA OPERAÇÃO" },
  { id: "7", texto: "Limpador de para-brisa operando?", categoria: "OBRIGATÓRIOS PARA OPERAÇÃO" },
  { id: "8", texto: "Faróis (alto e baixo) operando?", categoria: "OBRIGATÓRIOS PARA OPERAÇÃO" },
  { id: "9", texto: "Nível do óleo lubrificante?", categoria: "MANUTENÇÃO PROGRAMADA" },
  { id: "10", texto: "Nível do líquido de arrefecimento?", categoria: "MANUTENÇÃO PROGRAMADA" },
  { id: "11", texto: "Vazamentos de óleo (moto, câmbio, diferencial)?", categoria: "MANUTENÇÃO PROGRAMADA" },
  { id: "12", texto: "Estofado e bancos em bom estado?", categoria: "MANUTENÇÃO PROGRAMADA" },
];

export default function PremiumChecklist() {
  const [step, setStep] = useState(0); 
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [veiculosList, setVeiculosList] = useState<Veiculo[]>([]);
  const [respostas, setRespostas] = useState<Record<string, ItemResponse>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signatures, setSignatures] = useState({ motorista: "", supervisor: "" });

  const currentCategory = CATEGORIES[step - 1];
  const itemsInCategory = INITIAL_ITEMS.filter(item => item.categoria === currentCategory?.id);

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const data = await getVeiculosParaChecklist();
      setVeiculosList(data as any);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    }
  };

  const handleStatusChange = (itemId: string, status: ItemStatus) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], itemId, status }
    }));
    
    if (status === "NAO_OK") {
      toast.warning("Item crítico! Por favor, adicione uma observação.", {
        position: "top-center"
      });
    }
  };

  const handleNext = () => {
    if (step === 0 && !veiculo) {
      toast.error("Selecione um veículo primeiro!");
      return;
    }
    
    if (step >= 1 && step <= 3) {
      const allAnswered = itemsInCategory.every(item => respostas[item.id]);
      if (!allAnswered) {
        toast.error("Responda todos os itens da categoria para prosseguir.");
        return;
      }
    }

    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!signatures.motorista || !signatures.supervisor) {
      toast.error("Ambas as assinaturas são obrigatórias.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        veiculoId: veiculo?.id,
        respostas: Object.values(respostas),
        assinatura: signatures.motorista,
        signatures: signatures
      };

      const result = await savePremiumChecklist(payload);

      if (result.success) {
        toast.success("Checklist Premium finalizado com sucesso!");
        setStep(0);
        setVeiculo(null);
        setRespostas({});
        setSignatures({ motorista: "", supervisor: "" });
      } else {
        toast.error("Erro ao salvar checklist: " + result.error);
      }
    } catch (e) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // UI Components
  const StepIndicator = () => (
    <div className="flex justify-between items-center px-2 mb-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <div className={`relative flex flex-col items-center group`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
              ${step === i ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20 scale-110" : 
                step > i ? "bg-green-500 border-green-500" : "bg-neutral-800 border-neutral-700 text-neutral-500"}
            `}>
              {step > i ? <CheckCircle className="w-6 h-6 text-white" /> : 
               i === 0 ? <Truck className="w-5 h-5 text-white" /> :
               i === 4 ? <ShieldCheck className="w-5 h-5 text-white" /> :
               <span className="text-sm font-bold text-white">{i}</span>}
            </div>
          </div>
          {i < 4 && (
            <div className={`flex-1 h-[2px] mx-2 transition-all duration-1000 ${step > i ? "bg-green-500" : "bg-neutral-700"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-xl mx-auto py-12">
        
        <StepIndicator />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent italic tracking-tight">
                  CHECKLIST PREMIUM
                </h1>
                <p className="text-neutral-400 text-sm">Selecione o veículo para iniciar a inspeção rigorosa de segurança.</p>
              </div>

              <div className="grid gap-3">
                {veiculosList.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVeiculo(v)}
                    className={`
                      p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group
                      ${veiculo?.id === v.id ? "bg-white text-black border-white shadow-xl scale-[1.02]" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"}
                    `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-3 rounded-xl ${veiculo?.id === v.id ? "bg-black/5" : "bg-white/5"}`}>
                        <Truck className={`w-6 h-6 ${veiculo?.id === v.id ? "text-black" : "text-white"}`} />
                      </div>
                      <div>
                        <div className="font-black text-lg">{v.codigoInterno}</div>
                        <div className="text-sm opacity-60 font-medium">{v.modelo}</div>
                      </div>
                      {veiculo?.id === v.id && (
                        <CheckCircle className="ml-auto w-6 h-6 text-green-500 animate-bounce" />
                      )}
                      {!veiculo?.id === v.id && (
                        <ChevronRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!veiculo}
                className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:grayscale transition-all font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 active:scale-95"
              >
                INICIAR INSPEÇÃO <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step >= 1 && step <= 3 && (
            <motion.div 
              key={`step${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-24"
            >
              <div className={`p-6 rounded-3xl border ${currentCategory.border} bg-gradient-to-br ${currentCategory.color} relative overflow-hidden`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                    {currentCategory.icon}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">{currentCategory.label}</h2>
                </div>
                <p className="text-sm text-neutral-400 font-medium leading-relaxed">{currentCategory.description}</p>
              </div>

              <div className="space-y-4">
                {itemsInCategory.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="p-5 rounded-3xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm"
                  >
                    <p className="text-lg font-semibold mb-6 flex items-start gap-3">
                      <span className="text-orange-500 text-2xl leading-none">·</span>
                      {item.texto}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleStatusChange(item.id, "OK")}
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${respostas[item.id]?.status === "OK" ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20" : "bg-neutral-800/30 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">OK</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, "NAO_OK")}
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${respostas[item.id]?.status === "NAO_OK" ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" : "bg-neutral-800/30 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}
                      >
                        <XCircle className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">Falha</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, "NA")}
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${respostas[item.id]?.status === "NA" ? "bg-neutral-500 border-neutral-400 text-white shadow-lg shadow-neutral-500/20" : "bg-neutral-800/30 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}
                      >
                        <HelpCircle className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">N/A</span>
                      </button>
                    </div>

                    {respostas[item.id]?.status === "NAO_OK" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 flex gap-3"
                      >
                        <button className="flex-1 py-4 bg-neutral-800 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border border-white/5 hover:bg-neutral-700 transition-colors">
                          <Camera className="w-5 h-5 text-orange-500" /> FOTO OBRIGATÓRIA
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex gap-4 z-50">
                <button
                  onClick={handleBack}
                  className="p-5 rounded-2xl bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 p-5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  PRÓXIMA CATEGORIA <ArrowRight className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 pb-12"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight">FORMALIZAÇÃO</h2>
                <p className="text-neutral-400">Assine abaixo para atestar a veracidade das informações coletadas hoje.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-orange-500">
                    <User className="w-4 h-4" /> Motorista
                  </div>
                  <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-2">
                    <SignaturePad 
                      onSave={(data) => setSignatures(prev => ({ ...prev, motorista: data }))}
                      onClear={() => setSignatures(prev => ({ ...prev, motorista: "" }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-500">
                    <ShieldCheck className="w-4 h-4" /> Supervisor de Pátio
                  </div>
                  <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-2">
                    <SignaturePad 
                      onSave={(data) => setSignatures(prev => ({ ...prev, supervisor: data }))}
                      onClear={() => setSignatures(prev => ({ ...prev, supervisor: "" }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="p-5 rounded-3xl bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !signatures.motorista || !signatures.supervisor}
                  className={`
                    flex-1 p-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]
                    ${isLoading ? "bg-neutral-800 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl shadow-green-600/20"}
                  `}
                >
                  {isLoading ? "PROCESSANDO..." : "FINALIZAR E ENVIAR"}
                  <ClipboardCheck className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

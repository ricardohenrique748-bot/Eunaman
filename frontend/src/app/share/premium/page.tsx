import PremiumChecklist from "@/components/checklist-premium/PremiumChecklist";

export const dynamic = 'force-dynamic';

export default function GuestPremiumChecklistPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed top-4 right-4 z-[100] bg-orange-500/80 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase backdrop-blur-md pointer-events-none shadow-lg shadow-orange-500/20 flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        ACESSO VISITANTE
      </div>
      <PremiumChecklist />
    </div>
  );
}

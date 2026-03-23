import Link from 'next/link';
import { getPCMSummary } from '@/app/actions/pcm-dashboard-actions';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertCircle, Wrench, ListTodo, Disc, 
  ClipboardCheck, Activity, ArrowRight, TrendingUp, Calendar 
} from 'lucide-react';

export default async function PCMOverviewPage() {
  const summary = await getPCMSummary()

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xl font-bold text-foreground">Atenção</p>
        <p className="text-muted-foreground">Erro ao carregar dados do PCM.</p>
      </div>
    )
  }

  const { stats, ultimasOS, ultimasInspecoes } = summary

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Visão Geral <span className="text-primary">PCM</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Mantenha sua frota em movimento com controle total.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-surface-highlight px-4 py-2 rounded-2xl border border-border-color/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SISTEMA ONLINE
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Wrench} 
          title="O.S. em Aberto" 
          value={stats.osAbertas} 
          color="blue" 
          href="/dashboard/pcm/os"
          description="Aguardando início ou em progresso"
        />
        <StatCard 
          icon={ListTodo} 
          title="Fila de Backlog" 
          value={stats.backlogPendente} 
          color="amber"
          href="/dashboard/pcm/backlog"
          description="Itens pendentes de programação"
        />
        <StatCard 
          icon={Disc} 
          title="Pneus Críticos" 
          value={stats.pneusCriticos} 
          color="red"
          href="/dashboard/pcm/pneus"
          description="Sulco abaixo do limite de segurança"
        />
        <StatCard 
          icon={ClipboardCheck} 
          title="Checklists Hoje" 
          value={stats.checklistsHoje} 
          color="emerald"
          href="/dashboard/pcm/checklist"
          description="Inspecionados nas últimas 24h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Recent OS Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recentemente Criadas
            </h2>
            <Link href="/dashboard/pcm/os" className="text-xs font-bold text-primary hover:underline">
              Ver Todas
            </Link>
          </div>
          
          <Card className="bg-surface border-border-color shadow-2xl shadow-black/5 overflow-hidden rounded-[2rem]">
            <CardContent className="p-0">
              <div className="divide-y divide-border-color/30">
                {ultimasOS.length > 0 ? (
                  ultimasOS.map((os: any) => (
                    <Link key={os.id} href={`/dashboard/pcm/os/${os.id}`} className="flex items-center justify-between p-5 hover:bg-surface-highlight transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wrench className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                            {os.veiculo.codigoInterno}
                          </p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                            OS {os.numeroOs || 'S/N'} • {os.tipoManutencao || 'Manutenção'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          os.status === 'ABERTA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {os.status}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic font-medium">
                    Nenhuma O.S. recente encontrada.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tire Health Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 flex items-center gap-2">
              <Disc className="w-4 h-4 text-emerald-500" />
              Saúde de Pneus
            </h2>
            <Link href="/dashboard/pcm/pneus" className="text-xs font-bold text-emerald-500 hover:underline">
              Gestão de Pneus
            </Link>
          </div>
          
          <Card className="bg-surface border-border-color shadow-2xl shadow-black/5 overflow-hidden rounded-[2rem]">
            <CardContent className="p-0">
              <div className="divide-y divide-border-color/30">
                {ultimasInspecoes.length > 0 ? (
                  ultimasInspecoes.map((boletim: any) => (
                    <div key={boletim.id} className="flex items-center justify-between p-5 hover:bg-surface-highlight transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground group-hover:text-emerald-500 transition-colors">
                            {boletim.veiculo.codigoInterno}
                          </p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                            {format(new Date(boletim.data), "dd MMMM yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-foreground tabular-nums">
                          {boletim.km?.toLocaleString() || '0'} 
                          <span className="text-[10px] text-gray-400 font-bold ml-1 tracking-widest">KM</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic font-medium">
                    Nenhuma inspeção recente registrada.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Launchpad Section */}
      <div className="bg-surface-highlight border border-border-color/50 rounded-[2.5rem] p-8 mt-4 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Atalhos Rápidos</h3>
            <p className="text-sm text-gray-400 font-medium">Acesso imediato às principais ferramentas.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4">
            <QuickLaunchButton 
              href="/dashboard/pcm/os" 
              icon={Calendar} 
              label="Prog. Semanal" 
              color="primary" 
            />
            <QuickLaunchButton 
              href="/dashboard/pcm/checklist" 
              icon={ClipboardCheck} 
              label="Fila Checklists" 
              color="emerald" 
            />
            <QuickLaunchButton 
              href="/dashboard/pcm/backlog" 
              icon={ListTodo} 
              label="Fila Backlog" 
              color="amber" 
            />
            <QuickLaunchButton 
              href="/dashboard/pcm/pneus" 
              icon={Disc} 
              label="Analíticos" 
              color="blue" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, color, href, description }: any) {
  const colorSchemes: any = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white",
    red: "bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500 group-hover:text-white",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white",
  }
  
  const iconBase: any = {
    blue: "bg-blue-500/10 text-blue-500",
    red: "bg-red-500/10 text-red-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  }

  return (
    <Link href={href} className="group transition-all active:scale-[0.98]">
      <Card className="bg-surface border-border-color h-full shadow-lg shadow-black/5 hover:shadow-2xl hover:border-border-color/50 transition-all duration-350 relative overflow-hidden rounded-[2rem]">
        <CardContent className="p-8 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${iconBase[color]} group-hover:scale-110 group-hover:shadow-2xl group-hover:bg-white/10 group-active:scale-95`}>
              <Icon className="w-7 h-7" />
            </div>
            {description && (
              <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
            )}
          </div>
          
          <div className="mt-8">
            <p className="text-4xl font-extrabold text-foreground tabular-nums tracking-tighter sm:text-5xl group-hover:scale-105 origin-left transition-transform">
              {value}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
              {title}
            </p>
            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              {description}
            </p>
          </div>
        </CardContent>
        {/* Glow effect */}
        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-[60px] opacity-20 transition-opacity ${
          color === 'blue' ? 'bg-blue-500' : 
          color === 'red' ? 'bg-red-500' : 
          color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />
      </Card>
    </Link>
  )
}

function QuickLaunchButton({ href, icon: Icon, label, color }: any) {
  const colors: any = {
    primary: "hover:border-primary text-primary",
    emerald: "hover:border-emerald-500 text-emerald-500",
    amber: "hover:border-amber-500 text-amber-500",
    blue: "hover:border-blue-500 text-blue-500",
  }

  return (
    <Link href={href}>
      <button className={`h-16 px-6 bg-surface border border-border-color/80 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 active:scale-95 group shrink-0 ${colors[color]}`}>
        <div className={`w-10 h-10 rounded-xl bg-surface-highlight flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-colors`}>
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-inherit" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-foreground">
          {label}
        </span>
      </button>
    </Link>
  )
}


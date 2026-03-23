import { getPCMSummary } from '@/app/actions/pcm-dashboard-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Wrench, ListTodo, ClipboardCheck, Disc, Activity, AlertCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function PCMOverviewPage() {
  const summary = await getPCMSummary()

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl font-semibold opacity-70">Erro ao carregar dados do PCM.</p>
      </div>
    )
  }

  const { stats, ultimasOS, ultimasInspecoes } = summary

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral PCM</h1>
        <p className="text-muted-foreground">Planejamento e Controle de Manutenção em tempo real.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Wrench} 
          title="O.S. em Aberto" 
          value={stats.osAbertas} 
          color="blue" 
          href="/dashboard/pcm/os"
        />
        <StatCard 
          icon={ListTodo} 
          title="Fila de Backlog" 
          value={stats.backlogPendente} 
          color="amber"
          href="/dashboard/pcm/backlog"
        />
        <StatCard 
          icon={Disc} 
          title="Pneus Críticos" 
          value={stats.pneusCriticos} 
          color="red"
          href="/dashboard/pcm/pneus"
        />
        <StatCard 
          icon={ClipboardCheck} 
          title="Checklists Hoje" 
          value={stats.checklistsHoje} 
          color="emerald"
          href="/dashboard/pcm/checklist"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent OS Card */}
        <Card className="bg-surface border-border-color shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Novas Ordens de Serviço
              </CardTitle>
              <CardDescription className="text-[10px] mt-1">Status das frotas em manutenção técnica.</CardDescription>
            </div>
            <Link href="/dashboard/pcm/os">
              <button className="p-2.5 rounded-xl hover:bg-surface-highlight text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {ultimasOS.length > 0 ? (
                ultimasOS.map((os: any) => (
                  <div key={os.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-highlight border border-border-color/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-foreground">{os.veiculo.codigoInterno} — {os.tipoManutencao || 'Manutenção'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{os.numeroOs || 'S/N'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                        {os.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-8">Nenhuma O.S. recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tire Health Card */}
        <Card className="bg-surface border-border-color shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Disc className="w-5 h-5 text-emerald-500" />
                Últimas Inspeções de Pneus
              </CardTitle>
              <CardDescription className="text-[10px] mt-1">Monitoramento de sulco e KM.</CardDescription>
            </div>
            <Link href="/dashboard/pcm/pneus">
              <button className="p-2.5 rounded-xl hover:bg-surface-highlight text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {ultimasInspecoes.length > 0 ? (
                ultimasInspecoes.map((boletim: any) => (
                  <div key={boletim.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-highlight border border-border-color/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-foreground">{boletim.veiculo.codigoInterno}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{format(new Date(boletim.data), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-foreground">{boletim.km?.toLocaleString() || '0'} KM</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-8">Nenhuma inspeção recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launchpad Section */}
      <div className="py-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Atalhos PCM</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/pcm/os">
            <button className="w-full h-14 bg-surface-highlight border border-border-color rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:border-primary active:scale-95 group">
              <Calendar className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-foreground">Prog. Semanal</span>
            </button>
          </Link>
          <Link href="/dashboard/pcm/checklist">
            <button className="w-full h-14 bg-surface-highlight border border-border-color rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:border-emerald-500 active:scale-95 group">
              <ClipboardCheck className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-foreground">Novo Checklist</span>
            </button>
          </Link>
          <Link href="/dashboard/pcm/backlog">
            <button className="w-full h-14 bg-surface-highlight border border-border-color rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:border-amber-500 active:scale-95 group">
              <ListTodo className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-foreground">Fila Backlog</span>
            </button>
          </Link>
          <Link href="/dashboard/pcm/pneus">
            <button className="w-full h-14 bg-surface-highlight border border-border-color rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:border-blue-500 active:scale-95 group">
              <Activity className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-foreground">Analíticos</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, color, href }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }

  return (
    <Link href={href} className="group transition-transform active:scale-95">
      <Card className="bg-surface border-border-color overflow-hidden group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
        <CardContent className="p-6 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
              <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">{value}</p>
            </div>
          </div>
        </CardContent>
        <div className={`h-1.5 w-full ${colors[color]} border-none`} />
      </Card>
    </Link>
  )
}

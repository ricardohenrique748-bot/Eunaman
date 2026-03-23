'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Disc, Activity, AlertTriangle, CheckCircle2, History, TrendingDown } from 'lucide-react'

interface PneuItem {
  posicao: string
  sulcoMm: number
}

interface Boletim {
  id: string
  veiculo: {
    placa: string | null
    codigoInterno: string
    modelo: string
  }
  data: string | Date
  itens: PneuItem[]
}

const COLORS = {
  BOM: '#10b981',       // Green
  REGULAR: '#f59e0b',   // Orange
  CRITICO: '#ef4444',   // Red
  TROCAR: '#7f1d1d'     // Dark Red
}

export default function PneuDashboard({ boletins }: { boletins: Boletim[] }) {
  // 1. Process data for KPI cards
  // We only count the LATEST inspection for each vehicle
  const latestInspections: Record<string, Boletim> = {}
  boletins.forEach(b => {
    const key = b.veiculo.codigoInterno || b.id
    if (!latestInspections[key] || new Date(b.data) > new Date(latestInspections[key].data)) {
      latestInspections[key] = b
    }
  })

  const allLatestItens = Object.values(latestInspections).flatMap(b => b.itens)
  
  const stats = {
    bom: allLatestItens.filter(i => i.sulcoMm > 8).length,
    regular: allLatestItens.filter(i => i.sulcoMm > 4 && i.sulcoMm <= 8).length,
    critico: allLatestItens.filter(i => i.sulcoMm >= 2 && i.sulcoMm <= 4).length,
    trocar: allLatestItens.filter(i => i.sulcoMm < 2).length,
    total: allLatestItens.length
  }

  // 2. Process data for Donut Chart
  const pieData = [
    { name: 'Bom', value: stats.bom, color: COLORS.BOM },
    { name: 'Regular', value: stats.regular, color: COLORS.REGULAR },
    { name: 'Crítico', value: stats.critico, color: COLORS.CRITICO },
    { name: 'Trocar', value: stats.trocar, color: COLORS.TROCAR },
  ].filter(d => d.value > 0)

  // 3. Process data for Bar Chart (Average tread depth per position)
  const posicoesCount: Record<string, { total: number; sum: number }> = {}
  allLatestItens.forEach(i => {
    if (!posicoesCount[i.posicao]) posicoesCount[i.posicao] = { total: 0, sum: 0 }
    posicoesCount[i.posicao].total++
    posicoesCount[i.posicao].sum += i.sulcoMm
  })

  const barData = Object.entries(posicoesCount).map(([pos, data]) => {
    const avg = parseFloat((data.sum / data.total).toFixed(1))
    let fill = COLORS.BOM
    if (avg <= 4) fill = COLORS.CRITICO
    else if (avg <= 8) fill = COLORS.REGULAR
    
    return {
      name: pos,
      avg,
      fill
    }
  }).sort((a, b) => a.name.localeCompare(b.name))

  // 4. Process data for Fleet Alerts (Vehicles with tires < 4mm)
  const alertVehicles = Object.values(latestInspections).map(b => {
    const criticalTires = b.itens.filter(i => i.sulcoMm < 4)
    const worstTires = b.itens.filter(i => i.sulcoMm < 2)
    return {
      ...b,
      criticalCount: criticalTires.length,
      worstCount: worstTires.length,
      minSulco: b.itens.length > 0 ? Math.min(...b.itens.map(i => i.sulcoMm)) : 0
    }
  })
  .filter(v => v.criticalCount > 0)
  .sort((a, b) => a.minSulco - b.minSulco)
  .slice(0, 5) // Top 5 more critical

  // 5. Color helpers
  const getSulcoColor = (mm: number) => {
    if (mm > 8) return 'text-emerald-500 bg-emerald-500/10'
    if (mm > 4) return 'text-amber-500 bg-amber-500/10'
    if (mm >= 2) return 'text-red-400 bg-red-400/10'
    return 'text-red-600 bg-red-600/10'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Bom" 
          value={stats.bom} 
          total={stats.total}
          icon={CheckCircle2} 
          color="text-emerald-500" 
          bgColor="bg-emerald-500/10"
          description="Pneus em ótimas condições (> 8mm)"
        />
        <KpiCard 
          title="Regular" 
          value={stats.regular} 
          total={stats.total}
          icon={Activity} 
          color="text-amber-500" 
          bgColor="bg-amber-500/10"
          description="Pneus em desgaste normal (4-8mm)"
        />
        <KpiCard 
          title="Crítico" 
          value={stats.critico} 
          total={stats.total}
          icon={AlertTriangle} 
          color="text-red-400" 
          bgColor="bg-red-400/10"
          description="Atenção para reposição (2-4mm)"
        />
        <KpiCard 
          title="Trocar" 
          value={stats.trocar} 
          total={stats.total}
          icon={TrendingDown} 
          color="text-red-600" 
          bgColor="bg-red-600/10"
          description="Pneus no limite legal (< 2mm)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <Card className="bg-surface border-border-color shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Distribuição de Condições</CardTitle>
            <CardDescription className="text-xs">Estado geral da frota de pneus</CardDescription>
          </CardHeader>
          <CardContent className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4 text-center">
              <span className="text-2xl font-black text-foreground">{stats.total}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pneus</p>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-surface border-border-color shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Média de Sulco por Posição</CardTitle>
            <CardDescription className="text-xs">Desgaste médio em mm por eixo/posição</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  fontWeight="bold"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  unit="mm"
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="avg" 
                  radius={[4, 4, 0, 0]} 
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Column */}
        <Card className="bg-surface border-border-color shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Veículos em Alerta
            </CardTitle>
            <CardDescription className="text-xs">Top 5 veículos com maior desgaste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertVehicles.length > 0 ? alertVehicles.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-highlight border border-border-color shadow-sm hover:border-red-500/30 transition-all">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">{v.veiculo.placa || v.veiculo.codigoInterno}</span>
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{v.veiculo.modelo}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${v.worstCount > 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {v.minSulco}mm
                  </span>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{v.criticalCount} pneus &lt; 4mm</p>
                </div>
              </div>
            )) : (
              <div className="h-40 flex items-center justify-center text-center">
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Nenhum alerta crítico encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Table (Now wider) */}
        <Card className="bg-surface border-border-color shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 underline decoration-primary/30 underline-offset-8">Condição por Veículo - Todas as Posições</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-highlight border-b border-border-color">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Veículo</th>
                  {['DE', 'DD', 'TEI', 'TEE', 'TDI', 'TDE', 'TEI1', 'TEE1', 'TDI1', 'TDE1', 'ESTEPE'].map(pos => (
                    <th key={pos} className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">{pos}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {Object.values(latestInspections).map(b => (
                  <tr key={b.id} className="hover:bg-surface-highlight transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">{b.veiculo.placa || b.veiculo.codigoInterno}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold">{b.veiculo.modelo}</span>
                      </div>
                    </td>
                    {['DE', 'DD', 'TEI', 'TEE', 'TDI', 'TDE', 'TEI1', 'TEE1', 'TDI1', 'TDE1', 'ESTEPE'].map(pos => {
                      const item = b.itens.find(i => i.posicao === pos)
                      return (
                        <td key={pos} className="px-1 py-4 text-center">
                          {item ? (
                            <span className={`inline-block w-8 py-1 rounded-md text-[10px] font-black ${getSulcoColor(item.sulcoMm)}`}>
                              {item.sulcoMm}
                            </span>
                          ) : (
                            <span className="text-gray-600 font-bold">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ title, value, total, icon: Icon, color, bgColor, description }: any) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0
  
  return (
    <Card className="bg-surface border-border-color shadow-sm group hover:border-primary/50 transition-all cursor-default">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-foreground">{value}</span>
            <span className="text-[10px] font-black text-gray-500 bg-surface-highlight px-2 py-0.5 rounded-full mt-1">
              {percentage}% da frota
            </span>
          </div>
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</h3>
        <p className="text-[10px] text-gray-500 font-medium">{description}</p>
      </CardContent>
    </Card>
  )
}

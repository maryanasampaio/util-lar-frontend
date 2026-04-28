import { Fragment, useMemo, useState } from 'react'
import {
  BarChart3,
  ShoppingBag,
  TrendingUp,
  Package,
  RefreshCw,
  AlertTriangle,
  LineChart,
  Flame,
  Gem,
  TrendingDown,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { useProducts } from '@features/products/viewmodel/ProductsContext'
import type { Product, Sale } from '@features/products/model/Product'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  subtitle?: string
  badge?: string
  badgeIcon?: React.ElementType
  accent?: 'primary' | 'success' | 'info' | 'warning'
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  accent = 'primary',
}: Readonly<StatCardProps>) {
  const bgColors = {
    success: 'hsl(95 30% 40%)',   // verde oliva suave
    info: 'hsl(30 30% 48%)',      // caramelo / bronze
    warning: 'hsl(25 20% 32%)',   // marrom escuro
    primary: 'hsl(210 30% 48%)',  // azul neutro acinzentado
  }
  
  const badgeColors: Record<string, string> = {
    success: 'bg-black/20',
    info: 'bg-black/20',
    warning: 'bg-red-700/60',
    primary: 'bg-black/20',
  }
  
  return (
    <Card 
      style={{ backgroundColor: bgColors[accent] }}
      className="relative overflow-hidden p-3 sm:p-4 hover:shadow-lg transition-all border-0"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-white" />
          {title}
        </h3>
        <Icon className="w-4 h-4 text-white/80 shrink-0" />
      </div>
      <p className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-white break-words">{value}</p>
      {subtitle && <p className="text-xs text-white opacity-90">{subtitle}</p>}
      {badge && (
        <Badge 
          variant="secondary" 
          className={`mt-2 gap-1 font-normal text-white border-0 text-[11px] ${badgeColors[accent]}`}
        >
          {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
          {badge}
        </Badge>
      )}
    </Card>
  )
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
}

interface MonthRow {
  key: string
  label: string
  sales: Sale[]
  revenue: number
  cost: number
  profit: number
  margin: number
  quantity: number
}

export function AdminGerenciamentoPage() {
  const { products, sales } = useProducts()
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)

  const updatedAt = useMemo(
    () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [refreshKey]
  )

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthSales = sales.filter((s) => {
      const d = new Date(s.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const monthRevenue = monthSales.reduce((sum, s) => sum + (s.finalPrice ?? 0), 0)
    const monthProfit = monthSales.reduce((sum, s) => {
      const p = products.find((x) => x.id === s.productId)
      if (p && s.finalPrice !== undefined) {
        return sum + (s.finalPrice - p.costPrice * s.quantity)
      }
      return sum
    }, 0)
    const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0
    const avgTicket = monthSales.length > 0 ? monthRevenue / monthSales.length : 0

    const totalRevenue = sales.reduce((sum, s) => sum + (s.finalPrice ?? 0), 0)
    const totalProfit = sales.reduce((sum, s) => {
      const p = products.find((x) => x.id === s.productId)
      if (p && s.finalPrice !== undefined) {
        return sum + (s.finalPrice - p.costPrice * s.quantity)
      }
      return sum
    }, 0)
    const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const available = products.filter((p) => !p.sold)
    const totalInvested = available.reduce((sum, p) => sum + p.costPrice * p.stock, 0)
    const totalPotential = available.reduce((sum, p) => sum + p.price * p.stock, 0)
    const potentialProfit = totalPotential - totalInvested

    const stale = available.filter((p) => {
      const days = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      return days > 60
    })

    return {
      monthProfit,
      monthMargin,
      monthSalesCount: monthSales.length,
      avgTicket,
      monthRevenue,
      totalMargin,
      totalProfit,
      totalRevenue,
      stockCount: available.length,
      totalInvested,
      totalPotential,
      potentialProfit,
      staleCount: stale.length,
    }
  }, [products, sales])

  const lowMarginProducts = useMemo(() => {
    return products
      .filter((p) => !p.sold && p.price > 0)
      .map((p) => ({ ...p, margin: ((p.price - p.costPrice) / p.price) * 100 }))
      .sort((a, b) => a.margin - b.margin)
      .slice(0, 4)
  }, [products])

  const topProducts = useMemo(() => {
    const map = new Map<string, { product: Product; quantity: number; revenue: number }>()
    sales.forEach((s) => {
      const p = products.find((x) => x.id === s.productId)
      if (p) {
        const e = map.get(s.productId) ?? { product: p, quantity: 0, revenue: 0 }
        map.set(s.productId, {
          product: p,
          quantity: e.quantity + s.quantity,
          revenue: e.revenue + (s.finalPrice ?? 0),
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 3)
  }, [products, sales])

  const monthlyHistory = useMemo<MonthRow[]>(() => {
    const map = new Map<string, MonthRow>()
    sales.forEach((s) => {
      const date = new Date(s.date)
      const key = monthKey(date)
      const existing = map.get(key) ?? {
        key,
        label: monthLabel(key),
        sales: [],
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0,
        quantity: 0,
      }
      const p = products.find((x) => x.id === s.productId)
      const revenue = s.finalPrice ?? 0
      const cost = p ? p.costPrice * s.quantity : 0
      existing.sales.push(s)
      existing.revenue += revenue
      existing.cost += cost
      existing.profit += revenue - cost
      existing.quantity += s.quantity
      map.set(key, existing)
    })
    return Array.from(map.values())
      .map((m) => ({ ...m, margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0 }))
      .sort((a, b) => b.key.localeCompare(a.key))
  }, [products, sales])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between flex-wrap gap-4 pl-12 sm:pl-0">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Visão Geral
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Resumo financeiro do negócio
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Atualizado em {updatedAt}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card sm:size-default"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar agora</span>
              <span className="sm:hidden">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Lucro do Mês"
            value={formatCurrency(stats.monthProfit)}
            icon={Flame}
            subtitle={`Margem: ${stats.monthMargin.toFixed(0)}%`}
            accent="success"
          />
          <StatCard
            title="Vendas do Mês"
            value={stats.monthSalesCount}
            icon={ShoppingBag}
            subtitle={`Ticket: ${formatCurrency(stats.avgTicket)}`}
            accent="info"
          />
          <StatCard
            title="Margem Geral"
            value={`${stats.totalMargin.toFixed(0)}%`}
            icon={TrendingUp}
            subtitle={`Lucro: ${formatCurrency(stats.totalProfit)}`}
            badge={`Vendido: ${formatCurrency(stats.totalRevenue)}`}
            accent="primary"
          />
          <StatCard
            title="Estoque"
            value={stats.stockCount}
            icon={Package}
            subtitle={`Investido: ${formatCurrency(stats.totalInvested)}`}
            badge={stats.staleCount > 0 ? `${stats.staleCount} parados há +60 dias` : undefined}
            badgeIcon={stats.staleCount > 0 ? AlertTriangle : undefined}
            accent={stats.staleCount > 0 ? 'warning' : 'primary'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Lucro */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Evolução de Lucro
            </h2>
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {monthlyHistory.length === 0 ? 'Nenhuma venda registrada ainda' : 'Histórico disponível abaixo'}
            </div>
          </Card>

          {/* Top 3 Produtos */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Top 3 Produtos
            </h2>
            {topProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma venda registrada ainda
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((item, i) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} vendido{item.quantity === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-foreground">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capital em Estoque */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Gem className="w-5 h-5 text-primary" />
              Capital em Estoque
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-md bg-muted/40 border-l-4 border-primary">
                <p className="text-sm font-semibold text-primary">Valor Investido</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(stats.totalInvested)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stats.stockCount} produtos</p>
              </div>

              <div className="p-4 rounded-md bg-muted/40 border-l-4 border-primary">
                <p className="text-sm font-semibold text-primary">Potencial de Venda</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(stats.totalPotential)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lucro: {formatCurrency(stats.potentialProfit)}
                </p>
              </div>

              <div className="p-4 rounded-md bg-muted/40 border-l-4 border-muted-foreground/40">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Produtos Parados
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.staleCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Considere fazer promoção</p>
              </div>
            </div>
          </Card>

          {/* Menor Margem */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Menor Margem
            </h2>
            {lowMarginProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Nenhum produto disponível
              </div>
            ) : (
              <div className="space-y-2">
                {lowMarginProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {p.margin.toFixed(2)}%
                      </p>
                      <p className="text-xs text-primary/70">margem</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Histórico Completo */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Histórico Completo
          </h2>
          <p className="text-sm text-muted-foreground mb-4 mt-1">
            Clique em um mês para ver os produtos vendidos.
          </p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b text-left text-primary">
                  <th className="p-3 font-semibold">Mês</th>
                  <th className="p-3 font-semibold hidden sm:table-cell">Vendas</th>
                  <th className="p-3 font-semibold hidden sm:table-cell">Custo</th>
                  <th className="p-3 font-semibold">Lucro</th>
                  <th className="p-3 font-semibold">Margem</th>
                  <th className="p-3 font-semibold">Qtd</th>
                  <th className="p-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {monthlyHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Nenhuma venda registrada ainda
                    </td>
                  </tr>
                ) : (
                  monthlyHistory.map((m) => (
                    <Fragment key={m.key}>
                      <tr
                        className="border-b hover:bg-muted/40 cursor-pointer transition-colors"
                        onClick={() => setExpandedMonth(expandedMonth === m.key ? null : m.key)}
                      >
                        <td className="p-3 font-semibold text-foreground capitalize">{m.label}</td>
                        <td className="p-3 text-foreground hidden sm:table-cell">{formatCurrency(m.revenue)}</td>
                        <td className="p-3 text-foreground hidden sm:table-cell">{formatCurrency(m.cost)}</td>
                        <td className="p-3 font-semibold text-foreground">
                          {formatCurrency(m.profit)}
                        </td>
                        <td className="p-3 text-foreground">{m.margin.toFixed(1)}%</td>
                        <td className="p-3 text-foreground">{m.quantity}</td>
                        <td className="p-3">
                          {expandedMonth === m.key ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                      {expandedMonth === m.key && (
                        <tr>
                          <td colSpan={7} className="p-4 bg-muted/30">
                            <div className="space-y-2">
                              {m.sales.map((s) => {
                                const p = products.find((x) => x.id === s.productId)
                                return (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-md"
                                  >
                                    <div>
                                      <p className="font-semibold text-foreground text-sm">
                                        {p?.name ?? 'Produto não encontrado'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {s.quantity}x · {s.paymentMethod}
                                        {(s.installments ?? 1) > 1 && ` · ${s.installments}x`} ·{' '}
                                        {new Date(s.date).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <p className="font-bold text-foreground">
                                      {formatCurrency(s.finalPrice ?? 0)}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}


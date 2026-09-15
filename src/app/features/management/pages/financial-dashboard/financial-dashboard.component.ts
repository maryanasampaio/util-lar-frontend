import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, interval, of, Subject, takeUntil, catchError } from 'rxjs';
import {
  FinancialService,
  DashboardResponse,
  MonthlyStats,
  ProductFinancial,
  SoldProduct
} from '../../services/financial.service';
import { ProductService } from '../../../products/services/product.service';
import { ProductResponse } from '../../../products/models/product.model';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';

/**
 * ============================================================================
 * FINANCIAL DASHBOARD - VISÃO GERAL DO NEGÓCIO
 * ============================================================================
 *
 * Fontes de dados:
 * - Backend (/api/financeiro): números do mês, geral, estoque, evolução mensal,
 *   top vendidos, baixa margem, parados e vendidos por mês (pré-calculados).
 * - Cache de produtos da loja: usado para métricas que o backend não expõe
 *   (tempo médio para vender, estoque por categoria, idade do estoque,
 *   pendências de cadastro). Nenhuma requisição extra além da listagem que
 *   a loja já faz.
 * ============================================================================
 */

interface CategoryStock {
  name: string;
  count: number;
  cost: number;       // centavos
  potential: number;  // centavos
  share: number;      // 0-100 (% do valor investido)
}

interface Pendencia {
  key: 'sem-foto' | 'sem-custo' | 'sem-categoria' | 'sem-descricao' | 'parado';
  title: string;
  hint: string;
  items: ProductResponse[];
}

interface ChartMonth {
  label: string;
  vendas: number;
  lucro: number;
  margem: number;
  vendasPct: number;
  lucroPct: number;
  stat: MonthlyStats;
}

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CapitalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-canvas">
      <!-- ================= CABEÇALHO ================= -->
      <div class="bg-white border-b border-line">
        <div class="container-store py-6 sm:py-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="section-kicker mb-1">Gerenciamento</p>
            <h1 class="section-title">Visão geral do negócio</h1>
            <p class="text-sm text-muted mt-1">
              Vendas, lucro, estoque e pendências em um só lugar
              <span *ngIf="lastUpdatedLabel"> · atualizado às {{ lastUpdatedLabel }}</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a routerLink="/dashboard" [queryParams]="{ novo: 1 }" class="btn-accent h-10 px-4 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"/></svg>
              Novo produto
            </a>
            <a routerLink="/simulacao" class="btn-secondary h-10 px-4 text-sm">Simular venda</a>
            <button type="button" (click)="refreshNow()" [disabled]="loading" class="btn-ghost h-10 px-3 text-sm" title="Atualizar">
              <svg class="w-4 h-4" [class.animate-spin]="loading" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div class="container-store py-8 space-y-6">

        <div *ngIf="error" class="card border-danger-200 bg-danger-50 px-5 py-4 flex items-center gap-3 text-danger-700">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-sm font-semibold">{{ error }}</p>
        </div>

        <!-- ================= KPIs DO MÊS ================= -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          <!-- Lucro do mês -->
          <div class="kpi-color bg-[#6B8577]">
            <div class="flex items-center justify-between">
              <p class="kpi-color-label">Lucro do mês</p>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="kpi-color-value">R$ {{ formatarPreco(currentMonthProfit) }}</p>
            <p class="kpi-color-sub">Margem: {{ currentMonthMargin }}%</p>
            <span *ngIf="profitVariation !== 0" class="kpi-color-pill" [class.kpi-color-pill-bad]="profitVariation < 0">
              {{ profitVariation > 0 ? '↑' : '↓' }} {{ Math.abs(profitVariation) }}% vs. mês passado
            </span>
          </div>

          <!-- Vendas do mês -->
          <div class="kpi-color bg-[#A9756A]">
            <div class="flex items-center justify-between">
              <p class="kpi-color-label">Vendas do mês</p>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <p class="kpi-color-value">{{ currentMonthItemsSold }}</p>
            <p class="kpi-color-sub">Ticket: R$ {{ formatarPreco(ticketMedio) }}</p>
            <span *ngIf="topSellingProduct" class="kpi-color-pill truncate max-w-full">Mais vendido: {{ topSellingProduct }}</span>
          </div>

          <!-- Margem geral -->
          <div class="kpi-color bg-[#A8926B]">
            <div class="flex items-center justify-between">
              <p class="kpi-color-label">Margem geral</p>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <p class="kpi-color-value">{{ margemMedia }}%</p>
            <p class="kpi-color-sub">Lucro: R$ {{ formatarPreco(totalProfit) }}</p>
            <span class="kpi-color-pill">Vendido: R$ {{ formatarPreco(totalSalesAmount) }}</span>
          </div>

          <!-- Estoque -->
          <div class="kpi-color bg-[#77706A]">
            <div class="flex items-center justify-between">
              <p class="kpi-color-label">Estoque</p>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <p class="kpi-color-value">{{ stockCount }}</p>
            <p class="kpi-color-sub">Investido: R$ {{ formatarPreco(stockValue) }}</p>
            <span *ngIf="oldStockCount > 0" class="kpi-color-pill kpi-color-pill-bad">{{ oldStockCount }} parado{{ oldStockCount !== 1 ? 's' : '' }} há +60 dias</span>
          </div>
        </div>

        <!-- ================= GRÁFICO 12 MESES + TOP ================= -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <section class="card p-5 sm:p-6 lg:col-span-3">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 class="font-display text-base font-bold text-ink">Vendas × lucro</h2>
                <p class="text-xs text-muted">Últimos {{ chartMonths.length }} meses · passe o mouse para ver os valores</p>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted">
                <span class="inline-flex items-center gap-1.5"><i class="w-3 h-3 rounded-sm bg-brand-200 inline-block"></i>Vendas</span>
                <span class="inline-flex items-center gap-1.5"><i class="w-3 h-3 rounded-sm bg-brand-600 inline-block"></i>Lucro</span>
              </div>
            </div>

            <div *ngIf="chartMonths.length > 0; else noChart" class="overflow-x-auto">
              <div class="min-w-[520px]">
                <div class="grid gap-2 items-end h-44 border-b border-line" [style.grid-template-columns]="'repeat(' + chartMonths.length + ', minmax(0, 1fr))'">
                  <div *ngFor="let m of chartMonths" class="group relative flex items-end justify-center gap-1 h-full cursor-pointer" (click)="openMonthSoldModal(m.stat)"
                       [title]="m.label + ' · vendas R$ ' + formatarPreco(m.vendas) + ' · lucro R$ ' + formatarPreco(m.lucro) + ' · margem ' + m.margem + '%'">
                    <div class="w-[38%] rounded-t-md bg-brand-200 group-hover:bg-brand-300 transition-colors" [style.height.%]="m.vendasPct"></div>
                    <div class="w-[38%] rounded-t-md bg-brand-600 group-hover:bg-brand-700 transition-colors" [style.height.%]="m.lucroPct"></div>
                    <div class="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded-md bg-ink text-white text-[11px] px-2 py-1 shadow-lg z-10">
                      R$ {{ formatarPreco(m.vendas) }} · lucro R$ {{ formatarPreco(m.lucro) }} · {{ m.margem }}%
                    </div>
                  </div>
                </div>
                <div class="grid gap-2 mt-2" [style.grid-template-columns]="'repeat(' + chartMonths.length + ', minmax(0, 1fr))'">
                  <p *ngFor="let m of chartMonths" class="text-[11px] text-muted text-center truncate">{{ m.label }}</p>
                </div>
              </div>
            </div>
            <ng-template #noChart>
              <p class="text-sm text-muted text-center py-12">Sem histórico de vendas ainda.</p>
            </ng-template>

            <dl class="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-line text-center">
              <div><dt class="kpi-label">Vendido no período</dt><dd class="font-display font-extrabold text-ink mt-1">R$ {{ formatarPreco(periodSales) }}</dd></div>
              <div><dt class="kpi-label">Lucro no período</dt><dd class="font-display font-extrabold text-success-700 mt-1">R$ {{ formatarPreco(periodProfit) }}</dd></div>
              <div><dt class="kpi-label">Melhor mês</dt><dd class="font-display font-extrabold text-ink mt-1">{{ capFirst(bestMonthLabel) || '—' }}</dd></div>
            </dl>
          </section>

          <section class="card p-5 sm:p-6 lg:col-span-2">
            <h2 class="font-display text-base font-bold text-ink mb-1">Mais vendidos</h2>
            <p class="text-xs text-muted mb-5">Top 3 por receita</p>
            <ol class="space-y-2.5">
              <li *ngFor="let item of topProducts; let i = index; trackBy: trackByProdutoFinanceiro"
                  class="flex items-center gap-3 p-3 rounded-xl border"
                  [class.border-brand-200]="i === 0" [class.bg-brand-50]="i === 0" [class.border-line]="i !== 0">
                <span class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-display font-extrabold text-sm"
                      [class.bg-brand-500]="i === 0" [class.text-white]="i === 0"
                      [class.bg-canvas-deep]="i !== 0" [class.text-muted]="i !== 0">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-ink truncate">{{ item.nome }}</p>
                  <p class="text-xs text-muted">{{ item.vezesVendido }}x vendido · margem {{ item.margem }}%</p>
                </div>
                <p class="text-sm font-bold text-ink shrink-0">R$ {{ formatarPreco(item.receitaTotal!) }}</p>
              </li>
              <li *ngIf="topProducts.length === 0" class="text-sm text-muted text-center py-8">Nenhuma venda registrada ainda.</li>
            </ol>

            <div class="mt-5 pt-5 border-t border-line grid grid-cols-2 gap-3 text-center">
              <div><p class="kpi-label">Vendido no total</p><p class="font-display font-extrabold text-ink mt-1">R$ {{ formatarPreco(totalSalesAmount) }}</p></div>
              <div><p class="kpi-label">Margem geral</p><p class="font-display font-extrabold text-ink mt-1">{{ margemMedia }}%</p></div>
            </div>
          </section>
        </div>

        <!-- ================= ESTOQUE ================= -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <section class="card p-5 sm:p-6 lg:col-span-3">
            <h2 class="font-display text-base font-bold text-ink mb-1">Estoque por categoria</h2>
            <p class="text-xs text-muted mb-5">Onde o dinheiro está parado e quanto pode virar receita</p>
            <div *ngIf="stockByCategory.length > 0; else noStock" class="space-y-3">
              <div *ngFor="let c of stockByCategory" class="grid grid-cols-[6rem_1fr_auto] sm:grid-cols-[9rem_1fr_auto] items-center gap-2 sm:gap-3 cursor-pointer group" (click)="goToCategory(c.name)" [title]="'Ver ' + c.name + ' na loja'">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-ink capitalize truncate group-hover:text-brand-700">{{ c.name }}</p>
                  <p class="text-[11px] text-muted">{{ c.count }} {{ c.count === 1 ? 'item' : 'itens' }}</p>
                </div>
                <div class="h-7 rounded-md bg-canvas-deep overflow-hidden">
                  <div class="h-full rounded-md bg-brand-500 min-w-[2px] transition-all duration-700" [style.width.%]="c.share"></div>
                </div>
                <div class="text-right w-24 sm:w-28">
                  <p class="text-sm font-bold text-ink">R$ {{ formatarPreco(c.cost) }}</p>
                  <p class="text-[11px] text-success-700">→ R$ {{ formatarPreco(c.potential) }}</p>
                </div>
              </div>
            </div>
            <ng-template #noStock><p class="text-sm text-muted text-center py-8">Nenhum produto disponível em estoque.</p></ng-template>
          </section>

          <section class="card p-5 sm:p-6 lg:col-span-2 space-y-5">
            <div>
              <h2 class="font-display text-base font-bold text-ink mb-1">Idade do estoque</h2>
              <p class="text-xs text-muted mb-4">Tempo desde o cadastro dos itens disponíveis</p>
              <div class="flex h-3 rounded-full overflow-hidden bg-canvas-deep">
                <div class="bg-success-600" [style.width.%]="stockAgePct.fresh" title="Até 30 dias"></div>
                <div class="bg-warning-600" [style.width.%]="stockAgePct.mid" title="31 a 60 dias"></div>
                <div class="bg-danger-600" [style.width.%]="stockAgePct.old" title="Mais de 60 dias"></div>
              </div>
              <dl class="grid grid-cols-3 gap-2 mt-3 text-center">
                <div><dd class="font-display font-extrabold text-lg text-success-700">{{ stockAge.fresh }}</dd><dt class="text-[11px] text-muted">até 30 dias</dt></div>
                <div><dd class="font-display font-extrabold text-lg text-warning-700">{{ stockAge.mid }}</dd><dt class="text-[11px] text-muted">31–60 dias</dt></div>
                <div><dd class="font-display font-extrabold text-lg text-danger-700">{{ stockAge.old }}</dd><dt class="text-[11px] text-muted">+60 dias</dt></div>
              </dl>
            </div>

            <div class="pt-5 border-t border-line">
              <h3 class="font-display text-sm font-bold text-ink mb-3">Novos × seminovos em estoque</h3>
              <div class="flex h-3 rounded-full overflow-hidden bg-canvas-deep">
                <div class="bg-brand-600" [style.width.%]="conditionPct.novo" title="Novos"></div>
                <div class="bg-brand-300" [style.width.%]="conditionPct.seminovo" title="Seminovos"></div>
              </div>
              <div class="flex justify-between text-xs text-muted mt-2">
                <span><b class="text-ink">{{ conditionSplit.novo }}</b> novos</span>
                <span><b class="text-ink">{{ conditionSplit.seminovo }}</b> seminovos</span>
              </div>
            </div>

            <div class="pt-5 border-t border-line grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-success-50 border border-success-100 p-3">
                <p class="kpi-label text-success-700">Potencial de venda</p>
                <p class="font-display font-extrabold text-ink mt-1">R$ {{ formatarPreco(stockPotentialValue) }}</p>
              </div>
              <div class="rounded-xl bg-canvas border border-line p-3">
                <p class="kpi-label">Em destaque</p>
                <p class="font-display font-extrabold text-ink mt-1">{{ featuredCount }} <span class="text-xs font-semibold text-muted">na vitrine</span></p>
              </div>
            </div>
          </section>
        </div>

        <!-- ================= PENDÊNCIAS + MENOR MARGEM ================= -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <section class="card p-5 sm:p-6 lg:col-span-3">
            <div class="flex items-start justify-between gap-3 mb-1">
              <h2 class="font-display text-base font-bold text-ink">Pendências do catálogo</h2>
              <span class="badge" [class.bg-danger-100]="pendenciasTotal > 0" [class.text-danger-700]="pendenciasTotal > 0" [class.bg-success-100]="pendenciasTotal === 0" [class.text-success-700]="pendenciasTotal === 0">
                {{ pendenciasTotal === 0 ? 'tudo em dia' : pendenciasTotal + (pendenciasTotal === 1 ? ' item' : ' itens') }}
              </span>
            </div>
            <p class="text-xs text-muted mb-5">O que resolver para vender mais e medir melhor</p>

            <div *ngIf="pendencias.length > 0; else noPend" class="space-y-2">
              <details *ngFor="let p of pendencias" class="group rounded-xl border border-line open:border-brand-200 open:bg-brand-50/40">
                <summary class="flex items-center gap-3 p-3 cursor-pointer select-none list-none">
                  <span class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-display font-extrabold text-sm"
                        [class.bg-danger-100]="p.key === 'parado'" [class.text-danger-700]="p.key === 'parado'"
                        [class.bg-warning-100]="p.key !== 'parado'" [class.text-warning-700]="p.key !== 'parado'">{{ p.items.length }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-ink">{{ p.title }}</p>
                    <p class="text-xs text-muted">{{ p.hint }}</p>
                  </div>
                  <svg class="w-4 h-4 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <ul class="px-3 pb-3 divide-y divide-line">
                  <li *ngFor="let prod of p.items | slice:0:8" class="flex items-center justify-between gap-3 py-2">
                    <div class="min-w-0">
                      <p class="text-sm text-ink truncate">{{ prod.name | capitalize }}</p>
                      <p class="text-[11px] text-muted">
                        <span class="capitalize">{{ prod.category || 'sem categoria' }}</span> · R$ {{ formatarPreco(prod.price) }}
                        <ng-container *ngIf="p.key === 'parado'"> · {{ daysSince(prod.createdAt) }} dias em estoque</ng-container>
                      </p>
                    </div>
                    <a [routerLink]="['/dashboard/produto', prod.id]" class="btn-secondary h-8 px-3 text-xs shrink-0">Abrir</a>
                  </li>
                  <li *ngIf="p.items.length > 8" class="pt-2 text-[11px] text-muted">e mais {{ p.items.length - 8 }}…</li>
                </ul>
              </details>
            </div>
            <ng-template #noPend>
              <div class="rounded-xl bg-success-50 border border-success-100 p-5 text-center">
                <p class="font-semibold text-success-700">Catálogo em dia</p>
                <p class="text-xs text-success-700/80 mt-0.5">Todos os produtos têm foto, custo, categoria e descrição.</p>
              </div>
            </ng-template>
          </section>

          <section class="card p-5 sm:p-6 lg:col-span-2">
            <h2 class="font-display text-base font-bold text-ink mb-1">Menor margem</h2>
            <p class="text-xs text-muted mb-5">Produtos que merecem revisão de preço</p>
            <ul class="divide-y divide-line">
              <li *ngFor="let produto of lowMarginProducts.slice(0, 5); trackBy: trackByProdutoFinanceiro" class="flex items-center justify-between gap-3 py-2.5">
                <div class="min-w-0">
                  <a [routerLink]="['/dashboard/produto', produto.id]" class="text-sm font-semibold text-ink truncate block hover:text-brand-700">{{ produto.nome }}</a>
                  <p class="text-xs text-muted capitalize">{{ produto.categoria }} · custo R$ {{ formatarPreco(produto.precoCusto) }} → venda R$ {{ formatarPreco(produto.preco) }}</p>
                </div>
                <span class="shrink-0 px-2 py-1 rounded-md text-xs font-bold"
                      [class.bg-danger-50]="produto.margem < 10" [class.text-danger-700]="produto.margem < 10"
                      [class.bg-warning-50]="produto.margem >= 10" [class.text-warning-700]="produto.margem >= 10">
                  {{ produto.margem }}%
                </span>
              </li>
              <li *ngIf="lowMarginProducts.length === 0" class="text-sm text-muted text-center py-8">Todas as margens estão saudáveis.</li>
            </ul>
          </section>
        </div>

        <!-- ================= HISTÓRICO ================= -->
        <section class="card overflow-hidden">
          <div class="px-5 sm:px-6 py-4 border-b border-line flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-base font-bold text-ink">Histórico mensal</h2>
              <p class="text-xs text-muted">Clique em um mês para ver os produtos vendidos.</p>
            </div>
            <button type="button" (click)="exportCsv()" [disabled]="monthlyStats.length === 0" class="btn-secondary h-9 px-3 text-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Exportar CSV
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="table-store min-w-[560px]">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th class="text-right">Vendas</th>
                  <th class="text-right hidden sm:table-cell">Custo</th>
                  <th class="text-right">Lucro</th>
                  <th class="text-right">Margem</th>
                  <th class="text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let stat of monthlyStats; trackBy: trackByMes" (click)="openMonthSoldModal(stat)" class="hover:bg-canvas cursor-pointer transition-colors">
                  <td class="font-semibold whitespace-nowrap">{{ capFirst(stat.mes) }}</td>
                  <td class="text-right">R$ {{ formatarPreco(stat.vendas) }}</td>
                  <td class="text-right text-muted hidden sm:table-cell">R$ {{ formatarPreco(stat.custo) }}</td>
                  <td class="text-right font-bold text-success-700">R$ {{ formatarPreco(stat.lucro) }}</td>
                  <td class="text-right font-semibold" [class.text-success-700]="stat.margem >= 15" [class.text-warning-700]="stat.margem < 15">{{ stat.margem }}%</td>
                  <td class="text-right">{{ stat.itensVendidos }}</td>
                </tr>
                <tr *ngIf="monthlyStats.length === 0"><td colspan="6" class="text-center text-muted py-8">Sem histórico ainda.</td></tr>
              </tbody>
              <tfoot *ngIf="monthlyStats.length > 0">
                <tr class="font-semibold">
                  <td>Total</td>
                  <td class="text-right">R$ {{ formatarPreco(periodSales) }}</td>
                  <td class="text-right text-muted hidden sm:table-cell">R$ {{ formatarPreco(periodCost) }}</td>
                  <td class="text-right text-success-700">R$ {{ formatarPreco(periodProfit) }}</td>
                  <td class="text-right">{{ periodMargin }}%</td>
                  <td class="text-right">{{ periodItems }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <!-- Modal: vendidos no mês -->
      <div *ngIf="isSoldMonthModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" (click)="closeSoldMonthModal()"></div>
        <div class="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl animate-fade-in">
          <div class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line">
            <div>
              <h3 class="font-display text-base font-bold text-ink">Vendas em {{ selectedMonthLabel }}</h3>
              <p class="text-xs text-muted">{{ soldProductsByMonth.length }} produto{{ soldProductsByMonth.length !== 1 ? 's' : '' }}</p>
            </div>
            <button type="button" (click)="closeSoldMonthModal()" class="btn-ghost w-9 h-9 rounded-lg p-0" aria-label="Fechar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 sm:p-6">
            <p *ngIf="loadingSoldMonth" class="text-sm text-muted py-6 text-center">Carregando produtos vendidos...</p>
            <p *ngIf="!loadingSoldMonth && soldProductsByMonth.length === 0" class="text-sm text-muted py-6 text-center">Nenhum produto vendido neste mês.</p>
            <ul *ngIf="!loadingSoldMonth && soldProductsByMonth.length > 0" class="divide-y divide-line max-h-80 overflow-y-auto">
              <li *ngFor="let sold of soldProductsByMonth; trackBy: trackByProdutoVendido" class="flex items-center justify-between gap-3 py-2.5">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-ink truncate">{{ sold.nome }}</p>
                  <p class="text-xs text-muted capitalize">{{ sold.categoria }} · vendido em {{ formatDate(sold.dataVenda) }}</p>
                </div>
                <p class="text-sm font-bold text-success-700 shrink-0">R$ {{ formatarPreco(sold.preco) }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FinancialDashboardComponent implements OnInit, OnDestroy {
  readonly financialService = inject(FinancialService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: DashboardResponse | null = null;
  monthlyStats: MonthlyStats[] = [];
  maxMonthProfit = 0;
  topProducts: ProductFinancial[] = [];
  lowMarginProducts: ProductFinancial[] = [];

  loading = true;
  error: string | null = null;
  lastUpdatedAt: Date | null = null;

  isSoldMonthModalOpen = false;
  loadingSoldMonth = false;
  selectedMonthLabel = '';
  soldProductsByMonth: SoldProduct[] = [];

  // Métricas derivadas do catálogo (calculadas em recomputeCatalogMetrics)
  avgDaysToSell: number | null = null;
  soldSampleSize = 0;
  stockByCategory: CategoryStock[] = [];
  stockAge = { fresh: 0, mid: 0, old: 0 };
  stockAgePct = { fresh: 0, mid: 0, old: 0 };
  conditionSplit = { novo: 0, seminovo: 0 };
  conditionPct = { novo: 0, seminovo: 0 };
  featuredCount = 0;
  pendencias: Pendencia[] = [];
  pendenciasTotal = 0;

  // Gráfico e totais do período
  chartMonths: ChartMonth[] = [];
  periodSales = 0;
  periodCost = 0;
  periodProfit = 0;
  periodItems = 0;
  periodMargin = 0;
  bestMonthLabel = '';

  Math = Math;
  private readonly destroy$ = new Subject<void>();

  // ---- getters do backend ---------------------------------------------------
  get currentMonthProfit(): number { return this.dashboard?.mesAtual.lucro ?? 0; }
  get currentMonthSales(): number { return this.dashboard?.mesAtual.vendas ?? 0; }
  get currentMonthMargin(): number { return this.dashboard?.mesAtual.margem ?? 0; }
  get currentMonthItemsSold(): number { return this.dashboard?.mesAtual.itensVendidos ?? 0; }
  get ticketMedio(): number { return this.dashboard?.mesAtual.ticketMedio ?? 0; }
  get topSellingProduct(): string { return this.dashboard?.mesAtual.produtoMaisVendido ?? ''; }
  get profitVariation(): number { return this.dashboard?.mesAtual.variacaoLucro ?? 0; }
  get totalProfit(): number { return this.dashboard?.geral.lucroTotal ?? 0; }
  get totalSalesAmount(): number { return this.dashboard?.geral.vendasTotais ?? 0; }
  get totalItemsSold(): number { return this.dashboard?.geral.itensVendidosTotal ?? 0; }
  get margemMedia(): number { return this.dashboard?.geral.margemMedia ?? 0; }
  get stockCount(): number { return this.dashboard?.estoque.quantidade ?? 0; }
  get stockValue(): number { return this.dashboard?.estoque.valorCusto ?? 0; }
  get stockPotentialValue(): number { return this.dashboard?.estoque.valorPotencial ?? 0; }
  get stockPotentialProfit(): number { return this.dashboard?.estoque.lucroPotencial ?? 0; }
  get oldStockCount(): number { return this.dashboard?.estoque.produtosParados ?? 0; }

  get lastUpdatedLabel(): string {
    return this.lastUpdatedAt
      ? this.lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
  }

  ngOnInit(): void {
    this.loadData(true, true);

    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadData(true, false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega tudo em paralelo: números do backend + catálogo completo
   * (o catálogo falhar não derruba o painel — as métricas derivadas ficam vazias).
   */
  loadData(forceRefresh: boolean = false, showLoading: boolean = true): void {
    if (showLoading) this.loading = true;
    this.error = null;

    forkJoin({
      dashboard: this.financialService.getDashboard(forceRefresh),
      evolution: this.financialService.getEvolution(24, forceRefresh),
      topProducts: this.financialService.getProducts('top', 3, forceRefresh),
      lowMargin: this.financialService.getProducts('baixa-margem', 5, forceRefresh),
      produtos: this.productService.buscarTodosProdutos().pipe(catchError(() => of([] as ProductResponse[])))
    }).subscribe({
      next: (data) => {
        this.dashboard = data.dashboard;
        this.monthlyStats = data.evolution.meses;
        this.maxMonthProfit = data.evolution.lucroMaximoMes;
        this.topProducts = data.topProducts.produtos;
        this.lowMarginProducts = data.lowMargin.produtos;
        this.lastUpdatedAt = new Date();

        this.recomputeChart();
        this.recomputeCatalogMetrics(data.produtos);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Sessão expirada. Faça login novamente.';
        } else if (err.status === 0) {
          this.error = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else {
          this.error = 'Erro ao carregar dados financeiros. Tente novamente.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refreshNow(): void {
    this.loadData(true, true);
  }

  // ---- gráfico e totais -----------------------------------------------------
  private recomputeChart(): void {
    const ordered = [...this.monthlyStats]
      .sort((a, b) => a.mesChave.localeCompare(b.mesChave))
      .slice(-12);
    const maxVendas = Math.max(1, ...ordered.map(m => m.vendas));

    this.chartMonths = ordered.map(stat => ({
      label: this.shortMonth(stat.mesChave),
      vendas: stat.vendas,
      lucro: stat.lucro,
      margem: stat.margem,
      vendasPct: Math.max(stat.vendas > 0 ? 3 : 0, Math.round(stat.vendas / maxVendas * 100)),
      lucroPct: Math.max(stat.lucro > 0 ? 3 : 0, Math.round(stat.lucro / maxVendas * 100)),
      stat
    }));

    this.periodSales = this.monthlyStats.reduce((s, m) => s + m.vendas, 0);
    this.periodCost = this.monthlyStats.reduce((s, m) => s + m.custo, 0);
    this.periodProfit = this.monthlyStats.reduce((s, m) => s + m.lucro, 0);
    this.periodItems = this.monthlyStats.reduce((s, m) => s + m.itensVendidos, 0);
    this.periodMargin = this.periodSales > 0 ? Math.round(this.periodProfit / this.periodSales * 100) : 0;

    const best = [...this.monthlyStats].sort((a, b) => b.lucro - a.lucro)[0];
    this.bestMonthLabel = best && best.lucro > 0 ? best.mes : '';
  }

  /** "2026-09" → "set/26" */
  private shortMonth(mesChave: string): string {
    const [y, m] = mesChave.split('-').map(Number);
    if (!y || !m) return mesChave;
    const nome = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${nome}/${String(y).slice(-2)}`;
  }

  // ---- métricas derivadas do catálogo ---------------------------------------
  private recomputeCatalogMetrics(produtos: ProductResponse[]): void {
    const dayMs = 86_400_000;
    const disponiveis = produtos.filter(p => p.disponivel === 1);
    const vendidos = produtos.filter(p => p.disponivel === 0 && p.soldDate && p.createdAt);

    // Tempo médio para vender (últimos 30 vendidos com datas válidas)
    const durations = vendidos
      .map(p => (new Date(p.soldDate!).getTime() - new Date(p.createdAt).getTime()) / dayMs)
      .filter(d => Number.isFinite(d) && d >= 0)
      .slice(-30);
    this.soldSampleSize = durations.length;
    this.avgDaysToSell = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

    // Estoque por categoria
    const byCat = new Map<string, CategoryStock>();
    for (const p of disponiveis) {
      const name = (p.category || 'sem categoria').trim().toLowerCase();
      const entry = byCat.get(name) ?? { name, count: 0, cost: 0, potential: 0, share: 0 };
      entry.count += 1;
      entry.cost += p.costPrice ?? 0;
      entry.potential += p.price ?? 0;
      byCat.set(name, entry);
    }
    const totalCost = [...byCat.values()].reduce((s, c) => s + c.cost, 0);
    const totalPotential = [...byCat.values()].reduce((s, c) => s + c.potential, 0);
    // Fatia da barra: pelo custo investido; se ninguém tem custo, pelo preço de venda
    const shareOf = (c: CategoryStock): number => {
      if (totalCost > 0) return Math.round(c.cost / totalCost * 100);
      if (totalPotential > 0) return Math.round(c.potential / totalPotential * 100);
      return 0;
    };
    this.stockByCategory = [...byCat.values()]
      .map(c => ({ ...c, share: shareOf(c) }))
      .sort((a, b) => b.cost - a.cost || b.count - a.count)
      .slice(0, 8);

    // Idade do estoque
    const age = { fresh: 0, mid: 0, old: 0 };
    for (const p of disponiveis) {
      const days = this.daysSince(p.createdAt);
      if (days <= 30) age.fresh++; else if (days <= 60) age.mid++; else age.old++;
    }
    this.stockAge = age;
    const totalAge = Math.max(1, age.fresh + age.mid + age.old);
    this.stockAgePct = { fresh: age.fresh / totalAge * 100, mid: age.mid / totalAge * 100, old: age.old / totalAge * 100 };

    // Novos × seminovos
    const novo = disponiveis.filter(p => p.condition === 'novo').length;
    const seminovo = disponiveis.length - novo;
    this.conditionSplit = { novo, seminovo };
    const totalCond = Math.max(1, disponiveis.length);
    this.conditionPct = { novo: novo / totalCond * 100, seminovo: seminovo / totalCond * 100 };

    this.featuredCount = disponiveis.filter(p => p.featured).length;

    // Pendências acionáveis
    const semFoto = disponiveis.filter(p => !p.images || p.images.length === 0);
    const semCusto = disponiveis.filter(p => !p.costPrice || p.costPrice <= 0);
    const semCategoria = disponiveis.filter(p => !p.category || /sem categoria/i.test(p.category));
    const semDescricao = disponiveis.filter(p => !p.description || p.description.trim().length < 20);
    const parados = disponiveis
      .filter(p => this.daysSince(p.createdAt) > 60)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const list: Pendencia[] = [
      { key: 'parado', title: 'Parados há mais de 60 dias', hint: 'Considere promoção ou colocar na vitrine de destaques', items: parados },
      { key: 'sem-foto', title: 'Sem foto', hint: 'Produtos sem foto quase não recebem cliques', items: semFoto },
      { key: 'sem-custo', title: 'Sem preço de custo', hint: 'Sem custo não dá para calcular a margem', items: semCusto },
      { key: 'sem-categoria', title: 'Sem categoria', hint: 'Não aparecem nos filtros nem na faixa de categorias', items: semCategoria },
      { key: 'sem-descricao', title: 'Descrição curta ou vazia', hint: 'Descrições ajudam o cliente a decidir e o Google a encontrar', items: semDescricao }
    ];
    this.pendencias = list.filter(p => p.items.length > 0);
    this.pendenciasTotal = this.pendencias.reduce((s, p) => s + p.items.length, 0);
  }

  daysSince(dateStr?: string): number {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
  }

  goToCategory(category: string): void {
    this.router.navigate(['/dashboard'], { queryParams: { categoria: category } });
  }

  // ---- exportação -----------------------------------------------------------
  exportCsv(): void {
    const linhas = [
      ['Mês', 'Vendas (R$)', 'Custo (R$)', 'Lucro (R$)', 'Margem (%)', 'Itens'],
      ...this.monthlyStats.map(m => [m.mes, (m.vendas / 100).toFixed(2), (m.custo / 100).toFixed(2), (m.lucro / 100).toFixed(2), String(m.margem), String(m.itensVendidos)])
    ];
    const csv = linhas.map(l => l.map(v => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `util-lar-historico-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- modal de vendidos no mês ---------------------------------------------
  openMonthSoldModal(stat: MonthlyStats): void {
    const [yearText, monthText] = stat.mesChave.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!year || !month) return;

    this.isSoldMonthModalOpen = true;
    this.loadingSoldMonth = true;
    this.selectedMonthLabel = stat.mes;
    this.soldProductsByMonth = [];
    this.cdr.markForCheck();

    this.financialService.getSoldProductsByMonth(year, month, true).subscribe({
      next: (response) => {
        this.soldProductsByMonth = response.produtos
          .slice()
          .sort((a, b) => (new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()));
        this.loadingSoldMonth = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.soldProductsByMonth = [];
        this.loadingSoldMonth = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeSoldMonthModal(): void {
    this.isSoldMonthModalOpen = false;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
  }

  trackByMes(_: number, stat: MonthlyStats): string { return stat.mesChave; }
  trackByProdutoFinanceiro(_: number, item: ProductFinancial): number { return item.id; }
  trackByProdutoVendido(_: number, item: SoldProduct): number { return item.id; }

  /** "setembro de 2026" → "Setembro de 2026" */
  capFirst(text: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  /** Centavos → "1.250,00" */
  formatarPreco(preco: number): string {
    return ((preco ?? 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

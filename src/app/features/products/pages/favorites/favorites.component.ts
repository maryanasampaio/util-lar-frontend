import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { ProductService } from '../../../products/services/product.service';
import { ProductResponse } from '../../../products/models/product.model';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { Subject, takeUntil, skip } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  template: `
    <div class="bg-canvas min-h-[60vh]">
      <!-- Cabeçalho -->
      <div class="bg-white border-b border-line">
        <div class="container-store py-6 sm:py-8">
          <p class="section-kicker mb-1">Sua lista</p>
          <h1 class="section-title">Meus favoritos</h1>
          <p class="text-sm text-muted mt-1">Produtos que você salvou para ver depois.</p>
        </div>
      </div>

      <div class="container-store py-8">
        <!-- Loading -->
        <div *ngIf="isLoading" class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
          <div *ngFor="let i of [1,2,3,4]" class="card overflow-hidden">
            <div class="skeleton rounded-none w-full aspect-square"></div>
            <div class="p-4 space-y-3">
              <div class="skeleton h-4 w-3/4"></div>
              <div class="skeleton h-3 w-1/3"></div>
              <div class="skeleton h-6 w-1/2 mt-3"></div>
              <div class="skeleton h-9 w-full"></div>
            </div>
          </div>
        </div>

        <!-- Vazio -->
        <div *ngIf="!isLoading && favoriteProducts.length === 0" class="card p-10 sm:p-16 text-center">
          <div class="w-20 h-20 rounded-2xl bg-accent-50 text-accent-400 flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <p class="text-lg font-bold text-ink mb-1.5">Nenhum favorito ainda</p>
          <p class="text-sm text-muted mb-6">Toque no coração dos produtos para salvá-los aqui</p>
          <button (click)="goToDashboard()" class="btn-primary h-11 px-6 text-sm">Ver produtos</button>
        </div>

        <!-- Grid -->
        <div *ngIf="!isLoading && favoriteProducts.length > 0" class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
          <article
            *ngFor="let produto of favoriteProducts; trackBy: trackByProductId"
            (click)="verDetalhes(produto.id)"
            class="card-hover flex flex-col overflow-hidden group cursor-pointer animate-fade-up">

            <div class="relative aspect-square bg-white border-b border-line overflow-hidden">
              <div class="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
                <span *ngIf="produto.condition === 'novo'" class="badge-new shadow-sm">Novo</span>
                <span *ngIf="produto.condition === 'seminovo'" class="badge-used shadow-sm">Seminovo</span>
              </div>

              <button
                (click)="removeFavorite(produto.id, $event)"
                class="overlay-btn is-active absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9"
                title="Remover dos favoritos" aria-label="Remover dos favoritos">
                <svg class="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>

              <div *ngIf="produto.disponivel === 0" class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                <span class="bg-ink text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg">VENDIDO</span>
              </div>

              <img
                *ngIf="produto.images && produto.images.length > 0"
                [src]="produto.images[0]"
                [alt]="produto.name"
                loading="lazy"
                class="w-full h-full object-contain p-3 group-hover:scale-[1.04] transition-transform duration-500">

              <div *ngIf="!produto.images || produto.images.length === 0" class="w-full h-full flex items-center justify-center text-brand-300">
                <svg class="h-20 w-20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>

            <div class="flex flex-col flex-1 p-3.5 sm:p-5">
              <span class="text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                {{ produto.category | capitalize }}
              </span>
              <h3 class="font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 text-ink mb-2 group-hover:text-brand-700 transition-colors">
                {{ produto.name | capitalize }}
              </h3>

              <div class="mt-auto">
                <div class="font-display text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink leading-tight">
                  R$ {{ formatarPreco(produto.price) }}
                </div>
                <div class="text-xs sm:text-[13px] text-muted mt-1">
                  em até <span class="font-semibold text-brand-700">12x de R$ {{ calculateInstallment12x(produto.price) }}</span>
                </div>
                <button (click)="verDetalhes(produto.id)" class="btn-primary w-full mt-3.5 h-10 sm:h-11 text-sm">
                  Ver detalhes
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteProducts: ProductResponse[] = [];
  isLoading = false;
  private readonly destroy$ = new Subject<void>();
  
  private readonly favoritesService = inject(FavoritesService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadFavorites();

    // skip(1) para não duplicar com o loadFavorites() acima
    this.favoritesService.favorites$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadFavorites();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFavorites(): void {
    const ids = this.favoritesService.getFavoriteIds();
    if (ids.length === 0) {
      this.favoriteProducts = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    this.productService.buscarTodosProdutos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.favoriteProducts = products.filter(p => ids.includes(p.id));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  removeFavorite(productId: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggle(productId);
    this.favoriteProducts = this.favoriteProducts.filter(p => p.id !== productId);
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/dashboard/produto', id]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatarPreco(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  /**
   * Calcula o valor da parcela em 12x usando a simulação Infinity (com repasse)
   * Taxa de 16.66% para 12 parcelas
   */
  calculateInstallment12x(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    const rate = 16.66 / 100;
    const finalAmount = priceInReais / (1 - rate);
    const installmentValue = finalAmount / 12;
    
    return (Math.round(installmentValue * 100) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  trackByProductId(index: number, produto: ProductResponse): number {
    return produto.id;
  }
}

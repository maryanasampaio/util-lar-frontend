import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    <div class="min-h-screen" style="background-color: #EEF2F5;">
      <!-- Header -->
      <header style="background: linear-gradient(to right, #7588A8, #7588A8, #95A7C1);">
        <div class="max-w-7xl mx-auto px-3 py-6 sm:px-4 sm:py-10">
          <button (click)="goToDashboard()" class="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>
          <h1 class="text-xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Meus Favoritos
          </h1>
          <p class="text-white/80 mt-2 text-sm sm:text-base">Produtos que você salvou para ver depois</p>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-20">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style="border-color: #7588A8;"></div>
            <p class="text-gray-600 text-lg">Carregando favoritos...</p>
          </div>
        </div>

        <!-- Lista Vazia -->
        <div *ngIf="!isLoading && favoriteProducts.length === 0" 
          class="bg-white rounded-xl p-16 text-center shadow-sm">
          <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <p class="text-gray-500 text-xl font-semibold mb-2">Nenhum favorito ainda</p>
          <p class="text-gray-400 mb-6">Clique no coração dos produtos para salvá-los aqui</p>
          <button (click)="goToDashboard()" 
            class="px-6 py-2.5 rounded-lg font-semibold text-white transition-colors"
            style="background-color: #7588A8;">
            Ver Produtos
          </button>
        </div>

        <!-- Grid de Favoritos -->
        <div *ngIf="!isLoading && favoriteProducts.length > 0" 
          class="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
          
          <article 
            *ngFor="let produto of favoriteProducts; trackBy: trackByProductId"
            (click)="verDetalhes(produto.id)"
            class="rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
            
            <!-- Imagem -->
            <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              <div class="absolute top-2 left-2 z-10 flex flex-col gap-1">
                <span 
                  *ngIf="produto.condition === 'novo'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md"
                  style="background-color: #d4f4dd; color: #2d6a3f;">
                  Novo
                </span>
                <span 
                  *ngIf="produto.condition === 'seminovo'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md"
                  style="background-color: #f5ebd4; color: #8b6914;">
                  Seminovo
                </span>
              </div>

              <!-- Botão Remover Favorito -->
              <button 
                (click)="removeFavorite(produto.id, $event)"
                class="absolute bottom-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                style="background-color: #DC2626;"
                title="Remover dos favoritos">
                <svg class="w-5 h-5" fill="white" stroke="white" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>

              <div *ngIf="produto.disponivel === 0" 
                class="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                <span class="bg-gray-700 text-white px-6 py-3 rounded-lg text-xl font-bold shadow-xl">
                  ✓ VENDIDO
                </span>
              </div>
              
              <img 
                *ngIf="produto.images && produto.images.length > 0" 
                [src]="produto.images[0]" 
                [alt]="produto.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              
              <div *ngIf="!produto.images || produto.images.length === 0" 
                class="w-full h-full flex items-center justify-center">
                <svg class="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            
            <!-- Conteúdo -->
            <div class="p-2.5 sm:p-4">
              <div class="mb-1.5">
                <h3 class="font-bold text-sm sm:text-base line-clamp-2 leading-tight" style="color: #23292A;">
                  {{ produto.name | capitalize }}
                </h3>
                <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold" style="background-color: #E6EBEF; color: #23292A;">
                  {{ produto.category | capitalize }}
                </span>
              </div>
              
              <div class="mb-2">
                <div class="text-base sm:text-xl font-bold" style="color: #23292A;">
                  R$ {{ formatarPreco(produto.price) }}
                </div>
              </div>
              
              <button 
                (click)="verDetalhes(produto.id)"
                class="w-full font-semibold py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm" style="background-color: #7588A8; color: #FFFFFF;" onmouseover="this.style.backgroundColor='#95A7C1'" onmouseout="this.style.backgroundColor='#7588A8'">
                Ver detalhes
              </button>
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

  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

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
    this.productService.buscarProdutos()
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

  trackByProductId(index: number, produto: ProductResponse): number {
    return produto.id;
  }
}

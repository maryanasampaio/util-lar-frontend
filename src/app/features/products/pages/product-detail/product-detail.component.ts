import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AdminModeService } from '../../../../core/services/admin-mode.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { AlertService } from '../../../../shared/services/alert.service';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  template: `
    <div class="bg-canvas min-h-[60vh]">
      <!-- Loading -->
      <div *ngIf="isLoading" class="container-store py-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-7 skeleton aspect-[4/3] rounded-2xl"></div>
          <div class="lg:col-span-5 space-y-4">
            <div class="skeleton h-4 w-1/3"></div>
            <div class="skeleton h-8 w-4/5"></div>
            <div class="skeleton h-32 w-full rounded-2xl"></div>
            <div class="skeleton h-12 w-full"></div>
          </div>
        </div>
      </div>

      <!-- Produto não encontrado -->
      <div *ngIf="!isLoading && !produto" class="container-store py-24 text-center">
        <div class="w-16 h-16 rounded-2xl bg-canvas-deep text-subtle flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 class="font-display text-2xl font-extrabold text-ink mb-2">Produto não encontrado</h2>
        <p class="text-sm text-muted mb-6">O produto que você procura não existe ou foi removido.</p>
        <button (click)="voltar()" class="btn-primary h-11 px-6 text-sm">Voltar para a loja</button>
      </div>

      <!-- Produto -->
      <div *ngIf="!isLoading && produto" class="container-store py-6 sm:py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs sm:text-sm text-muted mb-5" aria-label="Navegação">
          <button (click)="voltar()" class="font-semibold text-brand-700 hover:underline">Início</button>
          <svg class="w-3.5 h-3.5 text-subtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span class="capitalize">{{ produto.category | capitalize }}</span>
          <svg class="w-3.5 h-3.5 text-subtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span class="font-medium text-ink truncate max-w-[220px]">{{ produto.name | capitalize }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          <!-- ================= GALERIA ================= -->
          <div class="lg:col-span-7">
            <div class="flex flex-col gap-3">
              <!-- Foto principal: caixa se ajusta à proporção da foto -->
              <div class="flex items-start justify-center">
                <div class="group relative inline-block max-w-full rounded-2xl overflow-hidden bg-white border border-line shadow-card leading-none">
                  <img
                    *ngIf="produto.images && produto.images.length > 0"
                    [src]="produto.images[imagemPrincipalIndex]"
                    [alt]="produto.name"
                    class="block w-auto h-auto max-w-full max-h-[72vh] animate-fade-in">
                  <div *ngIf="!produto.images || produto.images.length === 0"
                       class="w-[640px] max-w-full aspect-[4/3] flex items-center justify-center bg-canvas text-line-strong">
                    <svg class="h-24 w-24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>

                  <!-- Vendido -->
                  <div *ngIf="produto.disponivel === 0" class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <span class="bg-ink text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide shadow-lg">VENDIDO</span>
                  </div>

                  <!-- Badges -->
                  <div class="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                    <span *ngIf="produto.originalPrice && produto.originalPrice > produto.price" class="badge-discount shadow">-{{ getDiscountPercent() }}%</span>
                    <button *ngIf="isAdmin" (click)="toggleFeatured($event)"
                            class="overlay-btn w-10 h-10" [class.is-featured]="produto.featured"
                            [title]="produto.featured ? 'Remover dos destaques' : 'Adicionar aos destaques'">
                      <svg class="w-5 h-5" [attr.fill]="produto.featured ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </button>
                  </div>

                  <!-- Ações -->
                  <div class="absolute top-3 right-3 z-10 flex gap-2">
                    <button (click)="shareProduct($event)" class="overlay-btn w-10 h-10" title="Compartilhar" aria-label="Compartilhar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    </button>
                    <button *ngIf="!isAdmin" (click)="toggleFavorite($event)" class="overlay-btn w-10 h-10" [class.is-active]="isFavorite()"
                            [title]="isFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" [attr.aria-label]="isFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
                      <svg class="w-5 h-5" [attr.fill]="isFavorite() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                  </div>

                  <!-- Navegação -->
                  <ng-container *ngIf="produto.images && produto.images.length > 1">
                    <button (click)="prevImage()" class="overlay-btn absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:opacity-0 lg:group-hover:opacity-100" aria-label="Foto anterior">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button (click)="nextImage()" class="overlay-btn absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:opacity-0 lg:group-hover:opacity-100" aria-label="Próxima foto">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    <span class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ink/70 text-white backdrop-blur-sm">
                      {{ imagemPrincipalIndex + 1 }} / {{ produto.images.length }}
                    </span>
                  </ng-container>
                </div>
              </div>

              <!-- Miniaturas -->
              <div *ngIf="produto.images && produto.images.length > 1" class="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                <button *ngFor="let img of produto.images; let i = index" (click)="selecionarImagem(i)"
                        class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all"
                        [class.border-accent-500]="i === imagemPrincipalIndex"
                        [class.border-line]="i !== imagemPrincipalIndex"
                        [class.opacity-60]="i !== imagemPrincipalIndex"
                        [class.hover:opacity-100]="i !== imagemPrincipalIndex"
                        [attr.aria-label]="'Foto ' + (i + 1)">
                  <img [src]="img" [alt]="produto.name + ' - foto ' + (i + 1)" class="w-full h-full object-contain p-1">
                </button>
              </div>
            </div>

            <!-- Descrição e especificações (desktop: abaixo da galeria) -->
            <div class="hidden lg:grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8 items-start">
              <ng-container *ngTemplateOutlet="infoBlocks"></ng-container>
            </div>
          </div>

          <!-- ================= CAIXA DE COMPRA ================= -->
          <aside class="lg:col-span-5 lg:sticky lg:top-36 space-y-4">
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span *ngIf="produto.condition === 'novo'" class="badge-new">Novo</span>
                <span *ngIf="produto.condition !== 'novo'" class="badge-used">Seminovo</span>
                <span class="badge-soft capitalize">{{ produto.category | capitalize }}</span>
                <span *ngIf="produto.brand" class="badge-brand normal-case tracking-normal">{{ produto.brand | capitalize }}</span>
              </div>

              <h1 class="font-display text-2xl sm:text-[28px] font-extrabold leading-tight tracking-tight text-ink">
                {{ produto.name | capitalize }}
              </h1>

              <div class="mt-5 pt-5 border-t border-line">
                <div *ngIf="produto.originalPrice && produto.originalPrice > produto.price" class="flex items-center gap-2 mb-1">
                  <span class="text-sm line-through text-subtle">R$ {{ formatarPreco(produto.originalPrice) }}</span>
                  <span class="badge-discount">{{ getDiscountPercent() }}% OFF</span>
                </div>
                <p class="font-display text-4xl font-extrabold tracking-tight text-ink">
                  <span class="text-2xl align-top font-bold text-muted mr-0.5">R$</span>{{ formatarPreco(produto.price) }}
                </p>
                <p class="text-sm text-muted mt-1.5">
                  ou em até <span class="font-semibold text-brand-700">12x de R$ {{ calculateInstallment12x(produto.price) }}</span> no cartão
                </p>
              </div>

              <div class="mt-5 space-y-2.5">
                <a *ngIf="produto.disponivel === 1" [href]="getWhatsAppLink()" target="_blank" rel="noopener noreferrer"
                   class="btn-whatsapp w-full h-12 text-base">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Tenho interesse
                </a>
                <button *ngIf="!isAdmin" (click)="toggleFavorite($event)" class="btn-secondary w-full h-11 text-sm">
                  <svg class="w-4 h-4" [class.text-accent-500]="isFavorite()" [attr.fill]="isFavorite() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  {{ isFavorite() ? 'Salvo nos favoritos' : 'Salvar nos favoritos' }}
                </button>

                <div *ngIf="produto.disponivel === 0" class="rounded-xl bg-canvas border border-line p-4 text-center">
                  <p class="font-bold text-ink">Produto vendido</p>
                  <p class="text-xs text-muted mt-0.5">Este item não está mais disponível. Fale conosco para opções semelhantes.</p>
                </div>
              </div>

              <ul class="mt-5 pt-5 border-t border-line space-y-2.5 text-sm text-muted">
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-success-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span *ngIf="produto.warranty; else noWarranty">Garantia de <span class="font-semibold text-ink">{{ produto.warranty }}</span></span>
                  <ng-template #noWarranty>Produto revisado e testado</ng-template>
                </li>
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-success-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Entrega combinada na sua região
                </li>
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-success-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Condições de pagamento pelo WhatsApp
                </li>
              </ul>
            </div>

            <!-- Admin -->
            <div *ngIf="isAdmin" class="card p-4 border-dashed">
              <p class="label">Ações do administrador</p>
              <div class="flex flex-col sm:flex-row gap-2">
                <button *ngIf="produto.disponivel === 1" (click)="marcarComoVendido()" class="btn-secondary flex-1 h-10 text-sm hover:border-success-600 hover:text-success-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Marcar como vendido
                </button>
                <button *ngIf="produto.disponivel === 0" (click)="reativarProduto()" class="btn-secondary flex-1 h-10 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Reativar produto
                </button>
              </div>
            </div>

            <!-- Descrição e especificações (mobile) -->
            <div class="lg:hidden space-y-4">
              <ng-container *ngTemplateOutlet="infoBlocks"></ng-container>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <ng-template #infoBlocks>
      <section class="card p-5 sm:p-6">
        <h2 class="font-display text-base font-bold text-ink mb-3">Descrição</h2>
        <p class="text-sm leading-relaxed text-muted whitespace-pre-line">{{ produto?.description | capitalize }}</p>
      </section>

      <section *ngIf="produto?.material || produto?.color || produto?.brand || produto?.warranty || produto?.dimensions" class="card p-5 sm:p-6">
        <h2 class="font-display text-base font-bold text-ink mb-3">Especificações</h2>
        <dl class="divide-y divide-line text-sm">
          <div *ngIf="produto?.brand" class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Marca</dt><dd class="font-semibold text-ink text-right">{{ produto?.brand | capitalize }}</dd></div>
          <div *ngIf="produto?.material" class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Material</dt><dd class="font-semibold text-ink text-right">{{ produto?.material | capitalize }}</dd></div>
          <div *ngIf="produto?.color" class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Cor</dt><dd class="font-semibold text-ink text-right">{{ produto?.color | capitalize }}</dd></div>
          <div *ngIf="produto?.dimensions" class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Dimensões (L × A × P)</dt><dd class="font-semibold text-ink text-right">{{ produto?.dimensions?.width }} × {{ produto?.dimensions?.height }} × {{ produto?.dimensions?.depth }} {{ produto?.dimensions?.unit }}</dd></div>
          <div *ngIf="produto?.warranty" class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Garantia</dt><dd class="font-semibold text-ink text-right">{{ produto?.warranty | capitalize }}</dd></div>
          <div class="flex justify-between gap-4 py-2.5"><dt class="text-muted">Condição</dt><dd class="font-semibold text-ink text-right">{{ produto?.condition === 'novo' ? 'Novo' : 'Seminovo' }}</dd></div>
        </dl>
      </section>
    </ng-template>
  `
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  produto?: Product;
  isLoading = true;
  imagemPrincipalIndex = 0;
  isAdmin = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
    public readonly adminModeService: AdminModeService,
    private readonly alertService: AlertService,
    private readonly favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID da rota:', id);
    
    // Verifica modo admin
    this.adminModeService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });
    
    if (id) {
      this.loadProduto(Number(id));
    } else {
      this.isLoading = false;
    }

    // Reatividade em tempo real: se o produto exibido for atualizado em
    // qualquer outra tela do mesmo navegador (dashboard, modal de edição,
    // marcar como vendido, reativar...), o ProductService atualiza o cache
    // e este componente reflete a mudança automaticamente.
    this.productService.getProdutosCache$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(produtos => {
        if (!this.produto || produtos.length === 0) {
          return;
        }
        const atualizado = produtos.find(p => p.id === this.produto!.id);
        if (atualizado && atualizado !== this.produto) {
          this.produto = atualizado;
          this.cdr.detectChanges();
        }
      });
  }

  loadProduto(id: number): void {
    console.log('Buscando produto com ID:', id);
    this.isLoading = true;
    this.imagemPrincipalIndex = 0; // Reset para primeira imagem
    this.productService.buscarProdutoPorId(id).subscribe({
      next: (produto) => {
        console.log('Produto encontrado:', produto);
        // Usar setTimeout para garantir que a view foi completamente hidratada
        setTimeout(() => {
          this.produto = produto;
          this.isLoading = false;
          console.log('Estado atualizado - isLoading:', this.isLoading, 'produto:', !!this.produto);
          this.cdr.detectChanges();
          console.log('DetectChanges chamado');
        }, 0);
      },
      error: (error) => {
        console.error('Erro ao buscar produto:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Observable completado');
      }
    });
  }

  marcarComoVendido(): void {
    if (!this.produto) return;
    
    this.alertService.confirm(
      'Marcar como Vendido',
      'Confirma que este produto foi vendido?',
      () => {
        this.productService.marcarComoVendido(this.produto!.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
              this.loadProduto(this.produto!.id);
            },
            error: (err) => {
              console.error('Erro ao marcar como vendido:', err);
              this.alertService.error('Erro', 'Não foi possível marcar como vendido. Verifique sua conexão e permissões.');
            }
          });
      }
    );
  }

  reativarProduto(): void {
    if (!this.produto) return;
    
    this.alertService.confirm(
      'Reativar Produto',
      'Deseja reativar este produto para venda?',
      () => {
        this.productService.reativarProduto(this.produto!.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
              this.loadProduto(this.produto!.id);
            },
            error: (err) => {
              console.error('Erro ao reativar produto:', err);
              this.alertService.error('Erro', 'Não foi possível reativar o produto. Verifique sua conexão e permissões.');
            }
          });
      }
    );
  }

  toggleFeatured(event: Event): void {
    event.stopPropagation();
    if (!this.produto) return;
    
    const newFeaturedStatus = !this.produto.featured;
    const action = newFeaturedStatus ? 'marcar como destaque' : 'remover destaque';
    
    // ⚡ Atualização otimista: UI muda IMEDIATAMENTE
    this.produto.featured = newFeaturedStatus;
    this.cdr.detectChanges();
    
    this.productService.atualizarProduto(this.produto.id, { featured: newFeaturedStatus } as any)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      )
      .subscribe({
        next: () => {
          console.log('[ProductDetail] Status de destaque alterado:', newFeaturedStatus);
        },
        error: (err) => {
          console.error('[ProductDetail] Erro ao alterar destaque:', err);
          
          // ⚠️ Reverte a mudança otimista em caso de erro
          if (this.produto) {
            this.produto.featured = !newFeaturedStatus;
            this.cdr.detectChanges();
          }
          
          this.alertService.error('Erro', `Não foi possível ${action}. Verifique sua conexão e permissões.`);
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  selecionarImagem(index: number): void {
    this.imagemPrincipalIndex = index;
  }

  prevImage(): void {
    if (!this.produto?.images) return;
    this.imagemPrincipalIndex = this.imagemPrincipalIndex === 0 
      ? this.produto.images.length - 1 
      : this.imagemPrincipalIndex - 1;
  }

  nextImage(): void {
    if (!this.produto?.images) return;
    this.imagemPrincipalIndex = this.imagemPrincipalIndex === this.produto.images.length - 1 
      ? 0 
      : this.imagemPrincipalIndex + 1;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.produto) {
      this.favoritesService.toggle(this.produto.id);
    }
  }

  isFavorite(): boolean {
    return this.produto ? this.favoritesService.isFavorite(this.produto.id) : false;
  }

  getDiscountPercent(): number {
    if (!this.produto?.originalPrice || this.produto.originalPrice <= this.produto.price) return 0;
    return Math.round(((this.produto.originalPrice - this.produto.price) / this.produto.originalPrice) * 100);
  }

  getWhatsAppLink(): string {
    if (!this.produto) return '';
    
    const numero = '5582996572843';
    const mensagem = `Olá! Tenho interesse no produto:\n\n*${this.produto.name}*\nPreço: R$ ${this.formatarPreco(this.produto.price)}\n\nPode me passar mais informações?`;
    
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
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
    
    return (Math.round(installmentValue * 100) / 100).toFixed(2).replace('.', ',');
  }

  shareProduct(event: Event): void {
    event.stopPropagation();
    if (!this.produto) return;

    const url = `${globalThis.location.origin}/dashboard/produto/${this.produto.id}`;
    const text = `${this.produto.name} - R$ ${this.formatarPreco(this.produto.price)}`;

    if (navigator.share) {
      navigator.share({
        title: this.produto.name,
        text: text,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        this.alertService.success('Link copiado!', 'O link do produto foi copiado para a área de transferência.');
      }).catch(() => {});
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

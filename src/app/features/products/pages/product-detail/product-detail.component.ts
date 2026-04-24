import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AdminModeService } from '../../../../core/services/admin-mode.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  template: `
    <div class="min-h-screen" style="background-color: #EEF2F5;">
      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-3" style="border-color: #7588A8;"></div>
          <p class="text-sm" style="color: #6B7785;">Carregando produto...</p>
        </div>
      </div>

      <!-- Produto não encontrado -->
      <div *ngIf="!isLoading && !produto" class="flex flex-col items-center justify-center min-h-screen px-4">
        <svg class="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="text-xl font-bold mb-2" style="color: #23292A;">Produto não encontrado</h2>
        <p class="text-sm mb-6" style="color: #6B7785;">O produto que você procura não existe ou foi removido.</p>
        <button 
          (click)="voltar()"
          class="px-6 py-2.5 rounded-lg font-semibold text-white transition-all text-sm"
          style="background-color: #7588A8;">
          Voltar para produtos
        </button>
      </div>

      <!-- Detalhes do Produto -->
      <div *ngIf="!isLoading && produto">
        <!-- Breadcrumb / Navegação -->
        <div class="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
          <nav class="flex items-center gap-2 text-xs sm:text-sm" style="color: #6B7785;">
            <button (click)="voltar()" class="hover:underline transition-colors" style="color: #7588A8;">Produtos</button>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span>{{ produto.category | capitalize }}</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="font-medium truncate max-w-[200px]" style="color: #23292A;">{{ produto.name | capitalize }}</span>
          </nav>
        </div>

        <div class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            <!-- COLUNA ESQUERDA: Galeria com miniaturas na lateral -->
            <div class="lg:col-span-7">
              <div class="flex flex-col-reverse sm:flex-row gap-3">
                <!-- Miniaturas verticais (lado esquerdo em desktop, abaixo em mobile) -->
                <div *ngIf="produto.images && produto.images.length > 1" 
                  class="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:max-h-[500px] pb-1 sm:pb-0 sm:pr-1">
                  <button 
                    *ngFor="let img of produto.images; let i = index" 
                    (click)="selecionarImagem(i)"
                    class="flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden transition-all duration-200"
                    [class.opacity-40]="i !== imagemPrincipalIndex"
                    [class.opacity-100]="i === imagemPrincipalIndex"
                    [style.border]="i === imagemPrincipalIndex ? '3px solid #7588A8' : '2px solid #D7DDE3'"
                    [style.box-shadow]="i === imagemPrincipalIndex ? '0 0 0 1px #7588A8' : 'none'">
                    <img [src]="img" [alt]="produto.name + ' - foto ' + (i+1)" class="w-full h-full object-cover">
                  </button>
                </div>

                <!-- Imagem Principal -->
                <div class="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-white shadow-lg" style="border: 1px solid #D7DDE3;">
                  <!-- Overlay Vendido -->
                  <div *ngIf="produto.disponivel === 0" 
                    class="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                    <span class="bg-white/90 px-8 py-3 rounded-xl text-lg font-bold shadow-xl" style="color: #23292A;">
                      VENDIDO
                    </span>
                  </div>

                  <!-- Botão Destaque (Admin) -->
                  <button
                    *ngIf="isAdmin"
                    (click)="toggleFeatured($event)"
                    class="absolute top-3 left-3 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    [style.background-color]="produto.featured ? '#FEF3C7' : 'rgba(255,255,255,0.9)'"
                    [style.border]="produto.featured ? '2px solid #F59E0B' : 'none'"
                    [title]="produto.featured ? 'Remover dos destaques' : 'Adicionar aos destaques'">
                    <svg class="w-6 h-6" [attr.fill]="produto.featured ? '#F59E0B' : 'none'" [attr.stroke]="produto.featured ? '#F59E0B' : '#6B7785'" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>

                  <!-- Botão Favorito -->
                  <button
                    *ngIf="!isAdmin"
                    (click)="toggleFavorite($event)"
                    class="absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    [style.background-color]="isFavorite() ? '#DC2626' : 'rgba(255,255,255,0.9)'"
                    [title]="isFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
                    <svg class="w-5 h-5" [attr.fill]="isFavorite() ? 'white' : 'none'" [attr.stroke]="isFavorite() ? 'white' : '#6B7785'" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>

                  <!-- Botão Compartilhar -->
                  <button
                    (click)="shareProduct($event)"
                    [class]="isAdmin ? 'absolute top-3 right-3 z-10' : 'absolute top-3 right-16 z-10'"
                    class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    style="background-color: rgba(255,255,255,0.9);"
                    title="Compartilhar">
                    <svg class="w-5 h-5" fill="none" stroke="#6B7785" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                  </button>

                  <!-- Badge Desconto -->
                  <div *ngIf="produto.originalPrice && produto.originalPrice > produto.price" 
                    class="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-md"
                    style="background-color: #FEE2E2; color: #DC2626;">
                    -{{ getDiscountPercent() }}%
                  </div>

                  <img 
                    *ngIf="produto.images && produto.images.length > 0" 
                    [src]="produto.images[imagemPrincipalIndex]" 
                    [alt]="produto.name"
                    class="w-full h-full object-cover">
                  <div *ngIf="!produto.images || produto.images.length === 0"
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <svg class="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <!-- Navegação -->
                  <button *ngIf="produto.images && produto.images.length > 1"
                    (click)="prevImage()" 
                    class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                    style="background-color: rgba(255,255,255,0.9); color: #23292A;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button *ngIf="produto.images && produto.images.length > 1"
                    (click)="nextImage()" 
                    class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                    style="background-color: rgba(255,255,255,0.9); color: #23292A;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>

                  <!-- Contador -->
                  <div *ngIf="produto.images && produto.images.length > 1"
                    class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                    style="background-color: rgba(0,0,0,0.6); color: white;">
                    {{ imagemPrincipalIndex + 1 }} / {{ produto.images.length }}
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUNA DIREITA: Informações -->
            <div class="lg:col-span-5 flex flex-col">
              <!-- Conteúdo scrollável -->
              <div class="flex-1 space-y-4">
                <!-- Badges -->
                <div class="flex flex-wrap items-center gap-2">
                  <span *ngIf="produto.condition === 'novo'"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style="background-color: #d4f4dd; color: #2d6a3f;">
                    Novo
                  </span>
                  <span *ngIf="produto.condition !== 'novo'"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style="background-color: #f5ebd4; color: #8b6914;">
                    Seminovo
                  </span>
                  <span class="px-3 py-1 rounded-full text-xs font-bold"
                    style="background-color: #EEF2F5; color: #7588A8;">
                    {{ produto.category | capitalize }}
                  </span>
                  <span *ngIf="produto.brand" class="px-3 py-1 rounded-full text-xs font-bold"
                    style="background-color: #EEF2F5; color: #23292A;">
                    {{ produto.brand | capitalize }}
                  </span>
                </div>

                <!-- Nome -->
                <h1 class="text-2xl sm:text-3xl font-bold leading-tight" style="color: #23292A;">
                  {{ produto.name | capitalize }}
                </h1>

                <!-- Preço -->
                <div class="p-4 rounded-xl" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
                  <div *ngIf="produto.originalPrice && produto.originalPrice > produto.price" class="flex items-center gap-2 mb-1">
                    <span class="text-sm line-through" style="color: #A0AEC0;">
                      R$ {{ formatarPreco(produto.originalPrice) }}
                    </span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded" style="background-color: #FEE2E2; color: #DC2626;">
                      -{{ getDiscountPercent() }}% OFF
                    </span>
                  </div>
                  <div class="text-3xl sm:text-4xl font-extrabold" style="color: #7588A8;">
                    R$ {{ formatarPreco(produto.price) }}
                  </div>
                  <div class="text-sm mt-1" style="color: #6B7785;">
                    ou até <span class="font-semibold">12x</span> de <span class="font-semibold text-base" style="color: #7588A8;">R$ {{ calculateInstallment12x(produto.price) }}</span>
                  </div>
                  <p class="text-xs mt-2" style="color: #A0AEC0;">
                    Condições de pagamento via WhatsApp
                  </p>
                </div>

                <!-- Separador -->
                <div class="h-px" style="background-color: #E6EBEF;"></div>

                <!-- Descrição -->
                <div>
                  <h2 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: #23292A;">Descrição</h2>
                  <p class="text-sm leading-relaxed" style="color: #6B7785;">
                    {{ produto.description | capitalize }}
                  </p>
                </div>

                <!-- Especificações (inline list style) -->
                <div *ngIf="produto.material || produto.color || produto.brand || produto.warranty || produto.dimensions">
                  <div class="h-px mb-4" style="background-color: #E6EBEF;"></div>
                  <h2 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: #23292A;">Especificações</h2>
                  <div class="space-y-2">
                    <div *ngIf="produto.material" class="flex items-center justify-between py-1.5 text-sm" style="border-bottom: 1px solid #F0F3F6;">
                      <span style="color: #6B7785;">Material</span>
                      <span class="font-semibold" style="color: #23292A;">{{ produto.material | capitalize }}</span>
                    </div>
                    <div *ngIf="produto.color" class="flex items-center justify-between py-1.5 text-sm" style="border-bottom: 1px solid #F0F3F6;">
                      <span style="color: #6B7785;">Cor</span>
                      <span class="font-semibold" style="color: #23292A;">{{ produto.color | capitalize }}</span>
                    </div>
                    <div *ngIf="produto.brand" class="flex items-center justify-between py-1.5 text-sm" style="border-bottom: 1px solid #F0F3F6;">
                      <span style="color: #6B7785;">Marca</span>
                      <span class="font-semibold" style="color: #23292A;">{{ produto.brand | capitalize }}</span>
                    </div>
                    <div *ngIf="produto.warranty" class="flex items-center justify-between py-1.5 text-sm" style="border-bottom: 1px solid #F0F3F6;">
                      <span style="color: #6B7785;">Garantia</span>
                      <span class="font-semibold" style="color: #23292A;">{{ produto.warranty | capitalize }}</span>
                    </div>
                    <div *ngIf="produto.dimensions" class="flex items-center justify-between py-1.5 text-sm">
                      <span style="color: #6B7785;">Dimensões</span>
                      <span class="font-semibold" style="color: #23292A;">
                        {{ produto.dimensions.width }} × {{ produto.dimensions.height }} × {{ produto.dimensions.depth }} {{ produto.dimensions.unit }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Área fixa do CTA (sempre no mesmo lugar) -->
              <div class="mt-6 space-y-3">
                <!-- Botão WhatsApp -->
                <div *ngIf="produto.disponivel === 1">
                  <a 
                    [href]="getWhatsAppLink()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-center gap-3 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Entrar em Contato
                  </a>
                </div>

                <!-- Produto Vendido -->
                <div *ngIf="produto.disponivel === 0" class="text-center p-4 rounded-xl" style="background-color: #F8FAFC; border: 2px solid #D7DDE3;">
                  <svg class="w-8 h-8 mx-auto mb-1.5" fill="none" stroke="#A0AEC0" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-base font-bold block" style="color: #6B7785;">Produto Vendido</span>
                  <p class="text-xs mt-0.5" style="color: #A0AEC0;">Este produto não está mais disponível</p>
                </div>

                <!-- Botões Admin -->
                <div *ngIf="isAdmin" class="flex flex-col sm:flex-row gap-2 p-3 rounded-xl" style="background-color: #F8FAFC; border: 1px dashed #D7DDE3;">
                  <button 
                    *ngIf="produto.disponivel === 1"
                    (click)="marcarComoVendido()"
                    class="flex-1 py-2.5 text-white rounded-lg font-bold transition-all shadow-md text-xs sm:text-sm"
                    style="background-color: #d4a650;">
                    ✓ Marcar como Vendido
                  </button>
                  <button 
                    *ngIf="produto.disponivel === 0"
                    (click)="reativarProduto()"
                    class="flex-1 py-2.5 text-white rounded-lg font-bold transition-all shadow-md text-xs sm:text-sm"
                    style="background-color: #5a8a6a;">
                    ↻ Reativar Produto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  produto?: Product;
  isLoading = true;
  imagemPrincipalIndex = 0;
  isAdmin = false;

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
    this.adminModeService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
    if (id) {
      this.loadProduto(Number(id));
    } else {
      this.isLoading = false;
    }
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
        this.productService.marcarComoVendido(this.produto!.id).subscribe({
          next: () => {
            this.alertService.success('Produto Vendido', 'O produto foi marcado como vendido!');
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
        this.productService.reativarProduto(this.produto!.id).subscribe({
          next: () => {
            this.alertService.success('Produto Reativado', 'O produto está disponível novamente para venda!');
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
    
    this.productService.atualizarProduto(this.produto.id, { featured: newFeaturedStatus } as any).subscribe({
      next: () => {
        console.log('[ProductDetail] Status de destaque alterado:', newFeaturedStatus);
        
        // Atualiza o produto localmente
        if (this.produto) {
          this.produto.featured = newFeaturedStatus;
          this.cdr.detectChanges();
        }
        
        // Mostra feedback ao usuário
        const message = newFeaturedStatus 
          ? 'Produto adicionado aos destaques da página inicial!' 
          : 'Produto removido dos destaques!';
        this.alertService.success('Destaque Atualizado', message);
      },
      error: (err) => {
        console.error('[ProductDetail] Erro ao alterar destaque:', err);
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

    const url = `${globalThis.location.origin}/produto/${this.produto.id}`;
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
}

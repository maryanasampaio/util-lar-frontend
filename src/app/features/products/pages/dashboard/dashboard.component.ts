import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductResponse, ProductFormData } from '../../models/product.model';
import { AdminModeService } from '../../../../core/services/admin-mode.service';
import { ProductTrackerService } from '../../../../core/services/product-tracker.service';
import { ProductFormModalComponent } from '../../components/product-form-modal/product-form-modal.component';
import { AdminLoginModalComponent } from '../../../../shared/components/admin-login-modal/admin-login-modal.component';
import { WelcomeModalComponent } from '../../../../shared/components/welcome-modal/welcome-modal.component';
import { PwaInstallPromptComponent } from '../../../../shared/components/pwa-install-prompt/pwa-install-prompt.component';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { AlertService } from '../../../../shared/services/alert.service';
import { finalize, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule, ProductFormModalComponent, AdminLoginModalComponent, WelcomeModalComponent, PwaInstallPromptComponent, CapitalizePipe]
})
export class DashboardComponent implements OnInit, OnDestroy {
  errorMessage = '';
  isLoading = false;
  produtos: ProductResponse[] = [];
  isAdmin = false;
  private readonly destroy$ = new Subject<void>();
  
  // Filtros
  selectedCategory: string = 'Todas';
  selectedCondition: string = 'Todas';
  selectedSort: string = 'populares';
  searchQuery: string = '';
  
  categories = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Sofás', value: 'Sofá' },
    { label: 'Mesas', value: 'Mesa' },
    { label: 'Armários', value: 'Guarda-Roupa' },
    { label: 'Cadeiras', value: 'Cadeira' },
    { label: 'Racks', value: 'Rack' },
    { label: 'Eletrodomésticos', value: 'Eletrodoméstico' }
  ];
  
  conditions = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Novo', value: 'novo' },
    { label: 'Seminovo', value: 'seminovo' }
  ];
  
  sortOptions = [
    { label: 'Mais populares', value: 'populares' },
    { label: 'Menor preço', value: 'menor-preco' },
    { label: 'Maior preço', value: 'maior-preco' },
    { label: 'Mais recentes', value: 'recentes' }
  ];
  
  // Modais
  showCreateModal = false;
  showEditModal = false;
  showAdminLoginModal = false;
  showWelcomeModal = false;
  selectedProduct?: Product;

  // PWA Installation
  canInstallPwa = false;
  private deferredPrompt: any = null;

  private get isRunningAsStandalone(): boolean {
    return globalThis.matchMedia?.('(display-mode: standalone)').matches
      || (globalThis.navigator as any)?.standalone === true;
  }
  
  // Contador de cliques para admin (triple-click na logo)

  constructor(
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    public readonly adminModeService: AdminModeService,
    private readonly alertService: AlertService,
    private readonly productTracker: ProductTrackerService
  ) {}

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit - iniciando componente');
    
    // Inscreve para mudanças no modo admin
    this.adminModeService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAdmin: boolean) => {
        console.log('[Dashboard] Admin mode alterado:', isAdmin);
        this.isAdmin = isAdmin;
        this.cdr.detectChanges();
      });

    // Verificar atualizações de produtos (notificações automáticas)
    this.productTracker.getUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Verificar se prompt foi capturado antes do Angular carregar
    const earlyPrompt = (globalThis as any).__pwaInstallPrompt;
    if (earlyPrompt) {
      this.deferredPrompt = earlyPrompt;
      delete (globalThis as any).__pwaInstallPrompt;
      if (!this.isRunningAsStandalone) {
        this.canInstallPwa = true;
      }
    }

    // iOS Safari não dispara beforeinstallprompt — mostrar botão manualmente
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && !this.isRunningAsStandalone) {
      this.canInstallPwa = true;
    }

    // Capturar evento se ainda não tiver sido disparado (Chrome/Edge/Android)
    globalThis.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('[Dashboard] beforeinstallprompt event capturado');
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstallPwa = true;
      this.cdr.detectChanges();
    });

    // Ocultar botão após instalação
    globalThis.addEventListener('appinstalled', () => {
      console.log('[Dashboard] App instalado com sucesso');
      this.canInstallPwa = false;
      this.deferredPrompt = null;
      this.cdr.detectChanges();
    });

    // Verificar se deve mostrar modal de boas-vindas
    this.checkWelcomeModal();

    console.log('[Dashboard] Chamando loadProdutos');
    this.loadProdutos();
  }

  ngOnDestroy(): void {
    console.log('[Dashboard] ngOnDestroy - limpando subscrições');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProdutos() {
    console.log('[Dashboard] loadProdutos - começando');
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.productService.buscarProdutos()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('[Dashboard] loadProdutos - finalizando (isLoading = false)');
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: ProductResponse[]) => {
          console.log('[Dashboard] loadProdutos - produtos recebidos:', resp.length);
          this.produtos = resp;
          this.checkForNewProducts();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Dashboard] loadProdutos - erro:', err);
          this.errorMessage = err?.message || 'Erro ao carregar produtos';
          this.cdr.detectChanges();
        }
      });
  }

  trackByProductId(index: number, produto: ProductResponse): number {
    return produto.id;
  }

  // Filtros combinados
  get filteredProducts(): ProductResponse[] {
    let filtered = [...this.produtos];
    
    // Filtro de busca
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );
    }
    
    // Filtro de categoria
    if (this.selectedCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    // Filtro de condição
    if (this.selectedCondition !== 'Todas') {
      filtered = filtered.filter(p => p.condition === this.selectedCondition);
    }
    
    // Ordenação
    switch (this.selectedSort) {
      case 'menor-preco':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'maior-preco':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'recentes':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'populares':
      default:
        // Mantém ordem padrão (featured primeiro, depois por ID)
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.id - a.id;
        });
    }
    
    return filtered;
  }
  
  // Gerar avaliação fictícia baseada no ID do produto (para consistência)
  getProductRating(productId: number): number {
    return 5; // Sempre 5 estrelas para simplicidade
  }
  
  getProductReviewCount(productId: number): number {
    // Gera número de avaliações baseado no ID (para ser consistente)
    const counts = [45, 42, 34, 28, 56, 38, 51];
    return counts[productId % counts.length];
  }

  // Instalar PWA
  async installPwa(): Promise<void> {
    if (this.deferredPrompt) {
      // Chrome / Edge / Android — prompt nativo
      console.log('[Dashboard] Mostrando prompt de instalação do PWA');
      this.deferredPrompt.prompt();

      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('[Dashboard] Usuário escolheu:', outcome);

      this.deferredPrompt = null;
      if (outcome === 'accepted') {
        this.canInstallPwa = false;
        this.cdr.detectChanges();
      }
      return;
    }

    // iOS Safari — não tem prompt automático, mostrar instrução
    this.alertService.success(
      'Adicionar à Tela de Início',
      'Toque em Compartilhar (□↑) na barra do Safari e depois em "Adicionar à Tela de Início".'
    );
  }

  checkWelcomeModal(): void {
    // Verifica se o usuário já viu o modal de boas-vindas
    const hasSeenWelcome = localStorage.getItem('welcomeModalShown');
    if (!hasSeenWelcome) {
      // Aguarda 1 segundo para mostrar o modal após a página carregar
      setTimeout(() => {
        this.showWelcomeModal = true;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  checkForNewProducts(): void {
    // Usar o ProductTrackerService para verificar novos produtos e mudanças de preço
    const updates = this.productTracker.checkForUpdates(this.produtos);
    
    if (updates.length > 0) {
      console.log(`[Dashboard] ${updates.length} atualizações encontradas`, updates);
    }
  }

  markNotificationsAsRead(): void {
    // Marcar todas as notificações como lidas
    this.productTracker.markAllAsRead();
  }

  // Admin login (ativado por double-click na logo)
  onLogoDoubleClick(): void {
    // Double-click detectado - mostrar modal de admin
    if (!this.isAdmin) {
      this.showAdminLoginModal = true;
    }
  }

  onAdminAuthenticated(password: string): void {
    const loginObservable = this.adminModeService.enableAdminMode(password);
    if (loginObservable) {
      loginObservable.subscribe({
        next: () => {
          console.log('[Dashboard] Admin autenticado com sucesso');
          this.showAdminLoginModal = false;
        },
        error: (error) => {
          console.error('[Dashboard] Erro ao autenticar admin:', error);
          
          // Mensagem específica baseada no erro
          let message = 'Erro ao fazer login.';
          
          if (error?.status === 401) {
            message = 'Senha incorreta ou usuário sem permissão de administrador.';
          } else if (error?.message) {
            message = error.message;
          } else if (!navigator.onLine) {
            message = 'Verifique sua conexão com a internet.';
          } else {
            message = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
          }
          
          this.alertService.error('Erro ao fazer login', message);
        }
      });
    } else {
      this.showAdminLoginModal = false;
    }
  }

  closeAdminLoginModal(): void {
    this.showAdminLoginModal = false;
  }

  closeWelcomeModal(): void {
    this.showWelcomeModal = false
  }

  toggleAdminMode(): void {
    const result = this.adminModeService.toggleAdminMode();
    if (result && typeof result.subscribe === 'function') {
      result.subscribe({
        next: () => {
          console.log('[Dashboard] Admin mode alternado com sucesso');
        },
        error: (error) => {
          console.error('[Dashboard] Erro ao alternar admin mode:', error);
        }
      });
    }
  }

  // Modal de criação
  openCreateModal(): void {
    this.selectedProduct = undefined;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedProduct = undefined;
  }

  // Navegação para página de detalhes
  verDetalhes(id: number): void {
    this.router.navigate(['/dashboard/produto', id]);
  }

  // Modal de edição
  openEditModal(produto: Product): void {
    console.log('[Dashboard] Abrindo modal de edição para produto:', produto);
    this.selectedProduct = { ...produto }; // Cria uma cópia para evitar mutação
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = undefined;
  }

  // CRUD Actions
  onCreateProduct(data: ProductFormData): void {
    this.productService.criarProduto(data).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadProdutos();
        this.alertService.success('Produto Criado', 'O produto foi adicionado com sucesso!');
      },
      error: (err) => {
        this.alertService.error('Erro ao criar produto', err.message || 'Não foi possível criar o produto.');
      }
    });
  }

  onUpdateProduct(data: ProductFormData): void {
    if (!this.selectedProduct) return;
    
    this.productService.atualizarProduto(this.selectedProduct.id, data).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadProdutos();
        this.alertService.success('Produto Atualizado', 'As alterações foram salvas com sucesso!');
      },
      error: (err) => {
        this.alertService.error('Erro ao atualizar produto', err.message || 'Não foi possível atualizar o produto.');
      }
    });
  }

  removerProduto(id: number, event: Event): void {
    event.stopPropagation();
    this.alertService.confirm(
      'Remover Produto',
      'Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita.',
      () => {
        this.productService.removerProduto(id).subscribe({
          next: () => {
            this.loadProdutos();
            this.alertService.success('Produto Removido', 'O produto foi removido com sucesso!');
          },
          error: (err) => {
            this.alertService.error('Erro ao remover produto', err.message || 'Não foi possível remover o produto.');
          }
        });
      }
    );
  }

  marcarComoVendido(id: number, event: Event): void {
    event.stopPropagation();
    this.alertService.confirm(
      'Marcar como Vendido',
      'Confirma que este produto foi vendido?',
      () => {
        this.productService.marcarComoVendido(id).subscribe({
          next: () => {
            console.log('[Dashboard] Produto marcado como vendido');
            this.loadProdutos();
            this.alertService.success('Produto Vendido', 'O produto foi marcado como vendido!');
          },
          error: (err) => {
            console.error('[Dashboard] Erro ao marcar como vendido:', err);
            this.alertService.error('Erro', 'Não foi possível marcar como vendido. Verifique sua conexão e permissões.');
          }
        });
      }
    );
  }

  reativarProduto(id: number, event: Event): void {
    event.stopPropagation();
    
    this.alertService.confirm(
      'Reativar Produto',
      'Deseja reativar este produto para venda?',
      () => {
        this.productService.reativarProduto(id).subscribe({
          next: () => {
            console.log('[Dashboard] Produto reativado');
            this.loadProdutos();
            this.alertService.success('Produto Reativado', 'O produto está disponível novamente para venda!');
          },
          error: (err) => {
            console.error('[Dashboard] Erro ao reativar produto:', err);
            this.alertService.error('Erro', 'Não foi possível reativar o produto. Verifique sua conexão e permissões.');
          }
        });
      }
    );
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
  }

  calcularLucro(produto: ProductResponse): number {
    if (!produto.costPrice) return 0;
    return produto.price - produto.costPrice;
  }
}



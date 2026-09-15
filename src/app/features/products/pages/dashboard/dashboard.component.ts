import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductResponse, ProductFormSubmission } from '../../models/product.model';
import { AdminModeService } from '../../../../core/services/admin-mode.service';
import { ProductTrackerService } from '../../../../core/services/product-tracker.service';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { MarketplacePublishModalComponent } from '../../components/marketplace-publish-modal/marketplace-publish-modal.component';
import { ProductFormModalComponent } from '../../components/product-form-modal/product-form-modal.component';
import { WelcomeModalComponent } from '../../../../shared/components/welcome-modal/welcome-modal.component';
import { PwaInstallPromptComponent } from '../../../../shared/components/pwa-install-prompt/pwa-install-prompt.component';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { AlertService } from '../../../../shared/services/alert.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { SimulationService } from '../../../simulations/services/simulation.service';
import { finalize, Subject, takeUntil, forkJoin, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule, ProductFormModalComponent, MarketplacePublishModalComponent, WelcomeModalComponent, PwaInstallPromptComponent, CapitalizePipe]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('featuredCarousel') featuredCarousel?: ElementRef<HTMLDivElement>;

  errorMessage = '';
  isLoading = false;
  isLoadingMore = false;
  isInitialLoad = true;
  produtos: ProductResponse[] = [];
  cachedFeaturedProducts: ProductResponse[] = [];
  isAdmin = false;
  favoritesCount = 0;
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();
  private searchQueryInternal: string = '';

  private filteredProductsCache: ProductResponse[] | null = null;
  private lastFilterSignature: string = '';

  currentFeaturedIndex = 0;
  currentCarouselPage = 0;
  readonly itemsPerPage = 3;
  private featuredAutoplayId: any = null;

  selectedCategory: string = 'Todas';
  selectedCondition: string = 'Todas';
  selectedSort: string = 'populares';

  get searchQuery(): string {
    return this.searchQueryInternal;
  }
  set searchQuery(value: string) {
    this.searchQueryInternal = value;
    this.searchSubject$.next(value);
  }

  selectedBrand: string = '';
  priceMin: number | null = null;
  priceMax: number | null = null;
  priceMinApplied: number | null = null;
  priceMaxApplied: number | null = null;
  showMobileFilters = false;
  filterSections = {
    category: true,
    brand: true,
    price: true,
    condition: true
  } as { [key: string]: boolean; category: boolean; brand: boolean; price: boolean; condition: boolean };

  get brands(): { name: string }[] {
    const seen = new Set<string>();
    return this.produtos
      .map(p => p.brand?.trim())
      .filter((b): b is string => !!b)
      .filter(b => {
        if (seen.has(b)) return false;
        seen.add(b);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map(name => ({ name }));
  }

  get categories(): { label: string; value: string }[] {
    const seen = new Set<string>();
    const dynamic = this.produtos
      .map(p => p.category?.trim())
      .filter((c): c is string => !!c)
      .filter(c => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map(value => ({ label: value, value }));

    return [{ label: 'Todas', value: 'Todas' }, ...dynamic];
  }

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

  readonly heroHighlights = [
    { title: 'Qualidade garantida', text: 'Produtos revisados e testados antes de anunciar.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { title: 'Até 12x no cartão', text: 'Parcele sua compra e leve hoje.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { title: 'Entrega rápida', text: 'Combinamos a entrega na sua região.', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    { title: 'Atendimento humano', text: 'Tire dúvidas direto no WhatsApp.', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
  ];

  scrollToProducts(): void {
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  heroIndex = 0;
  heroPerPage = 3;
  private heroAutoplayId: any = null;
  private heroPagesCache: { key: string; pages: ProductResponse[][] } | null = null;

  get heroPages(): ProductResponse[][] {
    const items = this.recentProducts;
    const key = `${this.heroPerPage}:${items.map(p => p.id).join(',')}`;
    if (this.heroPagesCache?.key === key) return this.heroPagesCache.pages;
    const pages: ProductResponse[][] = [];
    for (let i = 0; i < items.length; i += this.heroPerPage) {
      pages.push(items.slice(i, i + this.heroPerPage));
    }
    this.heroPagesCache = { key, pages };
    if (this.heroIndex >= pages.length) this.heroIndex = 0;
    return pages;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const perPage = window.innerWidth < 640 ? 1 : 3;
    if (perPage !== this.heroPerPage) {
      this.heroPerPage = perPage;
      this.heroIndex = 0;
      this.cdr.detectChanges();
    }
  }

  get recentProducts(): ProductResponse[] {
    return [...this.produtos]
      .filter(p => p.disponivel === 1)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 9);
  }

  goHero(index: number): void {
    const total = this.heroPages.length;
    if (total === 0) return;
    this.heroIndex = ((index % total) + total) % total;
    this.restartHeroAutoplay();
  }

  nextHero(): void {
    this.goHero(this.heroIndex + 1);
  }

  prevHero(): void {
    this.goHero(this.heroIndex - 1);
  }

  private heroTouchStartX: number | null = null;

  onHeroTouchStart(event: TouchEvent): void {
    this.heroTouchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onHeroTouchEnd(event: TouchEvent): void {
    if (this.heroTouchStartX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? this.heroTouchStartX) - this.heroTouchStartX;
    this.heroTouchStartX = null;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? this.nextHero() : this.prevHero();
  }

  private restartHeroAutoplay(): void {
    if (this.heroAutoplayId) clearInterval(this.heroAutoplayId);
    this.heroAutoplayId = setInterval(() => {
      const total = this.heroPages.length;
      if (total > 1) {
        this.heroIndex = (this.heroIndex + 1) % total;
        this.cdr.detectChanges();
      }
    }, 3000);
  }

  showCreateModal = false;
  showEditModal = false;
  showAdminLoginModal = false;
  adminLoginLoading = false;
  adminLoginError = '';
  showMarketplacePublishModal = false;
  showWelcomeModal = false;
  marketplaceDraftProduct?: Product;
  marketplaceTextCopied = false;
  selectedProduct?: Product;

  canInstallPwa = false;
  private deferredPrompt: any = null;

  private get isRunningAsStandalone(): boolean {
    return globalThis.matchMedia?.('(display-mode: standalone)').matches
      || (globalThis.navigator as any)?.standalone === true;
  }

  constructor(
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    public readonly adminModeService: AdminModeService,
    private readonly alertService: AlertService,
    private readonly productTracker: ProductTrackerService,
    private readonly favoritesService: FavoritesService,
    private readonly simulationService: SimulationService,
    private readonly sidebarService: SidebarService,
    private readonly catalog: CatalogService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit - iniciando componente');

    this.onWindowResize();

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const categoria = params.get('categoria');
        if (categoria) {
          this.setCategory(categoria);
          setTimeout(() => this.scrollToProducts(), 300);
        }
        if (params.get('novo') === '1') {
          setTimeout(() => { if (this.isAdmin) this.openCreateModal(); }, 300);
        }
        if (categoria || params.get('novo')) {
          this.router.navigate([], { queryParams: {}, replaceUrl: true });
        }
      });
    this.restartHeroAutoplay();

    this.catalog.search$
      .pipe(takeUntil(this.destroy$))
      .subscribe(q => {
        if (q !== this.searchQueryInternal) this.searchQuery = q;
      });
    this.catalog.category$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cat => {
        if (cat !== this.selectedCategory) {
          this.selectedCategory = cat;
          this.cdr.detectChanges();
        }
      });

    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cdr.detectChanges();
    });

    this.adminModeService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAdmin: boolean) => {
        console.log('[Dashboard] Admin mode alterado:', isAdmin);
        this.isAdmin = isAdmin;
        this.cdr.detectChanges();
      });

    this.favoritesService.count$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.favoritesCount = count;
        this.cdr.detectChanges();
      });

    this.productTracker.getUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    const earlyPrompt = (globalThis as any).__pwaInstallPrompt;
    if (earlyPrompt) {
      this.deferredPrompt = earlyPrompt;
      delete (globalThis as any).__pwaInstallPrompt;
      if (!this.isRunningAsStandalone) {
        this.canInstallPwa = true;
      }
    }

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && !this.isRunningAsStandalone) {
      this.canInstallPwa = true;
    }

    globalThis.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('[Dashboard] beforeinstallprompt event capturado');
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstallPwa = true;
      this.cdr.detectChanges();
    });

    globalThis.addEventListener('appinstalled', () => {
      console.log('[Dashboard] App instalado com sucesso');
      this.canInstallPwa = false;
      this.deferredPrompt = null;
      this.cdr.detectChanges();
    });

    this.checkWelcomeModal();

    console.log('[Dashboard] Chamando loadProdutos');
    this.loadProdutos(false);

    this.productService.getProdutosCache$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(produtos => {
        if (produtos.length === 0 && this.produtos.length === 0) {
          return;
        }
        this.produtos = produtos;
        this.invalidateFilterCache();
        this.updateFeaturedProductsCache();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    console.log('[Dashboard] ngOnDestroy - limpando subscrições');
    if (this.heroAutoplayId) clearInterval(this.heroAutoplayId);
    this.stopFeaturedAutoplay();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProdutos(forceReload = false) {
    console.log('[Dashboard] loadProdutos - começando (forceReload:', forceReload, ')');

    if (this.isInitialLoad || this.produtos.length === 0) {
      this.isLoading = true;
    }

    this.errorMessage = '';
    this.cdr.detectChanges();

    this.productService.buscarProdutos(forceReload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('[Dashboard] loadProdutos - finalizando (isLoading = false)');
          this.isLoading = false;
          this.isInitialLoad = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: ProductResponse[]) => {
          console.log('[Dashboard] loadProdutos - produtos recebidos:', resp.length);
          this.produtos = resp;

          this.invalidateFilterCache();

          this.updateFeaturedProductsCache();

          console.log('[Dashboard] Produtos featured disponíveis:', this.cachedFeaturedProducts.length);

          const available = resp.filter(p => p.disponivel === 1);
          if (available.length > 0 && this.priceMin == null && this.priceMax == null) {
            this.priceMin = Math.min(...available.map(p => p.price)) / 100;
            this.priceMax = Math.max(...available.map(p => p.price)) / 100;
          }
          this.checkForNewProducts();

          this.cdr.detectChanges();

          if (this.cachedFeaturedProducts.length > 0) {
            this.startFeaturedAutoplay();
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Dashboard] loadProdutos - erro:', err);
          console.error('[Dashboard] loadProdutos - status:', err?.status, '| body:', err?.error);
          this.errorMessage = err?.message || 'Erro ao carregar produtos';
          this.cdr.detectChanges();
        }
      });
  }

  trackByProductId(index: number, produto: ProductResponse): number {
    return produto.id;
  }

  getDiscountPercent(produto: ProductResponse): number {
    if (!produto.originalPrice || produto.originalPrice <= produto.price) return 0;
    return Math.round(((produto.originalPrice - produto.price) / produto.originalPrice) * 100);
  }

  toggleFavorite(productId: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggle(productId);
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

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

  goToFavorites(): void {
    this.router.navigate(['/favoritos']);
  }

  goToNotifications(): void {
    this.router.navigate(['/configuracoes']);
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  shareProduct(produto: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const url = `${globalThis.location.origin}/dashboard/produto/${produto.id}`;
    const text = `${produto.name} - R$ ${this.formatarPreco(produto.price)}`;

    if (navigator.share) {
      navigator.share({
        title: produto.name,
        text: text,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        this.alertService.success('Link copiado!', 'O link do produto foi copiado para a área de transferência.');
      }).catch(() => {});
    }
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = this.selectedBrand === brand ? '' : brand;
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.catalog.setCategory(category);
  }

  setCondition(condition: string): void {
    this.selectedCondition = condition;
  }

  setSort(sort: string): void {
    this.selectedSort = sort;
  }

  readonly brandsInsertIndex = 8;

  get productsBeforeBrands(): ProductResponse[] {
    return this.filteredProducts.slice(0, this.brandsInsertIndex);
  }

  get productsAfterBrands(): ProductResponse[] {
    return this.filteredProducts.slice(this.brandsInsertIndex);
  }

  get hasMoreProducts(): boolean {
    return this.productService.temMaisPaginas();
  }

  loadMoreProducts(): void {
    if (this.isLoadingMore || !this.hasMoreProducts) {
      return;
    }

    this.isLoadingMore = true;
    this.productService.carregarProximaPagina()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingMore = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (produtos) => {
          this.produtos = produtos;
          this.invalidateFilterCache();
          this.updateFeaturedProductsCache();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Dashboard] Erro ao carregar mais produtos:', err);
          this.alertService.error('Erro', 'Não foi possível carregar mais produtos.');
        }
      });
  }

  private updateFeaturedProductsCache(): void {
    const maxFeatured = this.itemsPerPage * 3;

    let featured = this.produtos
      .filter(p => !!p.featured && p.disponivel === 1)
      .slice(0, maxFeatured);

    if (featured.length === 0 && this.produtos.length > 0) {
      console.warn('[Dashboard] Nenhum produto featured encontrado. Usando fallback com produtos recentes.');
      featured = this.produtos
        .filter(p => p.disponivel === 1)
        .sort((a, b) => b.id - a.id)
        .slice(0, maxFeatured);
    }

    this.cachedFeaturedProducts = [...featured];

    this.cdr.detectChanges();

    if (this.cachedFeaturedProducts.length === 0 && this.produtos.length > 0) {
      console.warn('[Dashboard] Nenhum produto disponível para o carrossel.');
      console.warn('[Dashboard] Total de produtos:', this.produtos.length);
      console.warn('[Dashboard] Produtos com featured=true:', this.produtos.filter(p => !!p.featured).length);
      console.warn('[Dashboard] Produtos disponíveis:', this.produtos.filter(p => p.disponivel === 1).length);
    } else {
      console.log('[Dashboard] Carrossel atualizado com', this.cachedFeaturedProducts.length, 'produtos');
      console.log('[Dashboard] IDs dos produtos no carrossel:', this.cachedFeaturedProducts.map(p => p.id));
    }
  }

  get featuredProducts(): ProductResponse[] {
    return this.cachedFeaturedProducts;
  }

  get filteredProducts(): ProductResponse[] {
    const currentSignature = JSON.stringify({
      search: this.searchQueryInternal,
      brand: this.selectedBrand,
      category: this.selectedCategory,
      condition: this.selectedCondition,
      priceMin: this.priceMinApplied,
      priceMax: this.priceMaxApplied,
      sort: this.selectedSort,
      productsLength: this.produtos.length
    });

    if (this.lastFilterSignature === currentSignature && this.filteredProductsCache) {
      return this.filteredProductsCache;
    }

    let filtered = [...this.produtos];

    if (this.searchQueryInternal.trim()) {
      const tokens = this.normalizeSearchText(this.searchQueryInternal)
        .split(/\s+/)
        .filter(t => t.length > 0);

      if (tokens.length > 0) {
        filtered = filtered.filter(p => {
          const haystack = this.normalizeSearchText(
            `${p.name ?? ''} ${p.category ?? ''} ${p.brand ?? ''} ${p.description ?? ''}`
          );

          return tokens.every(token => haystack.includes(token));
        });
      }
    }

    if (this.selectedBrand) {
      const brand = this.normalizeSearchText(this.selectedBrand);
      filtered = filtered.filter(p =>
        this.normalizeSearchText(p.brand ?? '').includes(brand)
      );
    }

    if (this.selectedCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedCondition !== 'Todas') {
      filtered = filtered.filter(p => p.condition === this.selectedCondition);
    }

    if (this.priceMinApplied != null) {
      const minCentavos = this.priceMinApplied * 100;
      filtered = filtered.filter(p => p.price >= minCentavos);
    }
    if (this.priceMaxApplied != null) {
      const maxCentavos = this.priceMaxApplied * 100;
      filtered = filtered.filter(p => p.price <= maxCentavos);
    }

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
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.id - a.id;
        });
    }

    this.filteredProductsCache = filtered;
    this.lastFilterSignature = currentSignature;

    return filtered;
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'Todas' ||
           this.selectedCondition !== 'Todas' ||
           !!this.selectedBrand ||
           this.priceMinApplied != null ||
           this.priceMaxApplied != null;
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'Todas') count++;
    if (this.selectedCondition !== 'Todas') count++;
    if (this.selectedBrand) count++;
    if (this.priceMinApplied != null || this.priceMaxApplied != null) count++;
    return count;
  }

  toggleFilterSection(section: string): void {
    this.filterSections[section] = !this.filterSections[section];
  }

  applyPriceFilter(): void {
    this.priceMinApplied = this.priceMin;
    this.priceMaxApplied = this.priceMax;
  }

  clearAllFilters(): void {
    this.catalog.setCategory('Todas');
    this.catalog.setSearch('');
    this.selectedCategory = 'Todas';
    this.selectedCondition = 'Todas';
    this.selectedBrand = '';
    this.priceMin = this.globalMinPrice;
    this.priceMax = this.globalMaxPrice;
    this.priceMinApplied = null;
    this.priceMaxApplied = null;
    this.searchQuery = '';
    this.invalidateFilterCache();
  }

  private invalidateFilterCache(): void {
    this.filteredProductsCache = null;
    this.lastFilterSignature = '';
  }

  get globalMinPrice(): number {
    const available = this.produtos.filter(p => p.disponivel === 1);
    if (available.length === 0) return 0;
    return Math.min(...available.map(p => p.price)) / 100;
  }

  get globalMaxPrice(): number {
    const available = this.produtos.filter(p => p.disponivel === 1);
    if (available.length === 0) return 0;
    return Math.max(...available.map(p => p.price)) / 100;
  }

  get sliderMinPercent(): number {
    const min = this.globalMinPrice;
    const max = this.globalMaxPrice;
    if (max <= min) return 0;
    return ((this.priceMin ?? min) - min) / (max - min) * 100;
  }

  get sliderMaxPercent(): number {
    const min = this.globalMinPrice;
    const max = this.globalMaxPrice;
    if (max <= min) return 100;
    return ((this.priceMax ?? max) - min) / (max - min) * 100;
  }

  formatPriceDisplay(value: number | null): string {
    if (value == null) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onSliderMinInput(event: Event): void {
    this.priceMin = +(event.target as HTMLInputElement).value;
  }

  onSliderMaxInput(event: Event): void {
    this.priceMax = +(event.target as HTMLInputElement).value;
  }

  getProductRating(productId: number): number {
    return 5;
  }

  getProductReviewCount(productId: number): number {
    const counts = [45, 42, 34, 28, 56, 38, 51];
    return counts[productId % counts.length];
  }

  async installPwa(): Promise<void> {
    if (this.deferredPrompt) {
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

    this.alertService.success(
      'Adicionar à Tela de Início',
      'Toque em Compartilhar (□↑) na barra do Safari e depois em "Adicionar à Tela de Início".'
    );
  }

  checkWelcomeModal(): void {
    const hasSeenWelcome = localStorage.getItem('welcomeModalShown');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        this.showWelcomeModal = true;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  checkForNewProducts(): void {
    const updates = this.productTracker.checkForUpdates(this.produtos);

    if (updates.length > 0) {
      console.log(`[Dashboard] ${updates.length} atualizações encontradas`, updates);
    }
  }

  markNotificationsAsRead(): void {
    this.productTracker.markAllAsRead();
  }

  onLogoDoubleClick(): void {
    if (!this.isAdmin) {
      this.showAdminLoginModal = true;
    }
  }

  onAdminAuthenticated(password: string): void {
    const loginObservable = this.adminModeService.enableAdminMode(password);
    if (loginObservable) {
      loginObservable
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.cdr.detectChanges())
        )
        .subscribe({
          next: () => {
            console.log('[Dashboard] Admin autenticado com sucesso');
            this.showAdminLoginModal = false;
          },
          error: (error) => {
            console.error('[Dashboard] Erro ao autenticar admin:', error);

          let message: string;

          if (error?.status === 401) {
            message = 'Senha incorreta ou usuário sem permissão de administrador.';
          } else if (error?.message) {
            message = error.message;
          } else if (navigator.onLine === false) {
            message = 'Verifique sua conexão com a internet.';
          } else {
            message = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
          }

          this.alertService.error('Erro ao fazer login', message);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.showAdminLoginModal = false;
      this.cdr.detectChanges();
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
      result
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.cdr.detectChanges())
        )
        .subscribe({
          next: () => {
            console.log('[Dashboard] Admin mode alternado com sucesso');
          },
          error: (error) => {
            console.error('[Dashboard] Erro ao alternar admin mode:', error);
          }
        });
    }
  }

  openCreateModal(): void {
    this.selectedProduct = undefined;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedProduct = undefined;
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/dashboard/produto', id]);
  }

  scrollFeatured(direction: 'left' | 'right'): void {
    const carousel = this.featuredCarousel?.nativeElement;
    if (!carousel) return;

    const totalPages = Math.ceil(this.featuredProducts.length / this.itemsPerPage);

    if (direction === 'left') {
      this.currentCarouselPage = Math.max(0, this.currentCarouselPage - 1);
    } else {
      this.currentCarouselPage = Math.min(totalPages - 1, this.currentCarouselPage + 1);
    }

    const scrollAmount = carousel.offsetWidth;
    const targetScroll = scrollAmount * this.currentCarouselPage;

    carousel.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    this.restartFeaturedAutoplay();
  }

  private startFeaturedAutoplay(): void {
    this.stopFeaturedAutoplay();
    if (this.featuredProducts.length <= this.itemsPerPage) return;

    this.featuredAutoplayId = setInterval(() => {
      const totalPages = Math.ceil(this.featuredProducts.length / this.itemsPerPage);

      if (this.currentCarouselPage >= totalPages - 1) {
        this.currentCarouselPage = 0;
        const carousel = this.featuredCarousel?.nativeElement;
        if (carousel) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        }
      } else {
        this.goToFeaturedPage(this.currentCarouselPage + 1);
      }
      this.cdr.detectChanges();
    }, 3000);
  }

  private stopFeaturedAutoplay(): void {
    if (this.featuredAutoplayId) {
      clearInterval(this.featuredAutoplayId);
      this.featuredAutoplayId = null;
    }
  }

  private restartFeaturedAutoplay(): void {
    this.startFeaturedAutoplay();
  }

  private scrollFeaturedToIndex(index: number): void {
    const carousel = this.featuredCarousel?.nativeElement;
    if (!carousel) return;

    this.currentFeaturedIndex = index;
    const scrollAmount = carousel.offsetWidth * 0.9;
    carousel.scrollTo({
      left: scrollAmount * index,
      behavior: 'smooth'
    });
  }

  goToFeatured(index: number): void {
    this.scrollFeaturedToIndex(index);
    this.restartFeaturedAutoplay();
  }

  goToFeaturedPage(pageIndex: number): void {
    const carousel = this.featuredCarousel?.nativeElement;
    if (!carousel) return;

    this.currentCarouselPage = pageIndex;
    const scrollAmount = carousel.offsetWidth;
    carousel.scrollTo({
      left: scrollAmount * pageIndex,
      behavior: 'smooth'
    });
    this.restartFeaturedAutoplay();
  }

  get carouselPages(): number[] {
    const totalPages = Math.ceil(this.featuredProducts.length / this.itemsPerPage);
    return new Array(totalPages).fill(0).map((_, i) => i);
  }

  openEditModal(produto: Product): void {
    console.log('[Dashboard] Abrindo modal de edição para produto:', produto);
    this.selectedProduct = { ...produto };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = undefined;
  }

  onCreateProduct(submission: ProductFormSubmission): void {
    this.productService.criarProduto(submission.product)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      )
      .subscribe({
        next: (product) => {
          this.closeCreateModal();

          const newProduct = {
            ...product,
            images: product.images || null
          } as ProductResponse;

          this.produtos = [newProduct, ...this.produtos];
          this.invalidateFilterCache();
          this.updateFeaturedProductsCache();
          this.cdr.detectChanges();

          if (submission.publishToFacebookMarketplace) {
            this.openMarketplacePublishModal(product);
            return;
          }
        },
        error: (err) => {
          this.alertService.error('Erro ao criar produto', err.message || 'Não foi possível criar o produto.');
        }
      });
  }

  onUpdateProduct(submission: ProductFormSubmission): void {
    if (!this.selectedProduct) return;

    const productData = { ...submission.product };

    const currentPrice = this.selectedProduct.price;
    const newPrice = productData.price;
    if (newPrice < currentPrice) {
      (productData as any).originalPrice = this.selectedProduct.originalPrice || currentPrice;
    } else if (newPrice >= (this.selectedProduct.originalPrice || currentPrice)) {
      (productData as any).originalPrice = null;
    }

    this.productService.atualizarProduto(this.selectedProduct.id, productData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      )
      .subscribe({
        next: (updated) => {
          this.closeEditModal();

          if (this.selectedProduct) {
            const idx = this.produtos.findIndex(p => p.id === this.selectedProduct!.id);
            if (idx !== -1) {
              const updatedProduct = { ...this.produtos[idx], ...productData, ...updated };
              this.produtos[idx] = updatedProduct;
              this.produtos = [...this.produtos];
              this.invalidateFilterCache();
              this.updateFeaturedProductsCache();
              this.cdr.detectChanges();
            }
          }
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
        const backupProdutos = [...this.produtos];
        this.produtos = this.produtos.filter(p => p.id !== id);
        this.invalidateFilterCache();
        this.updateFeaturedProductsCache();
        this.cdr.detectChanges();

        this.productService.removerProduto(id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
            },
            error: (err) => {
              this.produtos = backupProdutos;
              this.invalidateFilterCache();
              this.updateFeaturedProductsCache();
              this.cdr.detectChanges();
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
        const produto = this.produtos.find(p => p.id === id);
        const previousState = produto?.disponivel;
        if (produto) {
          produto.disponivel = 0;
          this.invalidateFilterCache();
          this.updateFeaturedProductsCache();
          this.cdr.detectChanges();
        }

        this.productService.marcarComoVendido(id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
              console.log('[Dashboard] Produto marcado como vendido');
            },
            error: (err) => {
              console.error('[Dashboard] Erro ao marcar como vendido:', err);

              if (produto && previousState !== undefined) {
                produto.disponivel = previousState;
                this.invalidateFilterCache();
                this.updateFeaturedProductsCache();
                this.cdr.detectChanges();
              }
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
        const produto = this.produtos.find(p => p.id === id);
        const previousState = produto?.disponivel;
        if (produto) {
          produto.disponivel = 1;
          this.invalidateFilterCache();
          this.updateFeaturedProductsCache();
          this.cdr.detectChanges();
        }

        this.productService.reativarProduto(id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
              console.log('[Dashboard] Produto reativado');
            },
            error: (err) => {
              console.error('[Dashboard] Erro ao reativar produto:', err);

              if (produto && previousState !== undefined) {
                produto.disponivel = previousState;
                this.invalidateFilterCache();
                this.updateFeaturedProductsCache();
                this.cdr.detectChanges();
              }
              this.alertService.error('Erro', 'Não foi possível reativar o produto. Verifique sua conexão e permissões.');
            }
          });
      }
    );
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
  }

  private normalizeSearchText(text: string): string {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  clearAllFeatured(): void {
    const featuredProducts = this.cachedFeaturedProducts;

    if (featuredProducts.length === 0) {
      this.alertService.info('Carrossel Vazio', 'Não há produtos em destaque para remover.');
      return;
    }

    this.alertService.confirm(
      'Limpar Carrossel',
      `Deseja remover todos os ${featuredProducts.length} produtos do carrossel de destaques?`,
      () => {
        console.log('[Dashboard] Limpando todos os destaques...');

        const backupProdutos = [...this.produtos];
        this.produtos = this.produtos.map(p => {
          if (p.featured) {
            return { ...p, featured: false };
          }
          return p;
        });
        this.invalidateFilterCache();
        this.updateFeaturedProductsCache();
        this.cdr.detectChanges();

        const updates$ = featuredProducts.map(produto =>
          this.productService.atualizarProduto(produto.id, { featured: false } as any)
        );

        forkJoin(updates$)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.cdr.detectChanges())
          )
          .subscribe({
            next: () => {
              console.log('[Dashboard] Todos os produtos desmarcados como destaque');
              this.alertService.success('Carrossel Limpo', 'Todos os produtos foram removidos dos destaques!');
            },
            error: (err) => {
              console.error('[Dashboard] Erro ao limpar destaques:', err);

              this.produtos = backupProdutos;
              this.invalidateFilterCache();
              this.updateFeaturedProductsCache();
              this.cdr.detectChanges();
              this.alertService.error('Erro', 'Não foi possível remover todos os produtos dos destaques. Alguns podem ter sido removidos.');
            }
          });
      }
    );
  }

  calcularLucro(produto: ProductResponse): number {
    if (!produto.costPrice) return 0;
    return produto.price - produto.costPrice;
  }

  closeMarketplacePublishModal(): void {
    this.showMarketplacePublishModal = false;
    this.marketplaceDraftProduct = undefined;
    this.marketplaceTextCopied = false;
  }

  private async openMarketplacePublishModal(product: Product): Promise<void> {
    this.marketplaceDraftProduct = product;
    this.marketplaceTextCopied = await this.copyFacebookMarketplaceText(product);
    this.showMarketplacePublishModal = true;
    this.cdr.detectChanges();
  }

  private buildFacebookMarketplaceText(product: Product): string {
    const details = [
      product.category && `Categoria: ${product.category}`,
      product.condition && `Condição: ${product.condition === 'novo' ? 'Novo' : 'Seminovo'}`,
      product.material && `Material: ${product.material}`,
      product.color && `Cor: ${product.color}`,
      product.brand && `Marca: ${product.brand}`,
      product.warranty && `Garantia: ${product.warranty}`,
      `Estoque: ${product.stock}`
    ].filter(Boolean);

    const productUrl = `${globalThis.location.origin}/dashboard/produto/${product.id}`;

    return [
      `${product.name} - ${this.formatCurrency(product.price)}`,
      product.description,
      details.join(' | '),
      `Veja mais detalhes: ${productUrl}`
    ]
      .filter((section) => section && section.trim().length > 0)
      .join('\n\n');
  }

  private async copyFacebookMarketplaceText(product: Product): Promise<boolean> {
    if (!globalThis.navigator?.clipboard?.writeText) {
      return false;
    }

    try {
      await globalThis.navigator.clipboard.writeText(this.buildFacebookMarketplaceText(product));
      return true;
    } catch (error) {
      console.error('[Dashboard] Não foi possível copiar o texto do Marketplace:', error);
      return false;
    }
  }

  private formatCurrency(valueInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInCents / 100);
  }
}

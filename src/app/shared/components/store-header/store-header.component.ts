import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AdminModeService } from '../../../core/services/admin-mode.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

export const STORE_WHATSAPP_URL =
  'https://wa.me/5582996572843?text=Ol%C3%A1!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos.';

/**
 * Header da loja — compartilhado por todas as páginas.
 * Barra superior (contato) + barra principal (logo, busca, ações) + faixa de categorias.
 */
@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="sticky top-0 z-40">
      <!-- Barra superior -->
      <div class="bg-brand-900 text-white/85 text-[11px] sm:text-xs">
        <div class="container-store flex items-center justify-between h-8">
          <p class="flex items-center gap-1.5 truncate">
            <svg class="w-3.5 h-3.5 text-brand-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="truncate"><b class="font-bold text-white">Parcele em até 12x</b> no cartão · Entrega rápida em Alagoas</span>
          </p>
          <a [href]="whatsappUrl" target="_blank" rel="noopener noreferrer"
             class="hidden sm:flex items-center gap-1.5 font-semibold text-white hover:text-brand-200 transition-colors">
            <svg class="w-3.5 h-3.5 text-whatsapp" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            (82) 99657-2843
          </a>
        </div>
      </div>

      <!-- Barra principal -->
      <div class="bg-white border-b border-line shadow-header">
        <div class="container-store">
          <div class="flex items-center gap-3 sm:gap-5 h-16 sm:h-[72px]">
            <!-- Menu admin -->
            <button
              *ngIf="isAdmin"
              (click)="sidebar.toggle()"
              class="btn-ghost w-10 h-10 rounded-lg p-0 -ml-2"
              aria-label="Abrir menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>

            <!-- Logo -->
            <a routerLink="/dashboard" (dblclick)="onLogoDoubleClick($event)"
               class="flex items-center gap-2.5 shrink-0 select-none" title="Util Lar">
              <img src="logo-utilar-transparente.png" alt="Útil Lar Móveis" class="h-9 sm:h-11 w-auto object-contain">
            </a>

            <!-- Busca (desktop) -->
            <form class="hidden md:flex flex-1 max-w-2xl mx-auto" (submit)="onSubmit($event)" role="search">
              <ng-container *ngTemplateOutlet="searchBox"></ng-container>
            </form>

            <!-- Ações -->
            <div class="flex items-center gap-1 sm:gap-2 ml-auto">
              <button *ngIf="canInstallPwa" (click)="pwa.install()"
                      class="btn-soft hidden lg:inline-flex h-10 px-3.5 text-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Instalar app
              </button>

              <a routerLink="/favoritos" class="header-icon" title="Meus favoritos" aria-label="Meus favoritos">
                <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <span *ngIf="favoritesCount > 0" class="header-badge">{{ favoritesCount }}</span>
                <span class="header-icon-label">Favoritos</span>
              </a>

              <a *ngIf="!isAdmin" routerLink="/configuracoes" class="header-icon" title="Notificações" aria-label="Notificações">
                <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <span class="header-icon-label">Avisos</span>
              </a>

              <a [href]="whatsappUrl" target="_blank" rel="noopener noreferrer"
                 class="btn-whatsapp hidden sm:inline-flex h-10 px-4 text-sm ml-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Fale conosco
              </a>
            </div>
          </div>

          <!-- Busca (mobile) -->
          <form class="md:hidden pb-3" (submit)="onSubmit($event)" role="search">
            <ng-container *ngTemplateOutlet="searchBox"></ng-container>
          </form>
        </div>
      </div>

      <!-- Faixa de categorias -->
      <nav class="bg-white/95 backdrop-blur border-b border-line" aria-label="Categorias">
        <div class="container-store">
          <div class="flex items-center gap-1 overflow-x-auto hide-scrollbar h-11 -mx-1">
            <button (click)="selectCategory('Todas')" class="cat-link" [class.active]="activeCategory === 'Todas'">
              Todos os produtos
            </button>
            <button *ngFor="let cat of categories" (click)="selectCategory(cat)"
                    class="cat-link capitalize" [class.active]="activeCategory === cat">
              {{ cat }}
            </button>
            <span class="flex-1"></span>
            <button *ngIf="isAdmin" routerLink="/gerenciamento" class="cat-link shrink-0 text-accent-600 hover:text-accent-700">
              Painel admin
            </button>
          </div>
        </div>
      </nav>
    </header>

    <ng-template #searchBox>
      <div class="relative w-full">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="search"
          [ngModel]="query"
          (ngModelChange)="onQueryChange($event)"
          name="q"
          autocomplete="off"
          placeholder="O que você procura? Sofá, geladeira, mesa..."
          aria-label="Buscar produtos"
          class="input pl-11 pr-24 h-11 rounded-full bg-canvas border-transparent focus:bg-white">
        <button type="submit" class="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full text-xs">
          Buscar
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .header-icon {
      position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 2.75rem; height: 2.75rem; border-radius: 0.5rem; color: var(--color-ink);
      transition: background-color .2s, color .2s;
    }
    .header-icon:hover { background: var(--color-canvas); color: var(--color-brand-600); }
    .header-icon-label { display: none; font-size: 10px; font-weight: 600; color: var(--color-muted); margin-top: 2px; }
    .header-badge {
      position: absolute; top: 4px; right: 4px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px;
      background: var(--color-accent-500); color: #fff; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #fff;
    }
    .cat-link {
      flex-shrink: 0; padding: 0 .75rem; height: 100%; font-size: 13px; font-weight: 600; color: var(--color-muted);
      border-bottom: 2px solid transparent; white-space: nowrap; transition: color .2s, border-color .2s;
    }
    .cat-link:hover { color: var(--color-ink); }
    .cat-link.active { color: var(--color-ink); border-bottom-color: var(--color-brand-500); }
    @media (min-width: 640px) {
      .header-icon { width: auto; height: auto; padding: .375rem .625rem; }
      .header-icon-label { display: block; }
      .header-badge { top: 2px; right: 4px; }
    }
  `]
})
export class StoreHeaderComponent implements OnInit, OnDestroy {
  readonly sidebar = inject(SidebarService);
  readonly pwa = inject(PwaInstallService);
  private readonly adminMode = inject(AdminModeService);
  private readonly favorites = inject(FavoritesService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly whatsappUrl = STORE_WHATSAPP_URL;
  isAdmin = false;
  favoritesCount = 0;
  canInstallPwa = false;
  categories: string[] = [];
  activeCategory = 'Todas';
  query = '';

  ngOnInit(): void {
    this.adminMode.isAdmin$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.isAdmin = v; this.cdr.markForCheck(); });
    this.favorites.count$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.favoritesCount = v; this.cdr.markForCheck(); });
    this.pwa.canInstall$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.canInstallPwa = v; this.cdr.markForCheck(); });
    this.catalog.categories$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.categories = v; this.cdr.markForCheck(); });
    this.catalog.category$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.activeCategory = v; this.cdr.markForCheck(); });
    this.catalog.search$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.query = v; this.cdr.markForCheck(); });

    // Fora da página de produtos a faixa não deve destacar nenhuma categoria
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.catalog.setSearch(value);
    if (value && !this.isOnCatalog) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.catalog.setSearch(this.query);
    this.goToProducts();
  }

  selectCategory(category: string): void {
    this.catalog.setCategory(category);
    this.goToProducts();
  }

  onLogoDoubleClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isAdmin) this.catalog.requestAdminLogin();
  }

  private get isOnCatalog(): boolean {
    return this.router.url.split('?')[0] === '/dashboard';
  }

  private goToProducts(): void {
    const scroll = () => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (this.isOnCatalog) {
      scroll();
    } else {
      this.router.navigate(['/dashboard']).then(() => setTimeout(scroll, 150));
    }
  }
}

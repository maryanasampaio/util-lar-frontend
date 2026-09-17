import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminModeService } from '../../../core/services/admin-mode.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AlertService } from '../../services/alert.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      class="fixed left-0 top-0 h-full w-64 z-50 flex flex-col bg-brand-900 border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out">

      <!-- Cabeçalho -->
      <div class="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <img src="logo-branca.png" alt="Util Lar" class="w-6 h-6 object-contain">
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold text-white">Util Lar</p>
            <p class="text-[10px] font-semibold uppercase tracking-wider text-accent-400">Painel admin</p>
          </div>
        </div>
        <button
          (click)="closeSidebar()"
          class="btn w-8 h-8 rounded-lg p-0 text-brand-300 hover:bg-white/10 hover:text-white"
          aria-label="Fechar menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <p class="px-3.5 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">Navegação</p>

        <a
          routerLink="/dashboard"
          [class.active]="isActiveRoute('/dashboard')"
          (click)="onMobileClose()"
          class="nav-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Produtos
        </a>

        <a
          *ngIf="!(adminModeService.isAdmin$ | async)"
          routerLink="/favoritos"
          [class.active]="isActiveRoute('/favoritos')"
          (click)="onMobileClose()"
          class="nav-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Meus Favoritos
          <span *ngIf="favoritesCount > 0" class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-500 text-white">
            {{ favoritesCount }}
          </span>
        </a>

        <a
          *ngIf="(adminModeService.isAdmin$ | async)"
          routerLink="/simulacao"
          [class.active]="isActiveRoute('/simulacao')"
          (click)="onMobileClose()"
          class="nav-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Simulação Cartão
        </a>

        <a
          *ngIf="(adminModeService.isAdmin$ | async)"
          routerLink="/gerenciamento"
          [class.active]="isActiveRoute('/gerenciamento')"
          (click)="onMobileClose()"
          class="nav-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gerenciamento
        </a>

        <ng-container *ngIf="!(adminModeService.isAdmin$ | async)">
          <p class="px-3.5 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">Configurações</p>
          <a
            routerLink="/configuracoes"
            [class.active]="isActiveRoute('/configuracoes')"
            (click)="onMobileClose()"
            class="nav-link">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificações
          </a>
        </ng-container>
      </nav>

      <!-- Rodapé -->
      <div *ngIf="(adminModeService.isAdmin$ | async)" class="p-3 border-t border-white/10">
        <button
          (click)="onLogoutAdmin()"
          class="nav-link w-full text-red-300 hover:bg-red-500/15 hover:text-red-200">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair do Admin
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  favoritesCount = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly adminModeService: AdminModeService,
    private readonly sidebarService: SidebarService,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.sidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });

    // Inscrever-se no contador de favoritos
    this.favoritesService.count$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.favoritesCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  onMobileClose(): void {
    this.sidebarService.close();
  }

  onLogoutAdmin(): void {
    this.alertService.confirm(
      'Sair do Modo Admin',
      'Deseja realmente sair do modo administrador?',
      () => {
        this.adminModeService.disableAdminMode();
      }
    );
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminModeService } from '../../../core/services/admin-mode.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AlertService } from '../../services/alert.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar -->
    <aside 
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      class="fixed left-0 top-0 h-full w-64 shadow-xl z-30 transition-transform duration-300 ease-in-out" style="background-color: #EEF2F4; border-right: 1px solid #D7DDE3;">
      
      <!-- Header com botão de fechar -->
      <div class="p-6 flex items-center justify-between" style="border-bottom: 1px solid #D7DDE3; background: linear-gradient(to right, #E6EBEF, #EEF2F5);">
        <h2 class="text-xl font-bold flex items-center gap-2" style="color: #23292A;">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Menu
        </h2>
        <button
          (click)="closeSidebar()"
          class="rounded-lg p-2 transition-colors" style="color: #6B7785;" onmouseover="this.style.backgroundColor='#E6EBEF'" onmouseout="this.style.backgroundColor='transparent'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <a 
          routerLink="/dashboard" 
          routerLinkActive="font-bold"
          [ngClass]="{'active-link': isActiveRoute('/dashboard')}"
          [routerLinkActiveOptions]="{exact: true}"
          (click)="onMobileClose()"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style="color: #23292A;" onmouseover="this.style.backgroundColor='#E6EBEF'" onmouseout="if(!this.classList.contains('active-link')) this.style.backgroundColor='transparent'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Produtos
        </a>

        <!-- Simulação de Vendas -->
        <a 
            *ngIf="(adminModeService.isAdmin$ | async)"
          routerLink="/simulacao" 
          routerLinkActive="font-bold"
          [ngClass]="{'active-link': isActiveRoute('/simulacao')}"
          (click)="onMobileClose()"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style="color: #23292A;" onmouseover="this.style.backgroundColor='#E6EBEF'" onmouseout="if(!this.classList.contains('active-link')) this.style.backgroundColor='transparent'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Simulação Cartão
        </a>

        <!-- Gerenciamento (só para admin) -->
        <a 
          *ngIf="(adminModeService.isAdmin$ | async)"
          routerLink="/gerenciamento" 
          routerLinkActive="font-bold"
          [ngClass]="{'active-link': isActiveRoute('/gerenciamento')}"
          (click)="onMobileClose()"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style="color: #23292A;" onmouseover="this.style.backgroundColor='#E6EBEF'" onmouseout="if(!this.classList.contains('active-link')) this.style.backgroundColor='transparent'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gerenciamento
        </a>
      </nav>

      <!-- Divider -->
      <div class="my-4" style="border-top: 1px solid #D7DDE3;"></div>

      <!-- Configurações -->
      <nav class="p-4 space-y-2">
        <!-- Notificações (só para usuários não-admin) -->
        <a 
          *ngIf="!(adminModeService.isAdmin$ | async)"
          routerLink="/configuracoes" 
          routerLinkActive="font-bold"
          [ngClass]="{'active-link': isActiveRoute('/configuracoes')}"
          (click)="onMobileClose()"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style="color: #23292A;" onmouseover="this.style.backgroundColor='#E6EBEF'" onmouseout="if(!this.classList.contains('active-link')) this.style.backgroundColor='transparent'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notificações
        </a>

        <!-- Sair do Admin (só para admin) -->
        <button 
          *ngIf="(adminModeService.isAdmin$ | async)"
          (click)="onLogoutAdmin()"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair do Admin
        </button>
      </nav>
    </aside>

    <!-- Botão de Abrir (sempre visível quando fechado) -->
    <button
      *ngIf="!isOpen"
      (click)="toggleSidebar()"
      class="fixed left-6 top-6 z-20 shadow-md rounded-lg p-2.5 hover:shadow-lg transition-all" style="background-color: #FFFFFF; border: 1px solid #D7DDE3; color: #6B7785;" onmouseover="this.style.backgroundColor='#EDF1F4'; this.style.borderColor='#9AB6C8'" onmouseout="this.style.backgroundColor='#FFFFFF'; this.style.borderColor='#D7DDE3'"
      title="Abrir Menu">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `,
  styles: [`
    .active-link {
      background-color: #E6EBEF !important;
      color: #7588A8 !important;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly adminModeService: AdminModeService,
    private readonly sidebarService: SidebarService,
    private readonly router: Router,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.sidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
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

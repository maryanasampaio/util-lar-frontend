/**
 * APP LAYOUT COMPONENT
 *
 * Layout para páginas internas da aplicação (após login)
 *
 * RESPONSABILIDADE:
 * - Exibir navbar/header
 * - Exibir sidebar (se necessário)
 * - Aplicar padding/margin padrão
 * - Renderizar conteúdo das rotas protegidas
 *
 * ONDE USA:
 * - /dashboard
 * - /products
 * - /profile
 * - Todas rotas protegidas
 */

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AdminModeService } from '../../../core/services/admin-mode.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- SIDEBAR (apenas para admin) -->
      <ng-container *ngIf="isAdmin">
        <app-sidebar />
      </ng-container>

      <!-- OVERLAY MOBILE (apenas mobile + admin) -->
      <div 
        *ngIf="isAdmin && isSidebarOpen"
        (click)="closeSidebar()"
        class="fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden">
      </div>

      <!-- CONTEÚDO PRINCIPAL -->
      <main 
        class="flex-1 transition-all duration-300 ease-in-out"
        [class.lg:ml-64]="isAdmin && isSidebarOpen"
        [class.ml-0]="!isAdmin || !isSidebarOpen">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isAdmin = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly adminModeService: AdminModeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isSidebarOpen = isOpen;
        this.cdr.detectChanges();
      });

    this.adminModeService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        console.log('[AppLayout] Admin mode mudou para:', isAdmin);
        this.isAdmin = isAdmin;
        // Força detecção de mudanças para atualizar a view
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }
}

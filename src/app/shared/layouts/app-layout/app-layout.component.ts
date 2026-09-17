/**
 * APP LAYOUT COMPONENT
 *
 * Layout da loja: header + faixa de categorias, sidebar (admin), conteúdo da rota e rodapé.
 * Também hospeda o modal de login admin (aberto com duplo clique na logo do header).
 */

import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { StoreHeaderComponent } from '../../components/store-header/store-header.component';
import { StoreFooterComponent } from '../../components/store-footer/store-footer.component';
import { AdminLoginModalComponent } from '../../components/admin-login-modal/admin-login-modal.component';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AdminModeService } from '../../../core/services/admin-mode.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, StoreHeaderComponent, StoreFooterComponent, AdminLoginModalComponent],
  template: `
    <div class="min-h-screen bg-canvas flex flex-col">
      <app-store-header />

      <!-- SIDEBAR (apenas admin) -->
      <app-sidebar *ngIf="isAdmin" />

      <!-- OVERLAY (sidebar aberta) -->
      <div
        *ngIf="isAdmin && isSidebarOpen"
        (click)="closeSidebar()"
        class="fixed inset-0 bg-brand-900/50 backdrop-blur-sm z-[45] transition-opacity">
      </div>

      <main class="flex-1">
        <router-outlet />
      </main>

      <app-store-footer />
    </div>

    <app-admin-login-modal
      *ngIf="showAdminLoginModal"
      (closeModal)="showAdminLoginModal = false"
      (adminAuthenticated)="onAdminAuthenticated($event)">
    </app-admin-login-modal>
  `
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isAdmin = false;
  showAdminLoginModal = false;

  private readonly sidebarService = inject(SidebarService);
  private readonly adminModeService = inject(AdminModeService);
  private readonly catalog = inject(CatalogService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

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
        this.isAdmin = isAdmin;
        this.cdr.detectChanges();
      });

    this.catalog.loginRequested$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isAdmin) {
          this.showAdminLoginModal = true;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  onAdminAuthenticated(password: string): void {
    const login$ = this.adminModeService.enableAdminMode(password);
    if (!login$) {
      this.showAdminLoginModal = false;
      return;
    }

    login$
      .pipe(takeUntil(this.destroy$), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: () => {
          this.showAdminLoginModal = false;
        },
        error: (error) => {
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
        }
      });
  }
}

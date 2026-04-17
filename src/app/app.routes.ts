import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ============================================================================
  // ROTA RAIZ - REDIRECIONA PARA DASHBOARD
  // ============================================================================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // ============================================================================
  // ROTAS PÚBLICAS (COM APP LAYOUT)
  // ============================================================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'produto/:id',
        loadComponent: () =>
          import('./features/products/pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE GERENCIAMENTO FINANCEIRO (REQUER ADMIN)
  // ============================================================================
  {
    path: 'gerenciamento',
    canActivate: [roleGuard],
    data: { requiredPermission: 'ADMIN' },
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/management/pages/financial-dashboard/financial-dashboard.component').then((m) => m.FinancialDashboardComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE CONFIGURAÇÕES
  // ============================================================================
  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/settings/pages/notifications-settings/notifications-settings.component').then((m) => m.NotificationsSettingsComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE FAVORITOS (CLIENTE)
  // ============================================================================
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/pages/favorites/favorites.component').then((m) => m.FavoritesComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE SIMULAÇÃO DE VENDAS NO CARTÃO
  // ============================================================================
  {
    path: 'simulacao',
    canActivate: [roleGuard],
    data: { requiredPermission: 'ADMIN' },
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/simulations/pages/simulation-card/simulation-card.component').then((m) => m.SimulationCardComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA 404 (NÃO ENCONTRADA)
  // ============================================================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

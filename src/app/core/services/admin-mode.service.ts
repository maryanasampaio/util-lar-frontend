import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Serviço para gerenciar modo Admin com login backend
 * 
 * Uso:
 * - Usuário comum: acessa normalmente
 * - Admin: faz triple-click na logo e faz login no backend
 * - O estado persiste no localStorage até limpar ou desativar
 */
@Injectable({
  providedIn: 'root'
})
export class AdminModeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Carrega estado inicial verificando se está autenticado E se tem flag de admin
      const isAuthenticated = this.authService.isAuthenticated();
      const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
      
      console.log('[AdminModeService] Inicializando - Auth:', isAuthenticated, 'AdminMode:', isAdminMode);
      
      if (isAuthenticated && isAdminMode) {
        this.isAdminSubject.next(true);
      } else {
        // Limpa flag inconsistente
        localStorage.removeItem('isAdminMode');
        this.isAdminSubject.next(false);
      }
    }
  }

  /**
   * Ativa o modo admin fazendo login no backend
   * @param password - Senha digitada pelo usuário
   * Retorna Observable para o component tratar
   * Backend valida: senha correta + permission = ADMIN
   */
  enableAdminMode(password: string): Observable<any> {
    return new Observable(observer => {
      this.authService.login('admin', password).subscribe({
        next: (response) => {
          // Validação: verifica se response contém permission=ADMIN
          console.log('[AdminModeService] Response do backend:', response);
          
          if (response.permission !== 'ADMIN') {
            console.error('[AdminModeService] Acesso negado. Permission:', response.permission);
            this.authService.logout();
            observer.error({ message: 'Acesso negado. Apenas administradores podem acessar.' });
            return;
          }

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('isAdminMode', 'true');
          }
          this.isAdminSubject.next(true);
          console.log('[AdminModeService] ✅ Admin autenticado com sucesso! Permission:', response.permission);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[AdminModeService] Erro ao fazer login:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Desativa o modo admin e faz logout do backend
   */
  disableAdminMode(): void {
    console.log('[AdminModeService] Desativando modo admin');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isAdminMode');
      this.authService.logout();
    }
    this.isAdminSubject.next(false);
  }

  /**
   * Retorna o estado atual do modo admin (síncrono)
   */
  isAdminMode(): boolean {
    return this.isAdminSubject.value;
  }

  /**
   * Alterna entre modo admin e modo comum
   * @param password - Senha (necessária ao ativar)
   */
  toggleAdminMode(password?: string): Observable<any> | void {
    if (this.isAdminMode()) {
      this.disableAdminMode();
      return;
    } else {
      if (password) {
        return this.enableAdminMode(password);
      }
      return;
    }
  }
}

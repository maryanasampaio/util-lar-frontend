/**
 * AUTH SERVICE
 *
 * Orquestra o fluxo de autenticação:
 * - Chama Repository (API)
 * - Gerencia estado de autenticação
 * - Salva/recupera dados do localStorage
 *
 * RESPONSABILIDADES:
 * ✅ Chamar AuthRepository para login
 * ✅ Armazenar token e dados do usuário
 * ✅ Verificar se usuário está autenticado
 */

import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRepository } from '../repository/auth.repository';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { 
  getToken, 
  saveToken, 
  removeToken, 
  saveUser, 
  removeUser, 
  getUser,
  savePermission, 
  removePermission, 
  getStoredPermission 
} from '../utils/storage.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  /**
   * LOGIN
   *
   * Realiza autenticação do usuário
   * - Chama repository para fazer request à API
   * - Salva token e dados do usuário no localStorage
   * - Retorna Observable para o component tratar
   *
   * @param username - Nome de usuário
   * @param password - Senha
   * @returns Observable<LoginResponse> - Dados do usuário autenticado
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { username, password };

    return this.authRepository.login(credentials).pipe(
      tap((response: LoginResponse) => {
        // Salva token no localStorage (backend retorna 'token', não 'accessToken')
        saveToken(response.token);
        saveUser(response.username, response.username);
        
        // ✅ NOVO: Salva a permission retornada pelo backend
        if (response.permission) {
          savePermission(response.permission);
        }
        
        console.log('[AuthService] Login bem-sucedido:', response.username, '| Permission:', response.permission);
      })
      // NÃO trata erro aqui - deixa o component decidir o que fazer
    );
  }

  /**
   * LOGOUT
   *
   * Remove token e dados do usuário do localStorage
   */
  logout(): void {
    removeToken();
    removeUser();
    removePermission(); // ✅ NOVO: Remove a permission também
  }

  /**
   * IS AUTHENTICATED
   *
   * Verifica se usuário está autenticado (tem token válido)
   * @returns true se existe token, false caso contrário
   */
  isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;

    // Se o token estiver expirado ou inválido, limpa e retorna false
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * GET TOKEN
   *
   * Retorna o token JWT armazenado
   * @returns Token ou null se não existir
   */
  getToken(): string | null {
    return getToken();
  }

  /**
   * GET CURRENT USER
   *
   * Retorna dados do usuário logado
   * @returns Dados do usuário ou null
   */
  getCurrentUser() {
    return getUser();
  }

  // ---------------------
  // Helpers
  // ---------------------
  /**
   * Retorna a permissão atual do usuário
   * 
   * Primeiro tenta do localStorage (salva durante o login)
   * Se não encontrar, tenta extrair do JWT token (fallback)
   * 
   * Exemplos: 'ADMIN', 'USER'
   */
  getPermission(): string | null {
    // ✅ PRIORIDADE 1: Busca do localStorage (mais confiável)
    const storedPermission = getStoredPermission();
    if (storedPermission) {
      return storedPermission;
    }
    
    // ✅ FALLBACK: Tenta extrair do JWT se não estiver no localStorage
    const token = getToken();
    if (!token) return null;
    
    try {
      const payload = this.decodeJwtPayload(token);
      const perm = payload?.permission;
      
      // Se encontrou no JWT, salva no localStorage para próximas consultas
      if (typeof perm === 'string') {
        savePermission(perm);
        return perm;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o usuário possui a permissão requerida
   */
  hasPermission(required: string): boolean {
    const current = this.getPermission();
    if (!current) return false;
    return current.toUpperCase() === required.toUpperCase();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      // Se não houver 'exp', considerar não expirado para compatibilidade
      if (!payload || typeof payload.exp !== 'number') {
        return false;
      }
      const expiresAtMs = payload.exp * 1000;
      return Date.now() >= expiresAtMs;
    } catch {
      return true;
    }
  }

  private decodeJwtPayload(token: string): any | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Pad base64 string
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);

    let json = '';
    if (typeof atob === 'function') {
      json = decodeURIComponent(
        Array.prototype.map
          .call(atob(padded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      // Node/SSR
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buf: any = (globalThis as any).Buffer;
      if (!buf) return null;
      const bin = buf.from(padded, 'base64').toString('binary');
      json = decodeURIComponent(
        Array.prototype.map
          .call(bin, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    return JSON.parse(json);
  }
}

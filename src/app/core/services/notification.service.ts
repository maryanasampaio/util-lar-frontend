import { Injectable } from '@angular/core';
import { Observable, of, catchError, tap } from 'rxjs';
import { NotificationRepository } from '../repositories/notification.repository';
import {
  NotificationPreferences,
  SaveNotificationPreferencesRequest,
  NotificationPreferencesResponse
} from '../models/notification-preferences.model';

/**
 * Service para gerenciar notificações
 * 
 * Funcionalidades:
 * - Salvar preferências localmente e no backend
 * - Validar números de telefone
 * - Formatar dados antes de enviar
 * - Gerenciar permissões de Push Notifications
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'notificationSettings';

  constructor(private readonly repository: NotificationRepository) {}

  /**
   * Salvar preferências de notificação
   * Tenta salvar no backend, mas mantém localStorage como fallback
   */
  savePreferences(preferences: NotificationPreferences): Observable<NotificationPreferencesResponse> {
    // Salvar localmente sempre
    this.saveToLocalStorage(preferences);

    // Formatar dados para backend
    const request = this.formatForBackend(preferences);

    // Tentar salvar no backend
    return this.repository.savePreferences(request).pipe(
      tap(() => {
        console.log('✅ Preferências salvas no backend');
      }),
      catchError(error => {
        console.warn('⚠️ Erro ao salvar no backend, usando localStorage:', error);
        // Retorna sucesso mesmo que backend falhe (modo offline)
        return of({
          success: true,
          message: 'Preferências salvas localmente',
          preferences
        });
      })
    );
  }

  /**
   * Buscar preferências salvas
   * Tenta buscar do backend, fallback para localStorage
   */
  getPreferences(): Observable<NotificationPreferences> {
    // Tentar buscar do backend
    return this.repository.getPreferences().pipe(
      catchError(() => {
        // Fallback: buscar do localStorage
        console.log('📦 Carregando preferências do localStorage');
        const local = this.getFromLocalStorage();
        return of(local);
      })
    );
  }

  /**
   * Validar número de telefone brasileiro
   * Aceita: (82) 99999-9999, 82999999999, 5582999999999
   */
  validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, error: 'Número de telefone é obrigatório' };
    }

    // Remover caracteres especiais
    const cleaned = phone.replace(/\D/g, '');

    // Validar formato brasileiro
    if (cleaned.length === 11) {
      // Formato: 82999999999
      if (!cleaned.startsWith('82')) {
        return { valid: false, error: 'DDD deve ser 82 (Alagoas)' };
      }
      return { valid: true, formatted: `55${cleaned}` };
    }

    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Formato: 5582999999999
      return { valid: true, formatted: cleaned };
    }

    return { 
      valid: false, 
      error: 'Formato inválido. Use: (82) 99999-9999 ou 82999999999' 
    };
  }

  /**
   * Validar email
   */
  validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim().length === 0) {
      return { valid: false, error: 'Email é obrigatório' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Email inválido' };
    }

    return { valid: true };
  }

  /**
   * Solicitar permissão para Push Notifications
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('❌ Navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Permissão de notificação negada pelo usuário');
      return false;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Enviar notificação de teste (browser)
   */
  sendTestPushNotification(): void {
    if (Notification.permission !== 'granted') return;
    this.showNotification('🎉 Notificações Ativas!', {
      body: 'Você receberá alertas quando novos produtos forem publicados.',
      icon: '/logo-utilar.png',
      badge: '/logo-utilar.png'
    });
  }

  /**
   * Exibe notificação via Service Worker (aparece na central do celular)
   * Fallback para new Notification() caso SW não esteja disponível
   */
  showNotification(title: string, options: NotificationOptions): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }

  /**
   * Formatar preferências para enviar ao backend
   */
  private formatForBackend(prefs: NotificationPreferences): SaveNotificationPreferencesRequest {
    return {
      whatsappEnabled: prefs.whatsapp.enabled,
      whatsappPhone: prefs.whatsapp.phoneNumber,
      emailEnabled: prefs.email.enabled,
      emailAddress: prefs.email.emailAddress,
      pushEnabled: prefs.push.enabled,
      pushSubscription: prefs.push.subscription
    };
  }

  /**
   * Salvar no localStorage
   */
  private saveToLocalStorage(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Buscar do localStorage
   */
  private getFromLocalStorage(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
    }

    // Retornar configuração padrão
    return {
      whatsapp: { enabled: false, phoneNumber: '' },
      email: { enabled: false, emailAddress: '' },
      push: { enabled: false }
    };
  }

  /**
   * Limpar todas as preferências
   */
  clearPreferences(): Observable<NotificationPreferencesResponse> {
    localStorage.removeItem(this.STORAGE_KEY);
    
    return this.repository.deletePreferences().pipe(
      catchError(error => {
        console.warn('Erro ao deletar no backend:', error);
        return of({ success: true, message: 'Preferências limpas localmente' });
      })
    );
  }
}

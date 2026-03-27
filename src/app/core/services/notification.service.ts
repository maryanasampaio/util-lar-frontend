import { Injectable } from '@angular/core';
import { Observable, of, catchError, tap, timeout, map, firstValueFrom } from 'rxjs';
import { NotificationRepository } from '../repositories/notification.repository';
import {
  NotificationPreferences,
  SaveNotificationPreferencesRequest,
  NotificationPreferencesResponse
} from '../models/notification-preferences.model';
import { environment } from '../../../environments/environment';

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
  private readonly PUSH_ENDPOINT = `${environment.apiUrl}/api/notification-preferences/push-subscription`;

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

  savePreferencesLocally(preferences: NotificationPreferences): void {
    this.saveToLocalStorage(preferences);
  }

  /**
   * Retorna preferências salvas no localStorage de forma síncrona.
   * Útil para exibir dados imediatamente, sem aguardar a API.
   */
  getLocalPreferences(): NotificationPreferences {
    return this.getFromLocalStorage();
  }

  /**
   * Buscar preferências salvas
   * Tenta buscar do backend, fallback para localStorage
   */
  getPreferences(): Observable<NotificationPreferences> {
    const localPrefs = this.getFromLocalStorage();

    return this.repository.getPreferences().pipe(
      timeout(5000),
      map(prefs => ({
        // Suporta resposta nested (prefs.whatsapp) e flat (whatsappEnabled) do backend
        whatsapp: prefs.whatsapp ?? {
          enabled: (prefs as any).whatsappEnabled === true,
          phoneNumber: (prefs as any).whatsappPhone ?? ''
        },
        email: prefs.email ?? {
          enabled: (prefs as any).emailEnabled === true,
          emailAddress: (prefs as any).emailAddress ?? ''
        },
        // push vem sempre do localStorage — estado real do browser
        push: localPrefs.push
      })),
      catchError(() => {
        console.log('📦 Carregando preferências do localStorage');
        return of(localPrefs);
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
    const cleaned = phone.replaceAll(/\D/g, '');

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
   * Solicitar permissão e criar subscription Web Push.
   * Chamado ao ativar push nas configurações.
   */
  async requestPushPermission(): Promise<boolean> {
    console.log('[Push] Iniciando ativação', {
      permission: Notification.permission,
      apiUrl: environment.apiUrl,
      pushEndpoint: this.PUSH_ENDPOINT,
      standalone: this.isStandaloneMode(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in globalThis
    });

    if (!('Notification' in globalThis)) {
      console.error('❌ Navegador não suporta notificações');
      return false;
    }

    if (this.isIosBrowserWithoutStandalone()) {
      console.error('❌ No iPhone, Web Push só funciona com o app instalado na Tela de Início');
      this.updateStoredPushState(false);
      return false;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Permissão de notificação negada pelo usuário');
      return false;
    }

    if (!this.hasPushSupport()) {
      console.error('❌ Push notifications indisponíveis neste navegador/contexto');
      this.updateStoredPushState(false);
      return false;
    }

    try {
      const permission = await this.ensureNotificationPermission();
      console.log('[Push] Resultado da permissão', { permission });

      if (permission !== 'granted') {
        this.updateStoredPushState(false);
        return false;
      }

      const existingSubscription = await this.getCurrentSubscription();
      console.log('[Push] Subscription existente encontrada?', {
        exists: !!existingSubscription,
        endpoint: existingSubscription?.endpoint ?? null
      });

      const subscription = existingSubscription ?? await this.createPushSubscription();
      console.log('[Push] Subscription pronta para envio', subscription.toJSON());

      const synced = await this.sendSubscriptionToBackend(subscription);
      this.updateStoredPushState(synced, subscription);

      if (!synced) {
        console.error('❌ Subscription criada, mas não foi salva no backend');
        return false;
      }

      console.log('✅ Web Push subscription criada e enviada ao backend');
      return true;
    } catch (err) {
      console.error('❌ Erro ao criar Web Push subscription:', err);
      this.updateStoredPushState(false);
      return false;
    }
  }

  /**
   * Sincronizar subscription existente com o backend.
   * Chamar no startup do app quando push já estiver ativado.
   * Garante que o backend sempre tem a subscription atualizada.
   */
  async syncPushSubscription(): Promise<boolean> {
    console.log('[Push] Sincronizando subscription no startup');

    if (!this.hasPushSupport()) {
      this.updateStoredPushState(false);
      return false;
    }

    const subscription = await this.getCurrentSubscription();

    if (!subscription) {
      this.updateStoredPushState(false);
      return false;
    }

    const synced = await this.sendSubscriptionToBackend(subscription);
    this.updateStoredPushState(synced, subscription);

    if (synced) {
      console.log('🔄 Subscription push sincronizada com o backend');
    }

    return synced;
  }

  /**
   * Remover subscription Web Push.
   * Chamado ao desativar push nas configurações ou no logout.
   */
  async removePushSubscription(): Promise<void> {
    console.log('[Push] Iniciando remoção da subscription');

    if (!this.hasPushSupport()) {
      this.updateStoredPushState(false);
      return;
    }

    const subscription = await this.getCurrentSubscription();

    if (!subscription) {
      this.updateStoredPushState(false);
      return;
    }

    const endpoint = subscription.endpoint;
    console.log('[Push] Subscription encontrada para remoção', { endpoint });

    try {
      await subscription.unsubscribe();
      console.log('✅ Subscription removida do navegador');
    } catch (err) {
      console.warn('⚠️ Erro ao remover subscription do SW:', err);
    }

    this.repository.deletePushSubscription(endpoint).pipe(
      catchError(err => {
        console.warn('⚠️ Erro ao remover subscription do backend:', err);
        return of(null);
      })
    ).subscribe();

    this.updateStoredPushState(false);
  }

  /**
   * Envia subscription ao backend no formato exato esperado pelo controller:
   * { endpoint, expirationTime, keys: { p256dh, auth } }
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<boolean> {
    console.log('[Push] Enviando subscription para o backend', {
      url: this.PUSH_ENDPOINT,
      payload: subscription.toJSON()
    });

    try {
      await firstValueFrom(this.repository.savePushSubscription(subscription));
      console.log('[Push] POST de subscription concluído com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro ao salvar subscription no backend:', err);
      return false;
    }
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

  private async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.hasPushSupport()) {
      console.warn('[Push] getCurrentSubscription abortado: sem suporte a Service Worker/PushManager');
      return null;
    }

    try {
      console.log('[Push] Aguardando serviceWorker.ready');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>(resolve => setTimeout(() => resolve(null), 3000))
      ]);

      if (!registration) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.warn('⚠️ Timeout ao aguardar Service Worker pronto para PushSubscription', {
          registrations: registrations.map(item => ({
            scope: item.scope,
            active: !!item.active,
            installing: !!item.installing,
            waiting: !!item.waiting
          })),
          controller: !!navigator.serviceWorker.controller,
          standalone: this.isStandaloneMode(),
          url: globalThis.location.href
        });
        return null;
      }

      console.log('[Push] Service Worker pronto', {
        scope: registration.scope,
        hasActiveWorker: !!registration.active,
        hasInstallingWorker: !!registration.installing,
        hasWaitingWorker: !!registration.waiting
      });

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('❌ Erro ao buscar PushSubscription atual:', error);
      return null;
    }
  }

  private updateStoredPushState(enabled: boolean, subscription?: PushSubscription | null): void {
    const preferences = this.getFromLocalStorage();
    preferences.push = {
      enabled,
      subscription: subscription ?? preferences.push.subscription
    };
    this.saveToLocalStorage(preferences);
  }

  private hasPushSupport(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in globalThis;
  }

  private async ensureNotificationPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return Notification.requestPermission();
  }

  private async createPushSubscription(): Promise<PushSubscription> {
    console.log('[Push] Criando nova PushSubscription com a VAPID key configurada');
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = this.urlBase64ToArrayBuffer(environment.vapidPublicKey);
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
  }

  private urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let index = 0; index < rawData.length; index += 1) {
      outputArray[index] = rawData.codePointAt(index) ?? 0;
    }

    return outputArray.buffer;
  }

  private isIosBrowserWithoutStandalone(): boolean {
    const userAgent = navigator.userAgent || '';
    const isIos = /iPad|iPhone|iPod/.test(userAgent);
    const isStandalone = this.isStandaloneMode();

    return isIos && !isStandalone;
  }

  private isStandaloneMode(): boolean {
    return globalThis.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
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

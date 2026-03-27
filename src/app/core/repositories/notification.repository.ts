import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationPreferences,
  SaveNotificationPreferencesRequest,
  NotificationPreferencesResponse,
  NotificationStats
} from '../models/notification-preferences.model';

/**
 * Repository para comunicação com API de notificações
 * Base: http://localhost:8080
 * 
 * Rotas:
 * - POST /api/notification-preferences - Salvar preferências
 * - GET /api/notification-preferences - Buscar preferências do usuário logado
 * - PUT /api/notification-preferences - Atualizar preferências
 * - DELETE /api/notification-preferences - Remover todas as notificações
 * - GET /api/notification-preferences/stats - Estatísticas (admin)
 */
@Injectable({ providedIn: 'root' })
export class NotificationRepository {
  private readonly apiUrl = `${environment.apiUrl}/api/notification-preferences`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Salvar preferências de notificação do usuário
   * POST /api/notification-preferences
   * 
   * Por enquanto, salva localmente (sem backend implementado)
   */
  savePreferences(request: SaveNotificationPreferencesRequest): Observable<NotificationPreferencesResponse> {
    return this.http.post<NotificationPreferencesResponse>(this.apiUrl, request);
  }

  /**
   * Buscar preferências do usuário logado
   * GET /api/notification-preferences
   * 
   * Backend identifica usuário pelo token JWT
   */
  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(this.apiUrl);
  }

  /**
   * Atualizar preferências existentes
   * PUT /api/notification-preferences
   */
  updatePreferences(request: SaveNotificationPreferencesRequest): Observable<NotificationPreferencesResponse> {
    return this.http.put<NotificationPreferencesResponse>(this.apiUrl, request);
  }

  /**
   * Desativar todas as notificações
   * DELETE /api/notification-preferences
   */
  deletePreferences(): Observable<NotificationPreferencesResponse> {
    return this.http.delete<NotificationPreferencesResponse>(this.apiUrl);
  }

  /**
   * Buscar estatísticas de notificações (apenas admin)
   * GET /api/notification-preferences/stats
   */
  getStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Testar envio de notificação (desenvolvimento)
   * POST /api/notifications/test
   */
  sendTestNotification(type: 'whatsapp' | 'email' | 'push'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/notifications/test`, { type });
  }

  /**
   * Salvar subscription Web Push do usuário
   * POST /api/notification-preferences/push-subscription
   * Payload: { endpoint, expirationTime, keys: { p256dh, auth } }
   */
  savePushSubscription(subscription: PushSubscription): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/notification-preferences/push-subscription`,
      subscription.toJSON()
    );
  }

  /**
   * Remover subscription Web Push do usuário
   * DELETE /api/notification-preferences/push-subscription?endpoint=...
   */
  deletePushSubscription(endpoint: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/api/notification-preferences/push-subscription`,
      { params: { endpoint } }
    );
  }
}

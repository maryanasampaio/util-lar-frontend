import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductResponse } from '../../features/products/models/product.model';
import { NotificationService } from './notification.service';

export interface ProductUpdate {
  type: 'new_product' | 'price_change';
  product: ProductResponse;
  oldPrice?: number;
  newPrice?: number;
  timestamp: number;
}

/**
 * Serviço para rastrear novos produtos e mudanças de preços
 * Gerencia notificações quando produtos são adicionados ou preços são alterados
 */
@Injectable({ providedIn: 'root' })
export class ProductTrackerService {
  private readonly STORAGE_KEY = 'tracked_products';
  private readonly LAST_CHECK_KEY = 'last_product_check';
  
  private readonly updates$ = new BehaviorSubject<ProductUpdate[]>([]);
  private trackedProducts: Map<number, ProductResponse> = new Map();

  constructor(private readonly notificationService: NotificationService) {
    this.loadTrackedProducts();
  }

  /**
   * Observable de atualizações não lidas
   */
  getUpdates(): Observable<ProductUpdate[]> {
    return this.updates$.asObservable();
  }

  /**
   * Obter número de notificações não lidas
   */
  getUnreadCount(): number {
    return this.updates$.value.length;
  }

  /**
   * Verificar novos produtos e mudanças de preço
   */
  checkForUpdates(currentProducts: ProductResponse[]): ProductUpdate[] {
    const updates: ProductUpdate[] = [];
    const lastCheckTime = this.getLastCheckTime();
    const now = Date.now();

    currentProducts.forEach(product => {
      const trackedProduct = this.trackedProducts.get(product.id);

      // Novo produto
      if (!trackedProduct) {
        const productTime = product.createdAt ? new Date(product.createdAt).getTime() : 0;
        
        // Só notificar se foi criado depois da última verificação
        if (productTime > lastCheckTime) {
          updates.push({
            type: 'new_product',
            product,
            timestamp: now
          });
        }
        
        // Adicionar ao mapa de rastreamento
        this.trackedProducts.set(product.id, product);
      } 
      // Mudança de preço
      else if (trackedProduct.price !== product.price) {
        updates.push({
          type: 'price_change',
          product,
          oldPrice: trackedProduct.price,
          newPrice: product.price,
          timestamp: now
        });
        
        // Atualizar no mapa
        this.trackedProducts.set(product.id, product);
      }
    });

    // Salvar estado atualizado
    if (updates.length > 0) {
      this.saveTrackedProducts();
      this.addUpdates(updates);
      this.sendNotifications(updates);
    }

    return updates;
  }

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead(): void {
    this.updates$.next([]);
    this.updateLastCheckTime();
  }

  /**
   * Remover uma notificação específica
   */
  dismissUpdate(index: number): void {
    const current = this.updates$.value;
    current.splice(index, 1);
    this.updates$.next([...current]);
  }

  /**
   * Limpar todos os dados de rastreamento
   */
  clearTracking(): void {
    this.trackedProducts.clear();
    this.updates$.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LAST_CHECK_KEY);
  }

  /**
   * Enviar notificações para o usuário
   */
  private sendNotifications(updates: ProductUpdate[]): void {
    // Verificar se usuário habilitou notificações
    this.notificationService.getPreferences().subscribe(prefs => {
      // Push Notifications
      if (prefs.push?.enabled && 'Notification' in globalThis && Notification.permission === 'granted') {
        updates.forEach(update => {
          this.sendPushNotification(update);
        });
      }

      // WhatsApp e Email são gerenciados pelo backend
      // Aqui apenas registramos que há notificações pendentes
    });
  }

  /**
   * Enviar notificação push do navegador
   */
  private sendPushNotification(update: ProductUpdate): void {
    let title = '';
    let body = '';

    if (update.type === 'new_product') {
      title = '🎉 Novo Produto Disponível!';
      body = `${update.product.name} - R$ ${this.formatPrice(update.product.price)}`;
    } else if (update.type === 'price_change') {
      const diff = (update.newPrice || 0) - (update.oldPrice || 0);
      const emoji = diff < 0 ? '📉' : '📈';
      title = `${emoji} Preço Atualizado!`;
      body = `${update.product.name}: R$ ${this.formatPrice(update.oldPrice || 0)} → R$ ${this.formatPrice(update.newPrice || 0)}`;
    }

    try {
      new Notification(title, {
        body,
        icon: update.product.images?.[0] || '/logo-utilar.png',
        badge: '/logo-utilar.png',
        tag: `product-${update.product.id}`,
        requireInteraction: false
      });
    } catch (error) {
      console.error('Erro ao enviar notificação push:', error);
    }
  }

  /**
   * Adicionar novas atualizações à lista
   */
  private addUpdates(newUpdates: ProductUpdate[]): void {
    const current = this.updates$.value;
    this.updates$.next([...current, ...newUpdates]);
  }

  /**
   * Obter timestamp da última verificação
   */
  private getLastCheckTime(): number {
    const saved = localStorage.getItem(this.LAST_CHECK_KEY);
    return saved ? Number.parseInt(saved) : 0;
  }

  /**
   * Atualizar timestamp da última verificação
   */
  private updateLastCheckTime(): void {
    localStorage.setItem(this.LAST_CHECK_KEY, Date.now().toString());
  }

  /**
   * Carregar produtos rastreados do localStorage
   */
  private loadTrackedProducts(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.trackedProducts = new Map(Object.entries(data).map(([k, v]) => [Number.parseInt(k), v as ProductResponse]));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos rastreados:', error);
      this.trackedProducts = new Map();
    }
  }

  /**
   * Salvar produtos rastreados no localStorage
   */
  private saveTrackedProducts(): void {
    try {
      const data = Object.fromEntries(this.trackedProducts);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar produtos rastreados:', error);
    }
  }

  /**
   * Formatar preço
   */
  private formatPrice(price: number): string {
    return (price / 100).toFixed(2).replace('.', ',');
  }
}

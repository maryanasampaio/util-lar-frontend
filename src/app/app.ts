import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertModalComponent } from './shared/components/alert-modal/alert-modal.component';
import { ProductService } from './features/products/services/product.service';
import { ProductTrackerService } from './core/services/product-tracker.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('product-frontend');
  private readonly productService = inject(ProductService);
  private readonly productTracker = inject(ProductTrackerService);

  ngOnInit(): void {
    // Solicitar permissão de notificação automaticamente
    this.requestNotificationPermission();

    // Verificar novos produtos a cada 30 segundos
    interval(30000)
      .pipe(switchMap(() => this.productService.buscarProdutos()))
      .subscribe(products => {
        this.productTracker.checkForUpdates(products);
      });

    // Verificação inicial
    this.productService.buscarProdutos().subscribe(products => {
      this.productTracker.checkForUpdates(products);
    });
  }

  private async requestNotificationPermission(): Promise<void> {
    if (!('Notification' in globalThis)) {
      console.log('❌ Navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão de notificação já concedida');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permissão de notificação concedida');
        new Notification('Util Lar', {
          body: 'Notificações ativadas! Você será avisado sobre novos produtos.',
          icon: '/logo-utilar.png',
          badge: '/logo-utilar.png'
        });
      } else {
        console.log('⚠️ Permissão de notificação negada');
      }
    }
  }
}

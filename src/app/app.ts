import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertModalComponent } from './shared/components/alert-modal/alert-modal.component';
import { ProductService } from './features/products/services/product.service';
import { ProductTrackerService } from './core/services/product-tracker.service';
import { NotificationService } from './core/services/notification.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('product-frontend');
  private readonly productService = inject(ProductService);
  private readonly productTracker = inject(ProductTrackerService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Sincronizar subscription push com o backend se o usuário já tem permissão
    this.notificationService.syncPushSubscription();

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
}

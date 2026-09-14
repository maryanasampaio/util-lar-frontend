import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertService } from '../../shared/services/alert.service';

/**
 * Centraliza o fluxo de instalação do PWA para que qualquer componente
 * (header, prompt, dashboard) possa mostrar o botão "Instalar".
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly alertService = inject(AlertService);
  private readonly canInstallSubject = new BehaviorSubject<boolean>(false);
  private deferredPrompt: any = null;

  readonly canInstall$: Observable<boolean> = this.canInstallSubject.asObservable();

  constructor() {
    if (typeof window === 'undefined') return;

    // Prompt capturado no index.html antes do Angular carregar
    const earlyPrompt = (globalThis as any).__pwaInstallPrompt;
    if (earlyPrompt) {
      this.deferredPrompt = earlyPrompt;
      delete (globalThis as any).__pwaInstallPrompt;
      if (!this.isStandalone) this.canInstallSubject.next(true);
    }

    // iOS Safari não dispara beforeinstallprompt — mostramos instruções manuais
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && !this.isStandalone) {
      this.canInstallSubject.next(true);
    }

    globalThis.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstallSubject.next(true);
    });

    globalThis.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstallSubject.next(false);
    });
  }

  private get isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  }

  async install(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      if (outcome === 'accepted') this.canInstallSubject.next(false);
      return;
    }

    this.alertService.success(
      'Adicionar à Tela de Início',
      'Toque em Compartilhar (□↑) na barra do Safari e depois em "Adicionar à Tela de Início".'
    );
  }
}

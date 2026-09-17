import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallPrompt"
      class="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-fade-up">
      <div class="rounded-2xl shadow-2xl p-4 bg-brand-900 text-white border border-white/10">
        <div class="flex items-start gap-3">
          <div class="bg-white rounded-xl p-2 shrink-0">
            <img src="logo-utilar-transparente.png" alt="Util Lar" class="w-14 h-10 object-contain">
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-display font-extrabold text-base leading-tight mb-1">Instalar o app da Util Lar</h3>
            <p class="text-sm text-white/75 leading-snug">Acesso rápido pela tela inicial e avisos de novidades.</p>
          </div>
          <button (click)="dismissPrompt()" class="text-white/60 hover:text-white p-1 -mr-1 -mt-1" aria-label="Fechar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex gap-2 mt-4">
          <button (click)="dismissPrompt()" class="btn flex-1 h-10 text-sm bg-white/10 text-white hover:bg-white/20">Agora não</button>
          <button (click)="installPwa()" class="btn-accent flex-1 h-10 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Instalar
          </button>
        </div>
      </div>
    </div>
  `
})
export class PwaInstallPromptComponent implements OnInit {
  showInstallPrompt = false;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    // Detectar evento de instalação
    globalThis.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Verificar se usuário já dispensou o prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? Number.parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Mostrar novamente após 7 dias
      if (!dismissed || daysSinceDismissed > 7) {
        // Aguardar 5 segundos após carregar página
        setTimeout(() => {
          this.showInstallPrompt = true;
        }, 5000);
      }
    });

    // Detectar se app foi instalado
    globalThis.addEventListener('appinstalled', () => {
      this.showInstallPrompt = false;
      localStorage.removeItem('pwa-install-dismissed');
      console.log('✅ PWA instalado com sucesso!');
    });
  }

  async installPwa(): Promise<void> {
    if (!this.deferredPrompt) {
      // Fallback: instruções manuais
      this.showManualInstructions();
      return;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA');
      } else {
        console.log('❌ Usuário recusou instalar o PWA');
      }
      
      this.deferredPrompt = null;
      this.showInstallPrompt = false;
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      this.showManualInstructions();
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }

  private showManualInstructions(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = '';
    
    if (isIOS) {
      message = 'No Safari:\n1. Toque no botão Compartilhar (📤)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
    } else if (isAndroid) {
      message = 'No Chrome:\n1. Abra o menu (⋮)\n2. Selecione "Instalar app"\n3. Confirme a instalação';
    } else {
      message = 'No navegador:\n1. Clique no ícone de instalação (➕) na barra de endereço\n2. Confirme a instalação';
    }
    
    alert(`📱 Para instalar o app:\n\n${message}`);
  }
}

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
      class="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div class="rounded-xl shadow-2xl p-4" style="background: linear-gradient(135deg, #7588A8, #95A7C1);">
        <div class="flex items-start gap-3">
          <!-- Ícone -->
          <div class="bg-white rounded-lg p-2 flex-shrink-0">
            <img src="logo-utilar.png" alt="Util Lar" class="w-10 h-10">
          </div>
          
          <!-- Conteúdo -->
          <div class="flex-1 text-white">
            <h3 class="font-bold text-lg mb-1">Instalar Util Lar</h3>
            <p class="text-sm text-white/90">
              Adicione nosso app à tela inicial para acesso rápido e receber notificações!
            </p>
          </div>
          
          <!-- Botão Fechar -->
          <button 
            (click)="dismissPrompt()"
            class="text-white/80 hover:text-white p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Botões -->
        <div class="flex gap-2 mt-4">
          <button 
            (click)="dismissPrompt()"
            class="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background-color: rgba(255,255,255,0.2); color: white;"
            onmouseover="this.style.backgroundColor='rgba(255,255,255,0.3)'"
            onmouseout="this.style.backgroundColor='rgba(255,255,255,0.2)'">
            Agora não
          </button>
          <button 
            (click)="installPwa()"
            class="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background-color: white; color: #7588A8;"
            onmouseover="this.style.backgroundColor='#EEF2F5'"
            onmouseout="this.style.backgroundColor='white'">
            📲 Instalar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .animate-slide-up {
      animation: slide-up 0.4s ease-out;
    }
  `]
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

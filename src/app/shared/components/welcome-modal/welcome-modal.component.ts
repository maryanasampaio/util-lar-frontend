import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      (click)="onClose()">
      
      <div 
        class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
        (click)="$event.stopPropagation()">
        
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="rounded-full p-4" style="background: linear-gradient(135deg, #7588A8, #95A7C1);">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        <!-- Header -->
        <h2 class="text-3xl font-bold text-center mb-4" style="color: #23292A;">
          Bem-vindo ao Util Lar!
        </h2>
        
        <p class="text-center mb-8" style="color: #6B7785;">
          Quer receber notificações quando novos produtos forem publicados? 
          Fique por dentro das melhores ofertas!
        </p>

        <!-- Cards de Notificação -->
        <div class="space-y-3 mb-8">
          <button 
            (click)="onConfigureNotifications('whatsapp')"
            class="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left">
            <div class="flex items-center gap-4">
              <div class="bg-green-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 group-hover:text-green-600">WhatsApp</h3>
                <p class="text-sm text-gray-500">Receba mensagens direto no seu celular</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button 
            (click)="onConfigureNotifications('email')"
            class="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 group-hover:text-blue-600">Email</h3>
                <p class="text-sm text-gray-500">Receba novidades na sua caixa de entrada</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button 
            (click)="onConfigureNotifications('push')"
            class="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left">
            <div class="flex items-center gap-4">
              <div class="bg-purple-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 group-hover:text-purple-600">Notificações Push</h3>
                <p class="text-sm text-gray-500">Alertas instantâneos no navegador</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Skip Button -->
        <button 
          (click)="onClose()"
          class="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors">
          Agora não
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class WelcomeModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  constructor(private readonly router: Router) {}

  onConfigureNotifications(type: 'whatsapp' | 'email' | 'push'): void {
    // Salvar que o usuário já viu o modal
    localStorage.setItem('welcomeModalShown', 'true');
    
    // Fechar modal
    this.closeModal.emit();
    
    // Redirecionar para configurações com o tipo selecionado
    this.router.navigate(['/configuracoes'], { 
      queryParams: { notificationType: type } 
    });
  }

  onClose(): void {
    // Salvar que o usuário já viu o modal
    localStorage.setItem('welcomeModalShown', 'true');
    this.closeModal.emit();
  }
}

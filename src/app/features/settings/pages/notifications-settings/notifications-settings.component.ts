import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationPreferences } from '../../../../core/models/notification-preferences.model';

interface NotificationSettings {
  whatsapp: {
    enabled: boolean;
    phoneNumber: string;
  };
  email: {
    enabled: boolean;
    emailAddress: string;
  };
  push: {
    enabled: boolean;
  };
}

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background-color: #EEF2F5;">
      <!-- Header com gradiente -->
      <header style="background: linear-gradient(to right, #7588A8, #95A7C1, #9AB6C8);">
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Configurações de Notificações</h1>
          <p class="text-white/90 text-base">Escolha como deseja receber atualizações sobre novos produtos</p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-20">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style="border-color: #7588A8;"></div>
            <p class="text-lg" style="color: #6B7785;">Carregando preferências...</p>
          </div>
        </div>

        <!-- Conteúdo (só exibe após carregar) -->
        <div *ngIf="!isLoading">
        <!-- Mensagem de Erro -->
        <div *ngIf="errorMessage" class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-700 font-medium">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6" style="border: 1px solid #D7DDE3;">
          <div class="flex items-start gap-4">
            <div class="rounded-full p-3" style="background-color: #25D366;">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold" style="color: #23292A;">WhatsApp</h2>
                  <p class="text-sm" style="color: #6B7785;">Receba mensagens direto no seu celular</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="settings.whatsapp.enabled"
                    (change)="saveSettings()"
                    class="sr-only peer">
                  <div class="w-11 h-6 bg-[#D7DDE3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div *ngIf="settings.whatsapp.enabled" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: #23292A;">Número do WhatsApp</label>
                  <input 
                    type="tel"
                    [(ngModel)]="settings.whatsapp.phoneNumber"
                    (blur)="saveSettings()"
                    placeholder="(82) 99999-9999"
                    class="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4; color: #23292A;">
                  <p class="text-xs mt-1" style="color: #6B7785;">Digite com DDD</p>
                </div>
                <div *ngIf="settings.whatsapp.phoneNumber && settings.whatsapp.phoneNumber.length > 0" 
                  class="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-start gap-2">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Notificações via WhatsApp ativadas! Você receberá mensagens quando novos produtos forem publicados.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6" style="border: 1px solid #D7DDE3;">
          <div class="flex items-start gap-4">
            <div class="rounded-full p-3" style="background-color: #EA4335;">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold" style="color: #23292A;">Email</h2>
                  <p class="text-sm" style="color: #6B7785;">Receba novidades na sua caixa de entrada</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="settings.email.enabled"
                    (change)="saveSettings()"
                    class="sr-only peer">
                  <div class="w-11 h-6 bg-[#D7DDE3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div *ngIf="settings.email.enabled" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: #23292A;">Endereço de Email</label>
                  <input 
                    type="email"
                    [(ngModel)]="settings.email.emailAddress"
                    (blur)="saveSettings()"
                    placeholder="seu@email.com"
                    class="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4; color: #23292A;">
                </div>
                <div *ngIf="settings.email.emailAddress && settings.email.emailAddress.length > 0" 
                  class="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start gap-2">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Notificações via Email ativadas! Você receberá emails quando novos produtos forem publicados.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Push Notifications -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6" style="border: 1px solid #D7DDE3;">
          <div class="flex items-start gap-4">
            <div class="rounded-full p-3" style="background-color: #FF6B35;">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold" style="color: #23292A;">Notificações Push</h2>
                  <p class="text-sm" style="color: #6B7785;">Alertas instantâneos no navegador</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="settings.push.enabled"
                    (change)="onPushToggle()"
                    class="sr-only peer">
                  <div class="w-11 h-6 bg-[#D7DDE3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              <div *ngIf="settings.push.enabled" class="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm flex items-start gap-2">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Notificações Push ativadas! Você receberá alertas instantâneos no navegador.</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Save confirmation -->
        <div *ngIf="showSaveConfirmation" 
          class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Configurações salvas!</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `]
})
export class NotificationsSettingsComponent implements OnInit {
  settings: NotificationSettings = {
    whatsapp: {
      enabled: false,
      phoneNumber: ''
    },
    email: {
      enabled: false,
      emailAddress: ''
    },
    push: {
      enabled: false
    }
  };

  showSaveConfirmation = false;
  errorMessage = '';
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Carregar configurações salvas (do service)
    this.loadSettings();

    // Verificar se veio de um tipo específico
    this.route.queryParams.subscribe(params => {
      const notificationType = params['notificationType'];
      if (notificationType) {
        this.activateNotificationType(notificationType);
      }
    });
  }

  activateNotificationType(type: string): void {
    switch (type) {
      case 'whatsapp':
        this.settings.whatsapp.enabled = true;
        break;
      case 'email':
        this.settings.email.enabled = true;
        break;
      case 'push':
        this.settings.push.enabled = true;
        this.requestPushPermission();
        break;
    }
    this.saveSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.notificationService.getPreferences().subscribe({
      next: (prefs) => {
        void this.applyLoadedSettings(prefs);
      },
      error: (error) => {
        console.error('Erro ao carregar preferências:', error);
        this.isLoading = false;
        // Continuar com valores padrão
      }
    });
  }

  saveSettings(): void {
    this.errorMessage = '';

    // Validar WhatsApp se estiver ativo
    if (this.settings.whatsapp.enabled && this.settings.whatsapp.phoneNumber) {
      const phoneValidation = this.notificationService.validatePhoneNumber(this.settings.whatsapp.phoneNumber);
      if (!phoneValidation.valid) {
        this.errorMessage = `WhatsApp: ${phoneValidation.error}`;
        return;
      }
      // Usar número formatado
      this.settings.whatsapp.phoneNumber = phoneValidation.formatted || this.settings.whatsapp.phoneNumber;
    }

    // Validar email se estiver ativo
    if (this.settings.email.enabled && this.settings.email.emailAddress) {
      const emailValidation = this.notificationService.validateEmail(this.settings.email.emailAddress);
      if (!emailValidation.valid) {
        this.errorMessage = `Email: ${emailValidation.error}`;
        return;
      }
    }

    // Salvar usando o service
    const prefs: NotificationPreferences = {
      whatsapp: this.settings.whatsapp,
      email: this.settings.email,
      push: this.settings.push
    };

    this.notificationService.savePreferences(prefs).subscribe({
      next: (response) => {
        this.showSaveConfirmation = true;
        setTimeout(() => {
          this.showSaveConfirmation = false;
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erro ao salvar preferências. Tente novamente.';
        console.error(error);
      }
    });
  }

  async onPushToggle(): Promise<void> {
    if (this.settings.push.enabled) {
      await this.requestPushPermission();
    } else {
      // Remover subscription do navegador e avisar o backend
      await this.notificationService.removePushSubscription();
      this.saveSettings();
    }
  }

  async requestPushPermission(): Promise<void> {
    const granted = await this.notificationService.requestPushPermission();

    if (granted) {
      this.settings.push.enabled = true;
      this.saveSettings();
      this.notificationService.sendTestPushNotification();
    } else {
      this.settings.push.enabled = false;
      this.errorMessage = 'Não foi possível ativar as notificações push. Verifique a permissão do navegador e se a assinatura foi registrada no servidor.';
    }
  }

  private async applyLoadedSettings(prefs: NotificationPreferences): Promise<void> {
    const pushEnabled = await this.notificationService.syncPushSubscription();
    this.settings = {
      whatsapp: prefs.whatsapp,
      email: prefs.email,
      push: {
        enabled: pushEnabled
      }
    };
    this.isLoading = false;
  }
}

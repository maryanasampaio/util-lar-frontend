import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreferences } from '../../../core/models/notification-preferences.model';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal 
      [isOpen]="isOpen" 
      [title]="'🔔 Configurar Notificações'" 
      (closeModal)="close()">
      <div class="space-y-6">
        <!-- Descrição -->
        <div class="p-4 rounded-lg" style="background-color: #F5F7FA; border: 1px solid #E6EBEF;">
          <p class="text-sm" style="color: #23292A;">
            Ative as notificações para ser avisado quando:
          </p>
          <ul class="mt-2 space-y-1 text-sm" style="color: #6B7785;">
            <li>• <strong>Novos produtos</strong> forem adicionados</li>
            <li>• <strong>Preços de produtos</strong> forem atualizados</li>
          </ul>
        </div>

        <!-- Status -->
        <div *ngIf="!hasActiveNotifications" class="p-4 rounded-lg border-2" style="background-color: #FFF9E6; border-color: #F0D053;">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <p class="font-semibold" style="color: #8B6914;">Notificações Desativadas</p>
              <p class="text-sm" style="color: #8B6914;">Ative pelo menos um meio de notificação abaixo</p>
            </div>
          </div>
        </div>

        <div *ngIf="hasActiveNotifications" class="p-4 rounded-lg border-2" style="background-color: #E6F4EA; border-color: #5A8A6A;">
          <div class="flex items-center gap-3">
            <span class="text-2xl">✅</span>
            <div>
              <p class="font-semibold" style="color: #2D6A3F;">Notificações Ativadas</p>
              <p class="text-sm" style="color: #2D6A3F;">Você será avisado sobre novidades!</p>
            </div>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="p-4 rounded-lg border" style="background-color: #FFFFFF; border-color: #D7DDE3;">
          <div class="flex items-start gap-3 mb-3">
            <span class="text-2xl">💬</span>
            <div class="flex-1">
              <h3 class="font-bold text-lg" style="color: #23292A;">WhatsApp</h3>
              <p class="text-sm" style="color: #6B7785;">Receba mensagens diretas no seu WhatsApp</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.whatsapp.enabled"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div *ngIf="settings.whatsapp.enabled" class="mt-3 pl-11">
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Número de WhatsApp</label>
            <input 
              type="tel" 
              [(ngModel)]="settings.whatsapp.phoneNumber"
              placeholder="(82) 99999-9999"
              class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent"
              style="border-color: #D7DDE3; color: #23292A;">
            <p class="text-xs mt-1" style="color: #6B7785;">Formato: (82) 99999-9999</p>
            <p *ngIf="whatsappError" class="text-xs mt-1 text-red-600">{{ whatsappError }}</p>
          </div>
        </div>

        <!-- Push Notifications -->
        <div class="p-4 rounded-lg border" style="background-color: #FFFFFF; border-color: #D7DDE3;">
          <div class="flex items-start gap-3">
            <span class="text-2xl">🔔</span>
            <div class="flex-1">
              <h3 class="font-bold text-lg" style="color: #23292A;">Notificações do Navegador</h3>
              <p class="text-sm" style="color: #6B7785;">Receba alertas diretamente no navegador</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.push.enabled"
                (change)="onPushToggle()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex gap-3 pt-4">
          <button 
            (click)="close()"
            class="flex-1 px-6 py-3 rounded-lg font-semibold border transition-colors"
            style="color: #23292A; background-color: transparent; border-color: #D7DDE3;"
            onmouseover="this.style.backgroundColor='#F5F7FA'"
            onmouseout="this.style.backgroundColor='transparent'">
            Cancelar
          </button>
          <button 
            (click)="saveSettings()"
            [disabled]="isSaving"
            class="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors"
            [style.opacity]="isSaving ? '0.5' : '1'"
            style="background-color: #7588A8; color: #FFFFFF;"
            onmouseover="this.style.backgroundColor='#95A7C1'"
            onmouseout="this.style.backgroundColor='#7588A8'">
            {{ isSaving ? 'Salvando...' : 'Salvar Configurações' }}
          </button>
        </div>

        <!-- Mensagem de Sucesso -->
        <div *ngIf="showSuccess" class="p-4 rounded-lg border-2" style="background-color: #E6F4EA; border-color: #5A8A6A;">
          <p class="text-center font-semibold" style="color: #2D6A3F;">
            ✅ Configurações salvas com sucesso!
          </p>
        </div>
      </div>
    </app-modal>
  `
})
export class NotificationModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() settingsSaved = new EventEmitter<NotificationPreferences>();

  settings = {
    whatsapp: {
      enabled: false,
      phoneNumber: ''
    },
    push: {
      enabled: false
    }
  };

  isSaving = false;
  showSuccess = false;
  whatsappError = '';

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  get hasActiveNotifications(): boolean {
    return this.settings.whatsapp.enabled || this.settings.push.enabled;
  }

  loadSettings(): void {
    this.notificationService.getPreferences().subscribe({
      next: (prefs) => {
        if (prefs) {
          this.settings.whatsapp.enabled = prefs.whatsapp?.enabled || false;
          this.settings.whatsapp.phoneNumber = prefs.whatsapp?.phoneNumber || '';
          this.settings.push.enabled = prefs.push?.enabled || false;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar preferências:', err);
      }
    });
  }

  onPushToggle(): void {
    if (this.settings.push.enabled) {
      this.requestPushPermission();
    }
  }

  requestPushPermission(): void {
    if (!('Notification' in globalThis)) {
      alert('Seu navegador não suporta notificações');
      this.settings.push.enabled = false;
      return;
    }

    if (Notification.permission === 'granted') {
      return;
    }

    if (Notification.permission === 'denied') {
      this.settings.push.enabled = false;
      alert('Notificações bloqueadas. Permita nas configurações do navegador.');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        this.settings.push.enabled = false;
        alert('Você precisa permitir notificações nas configurações do navegador');
      }
    });
  }

  saveSettings(): void {
    this.whatsappError = '';

    // Validar WhatsApp se habilitado
    if (this.settings.whatsapp.enabled) {
      const validation = this.notificationService.validatePhoneNumber(this.settings.whatsapp.phoneNumber);
      if (!validation.valid) {
        this.whatsappError = validation.error || 'Número inválido';
        return;
      }
      this.settings.whatsapp.phoneNumber = validation.formatted || this.settings.whatsapp.phoneNumber;
    }

    this.isSaving = true;

    const preferences: NotificationPreferences = {
      whatsapp: {
        enabled: this.settings.whatsapp.enabled,
        phoneNumber: this.settings.whatsapp.phoneNumber
      },
      email: {
        enabled: false,
        emailAddress: ''
      },
      push: {
        enabled: this.settings.push.enabled
      }
    };

    this.notificationService.savePreferences(preferences).subscribe({
      next: (response) => {
        this.showSuccess = true;
        this.settingsSaved.emit(preferences);
        
        setTimeout(() => {
          this.showSuccess = false;
          this.close();
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert('Erro ao salvar configurações. Tente novamente.');
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AlertConfig {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      (click)="onBackdropClick($event)">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fade-in"
        (click)="$event.stopPropagation()">
        
        <!-- Header com ícone -->
        <div class="p-6 pb-4">
          <div class="flex items-start gap-4">
            <!-- Ícone baseado no tipo -->
            <div class="flex-shrink-0">
              <!-- Success -->
              <div *ngIf="config.type === 'success'" class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: #d4f4dd;">
                <svg class="w-6 h-6" style="color: #2d6a3f;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Error -->
              <div *ngIf="config.type === 'error'" class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: #fee;">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Warning -->
              <div *ngIf="config.type === 'warning'" class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: #fef3cd;">
                <svg class="w-6 h-6" style="color: #8b6914;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Info -->
              <div *ngIf="config.type === 'info'" class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: #E6EBEF;">
                <svg class="w-6 h-6" style="color: #7588A8;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Confirm -->
              <div *ngIf="config.type === 'confirm'" class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: #E6EBEF;">
                <svg class="w-6 h-6" style="color: #7588A8;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-2" style="color: #23292A;">{{ config.title }}</h3>
              <p class="text-base leading-relaxed" style="color: #6B7785;">{{ config.message }}</p>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="px-6 pb-6 flex gap-3 justify-end">
          <!-- Botão de Cancelar (apenas para confirm) -->
          <button 
            *ngIf="config.type === 'confirm'"
            (click)="onCancel()"
            class="px-5 py-2.5 rounded-lg font-semibold transition-colors" 
            style="background-color: #E6EBEF; color: #23292A;"
            onmouseover="this.style.backgroundColor='#D7DDE3'" 
            onmouseout="this.style.backgroundColor='#E6EBEF'">
            {{ config.cancelText || 'Cancelar' }}
          </button>
          
          <!-- Botão de Confirmar/OK -->
          <button 
            (click)="onConfirm()"
            class="px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-md"
            [style.background-color]="getButtonColor()"
            style="color: #FFFFFF;"
            [attr.onmouseover]="getButtonHoverStyle()"
            [attr.onmouseout]="getButtonOutStyle()">
            {{ config.confirmText || (config.type === 'confirm' ? 'Confirmar' : 'OK') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `]
})
export class AlertModalComponent {
  isOpen = false;
  config: AlertConfig = {
    title: '',
    message: '',
    type: 'info'
  };

  show(config: AlertConfig): void {
    this.config = config;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  onConfirm(): void {
    if (this.config.onConfirm) {
      this.config.onConfirm();
    }
    this.close();
  }

  onCancel(): void {
    if (this.config.onCancel) {
      this.config.onCancel();
    }
    this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      if (this.config.type === 'confirm') {
        this.onCancel();
      } else {
        this.close();
      }
    }
  }

  getButtonColor(): string {
    switch (this.config.type) {
      case 'success': return '#5a8a6a';
      case 'error': return '#c85a54';
      case 'warning': return '#d4a650';
      case 'confirm': return '#7588A8';
      default: return '#7588A8';
    }
  }

  getButtonHoverStyle(): string {
    const hoverColors: Record<string, string> = {
      success: '#4a7a5a',
      error: '#b84a44',
      warning: '#c49640',
      confirm: '#95A7C1',
      info: '#95A7C1'
    };
    return `this.style.backgroundColor='${hoverColors[this.config.type] || '#95A7C1'}'`;
  }

  getButtonOutStyle(): string {
    return `this.style.backgroundColor='${this.getButtonColor()}'`;
  }
}

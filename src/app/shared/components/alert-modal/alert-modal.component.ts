import { Component, ChangeDetectorRef } from '@angular/core';
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
      class="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4"
      (click)="onBackdropClick($event)">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-brand-900/60 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden"
        role="alertdialog"
        (click)="$event.stopPropagation()">

        <!-- Faixa de cor no topo -->
        <div class="h-1.5" [ngClass]="accentBarClass"></div>

        <div class="p-6 pb-5">
          <div class="flex items-start gap-4">
            <!-- Ícone -->
            <div class="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" [ngClass]="iconWrapperClass">
              <svg *ngIf="config.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <svg *ngIf="config.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <svg *ngIf="config.type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <svg *ngIf="config.type === 'info'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg *ngIf="config.type === 'confirm'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>

            <div class="flex-1 min-w-0 pt-0.5">
              <h3 class="font-display text-lg font-extrabold text-ink tracking-tight mb-1.5">{{ config.title }}</h3>
              <p class="text-sm leading-relaxed text-muted">{{ config.message }}</p>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="px-6 pb-6 flex gap-3 justify-end">
          <button
            *ngIf="config.type === 'confirm'"
            (click)="onCancel()"
            class="btn-secondary px-5 py-2.5 text-sm">
            {{ config.cancelText || 'Cancelar' }}
          </button>
          <button
            (click)="onConfirm()"
            class="btn px-5 py-2.5 text-sm text-white shadow-md"
            [ngClass]="confirmButtonClass">
            {{ config.confirmText || (config.type === 'confirm' ? 'Confirmar' : 'OK') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AlertModalComponent {
  isOpen = false;
  config: AlertConfig = {
    title: '',
    message: '',
    type: 'info'
  };

  constructor(private readonly cdr: ChangeDetectorRef) {}

  show(config: AlertConfig): void {
    this.config = config;
    this.isOpen = true;
    this.cdr.detectChanges();
  }

  close(): void {
    this.isOpen = false;
    this.cdr.detectChanges();
  }

  onConfirm(): void {
    const callback = this.config.onConfirm;
    this.close();
    if (callback) {
      callback();
    }
  }

  onCancel(): void {
    const callback = this.config.onCancel;
    this.close();
    if (callback) {
      callback();
    }
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

  get accentBarClass(): string {
    switch (this.config.type) {
      case 'success': return 'bg-success-600';
      case 'error': return 'bg-danger-600';
      case 'warning': return 'bg-warning-600';
      default: return 'bg-brand-500';
    }
  }

  get iconWrapperClass(): string {
    switch (this.config.type) {
      case 'success': return 'bg-success-100 text-success-700';
      case 'error': return 'bg-danger-100 text-danger-600';
      case 'warning': return 'bg-warning-100 text-warning-700';
      default: return 'bg-brand-100 text-brand-600';
    }
  }

  get confirmButtonClass(): string {
    switch (this.config.type) {
      case 'success': return 'bg-success-600 hover:bg-success-700 shadow-success-600/25';
      case 'error': return 'bg-danger-600 hover:bg-danger-700 shadow-danger-600/25';
      case 'warning': return 'bg-warning-600 hover:bg-warning-700 shadow-warning-600/25';
      default: return 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/25';
    }
  }
}

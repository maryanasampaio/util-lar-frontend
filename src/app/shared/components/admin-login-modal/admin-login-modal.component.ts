import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50"
      (click)="onClose()">
      
      <div 
        class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-fade-in"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-ink">Acesso Admin</h2>
          <button 
            (click)="onClose()"
            class="btn-ghost w-9 h-9 rounded-lg p-0" aria-label="Fechar">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-ink mb-2">
              Senha de Administrador
            </label>
            <input 
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Digite a senha secreta"
              class="input px-4 py-3"
              autofocus>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-xl text-sm font-medium">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            [disabled]="isLoading"
            class="btn-primary w-full py-3 px-6 text-sm">
            {{ isLoading ? 'Verificando...' : 'Entrar como Admin' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLoginModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() adminAuthenticated = new EventEmitter<string>();

  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (this.password.trim()) {
      this.isLoading = true;
      this.errorMessage = '';
      // Envia senha para o componente pai validar no backend
      this.adminAuthenticated.emit(this.password);
      
      // Reset após um delay para permitir que o pai processe
      setTimeout(() => {
        this.isLoading = false;
        this.password = '';
      }, 100);
    } else {
      this.errorMessage = 'Por favor, digite a senha.';
    }
  }

  setError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.password = '';
  }

  setSuccess(): void {
    this.isLoading = false;
    this.password = '';
    this.errorMessage = '';
  }

  onClose(): void {
    // Reseta o estado ao fechar
    this.password = '';
    this.errorMessage = '';
    this.isLoading = false;
    this.closeModal.emit();
  }
}

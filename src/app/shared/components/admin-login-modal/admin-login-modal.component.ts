import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="onClose()">
      
      <div 
        class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold" style="color: #23292A;">Acesso Admin</h2>
          <button 
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Senha de Administrador
            </label>
            <input 
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Digite a senha secreta"
              class="w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;"
              autofocus>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            [disabled]="isLoading"
            [class.opacity-50]="isLoading"
            [class.cursor-not-allowed]="isLoading"
            class="w-full text-white font-bold py-3 px-6 rounded-lg transition-all" style="background-color: #7588A8;">
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
  }

  onClose(): void {
    this.closeModal.emit();
  }
}

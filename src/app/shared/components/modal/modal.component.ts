import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-brand-900/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
          (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="sticky top-0 px-4 sm:px-6 py-3.5 sm:py-4 rounded-t-2xl flex items-center justify-between z-10 bg-white/95 backdrop-blur border-b border-line">
            <h2 class="font-display text-lg sm:text-xl font-extrabold text-ink tracking-tight">{{ title }}</h2>
            <button
              (click)="close()"
              class="btn-ghost w-9 h-9 rounded-lg p-0"
              aria-label="Fechar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-4 sm:p-6">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}

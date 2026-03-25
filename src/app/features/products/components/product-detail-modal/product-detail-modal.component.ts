import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal *ngIf="product" [isOpen]="isOpen" [title]="product.name" (closeModal)="close()">
      <div class="space-y-6">
        <!-- Imagens -->
        <div class="grid grid-cols-2 gap-4">
          <div *ngFor="let img of product.images" class="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img [src]="img" [alt]="product.name" class="w-full h-full object-cover">
          </div>
          <div *ngIf="!product.images || product.images.length === 0" 
            class="aspect-square rounded-lg bg-gradient-to-br flex items-center justify-center col-span-2" style="background: linear-gradient(135deg, #EEF2F5, #E6EBEF);">
            <svg class="h-32 w-32" style="color: #9AB6C8;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2">
          <span [class]="product.condition === 'novo' ? 'bg-green-500' : 'bg-yellow-500'"
            class="px-4 py-2 text-white rounded-full text-sm font-bold">
            {{ product.condition === 'novo' ? '✨ Novo' : '♻️ Seminovo' }}
          </span>
          <span *ngIf="product.featured" class="px-4 py-2 text-white rounded-full text-sm font-bold" style="background-color: #7588A8;">
            ⭐ Destaque
          </span>
          <span class="px-4 py-2 text-white rounded-full text-sm font-bold" style="background-color: #9AB6C8;">
            {{ product.category }}
          </span>
        </div>

        <!-- Preço -->
        <div class="p-6 rounded-xl" style="background: linear-gradient(to right, #EEF2F5, #E6EBEF);">
          <div class="text-sm mb-1" style="color: #6B7785;">Preço</div>
          <div class="text-4xl font-bold" style="color: #7588A8;">
            R$ {{ formatarPreco(product.price) }}
          </div>
        </div>

        <!-- Descrição -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Descrição</h3>
          <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
        </div>

        <!-- Especificações -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">Especificações</h3>
          <div class="grid grid-cols-2 gap-4">
            <div *ngIf="product.material" class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Material</div>
              <div class="font-semibold text-gray-900">{{ product.material }}</div>
            </div>
            <div *ngIf="product.color" class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Cor</div>
              <div class="font-semibold text-gray-900">{{ product.color }}</div>
            </div>
            <div *ngIf="product.brand" class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Marca</div>
              <div class="font-semibold text-gray-900">{{ product.brand }}</div>
            </div>
            <div *ngIf="product.warranty" class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Garantia</div>
              <div class="font-semibold text-gray-900">{{ product.warranty }}</div>
            </div>
            <div *ngIf="product.dimensions" class="bg-gray-50 p-4 rounded-lg col-span-2">
              <div class="text-sm text-gray-600 mb-1">Dimensões</div>
              <div class="font-semibold text-gray-900">
                {{ product.dimensions.width }}x{{ product.dimensions.height }}x{{ product.dimensions.depth }} {{ product.dimensions.unit }}
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Estoque</div>
              <div class="font-semibold" [class]="product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'">
                {{ product.stock }} {{ product.stock === 1 ? 'unidade' : 'unidades' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Botão WhatsApp -->
        <button 
          *ngIf="product.disponivel === 1"
          (click)="entrarEmContato()"
          class="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Entre em Contato e Reserve Agora
        </button>

        <div *ngIf="product.disponivel === 0" class="text-center p-6 rounded-xl" style="background-color: #EEF2F5; border: 2px solid #D7DDE3;">
          <span class="text-2xl font-bold" style="color: #6B7785;">✓ PRODUTO VENDIDO</span>
        </div>
      </div>
    </app-modal>
  `
})
export class ProductDetailModalComponent {
  @Input() isOpen = false;
  @Input() product?: Product;
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  entrarEmContato(): void {
    if (!this.product) return;
    const mensagem = `Olá! Tenho interesse no produto: ${this.product.name} - R$ ${this.formatarPreco(this.product.price)}`;
    const whatsappUrl = `https://wa.me/5582996572843?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
  }
}

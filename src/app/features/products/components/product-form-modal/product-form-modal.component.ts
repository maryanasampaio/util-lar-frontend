import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Product, ProductFormData } from '../../models/product.model';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="editMode ? 'Editar Produto' : 'Novo Produto'" (closeModal)="close()">
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Nome do Produto *</label>
          <input 
            type="text" 
            [(ngModel)]="formData.name" 
            name="name"
            required
            placeholder="Ex: Sofá 3 Lugares Retrátil"
            class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;" onfocus="this.style.boxShadow='0 0 0 2px #7588A8'" onblur="this.style.boxShadow='none'">
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Descrição *</label>
          <textarea 
            [(ngModel)]="formData.description" 
            name="description"
            required
            rows="3"
            placeholder="Descreva o produto..."
            class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;"></textarea>
        </div>

        <!-- Preço e Custo -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Preço de Venda (R$) *</label>
            <input 
              type="number" 
              [(ngModel)]="formData.price" 
              name="price"
              required
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Preço de Custo (R$)</label>
            <input 
              type="number" 
              [(ngModel)]="formData.costPrice" 
              name="costPrice"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Condição e Categoria -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Condição *</label>
            <select 
              [(ngModel)]="formData.condition" 
              name="condition"
              required
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Categoria *</label>
            <input 
              type="text" 
              [(ngModel)]="formData.category" 
              name="category"
              required
              placeholder="Ex: Sofá, Mesa, Cadeira"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Material, Cor, Marca -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Material</label>
            <input 
              type="text" 
              [(ngModel)]="formData.material" 
              name="material"
              placeholder="Ex: Madeira"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Cor</label>
            <input 
              type="text" 
              [(ngModel)]="formData.color" 
              name="color"
              placeholder="Ex: Marrom"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Marca</label>
            <input 
              type="text" 
              [(ngModel)]="formData.brand" 
              name="brand"
              placeholder="Ex: Util Lar"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Estoque e Garantia -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Estoque *</label>
            <input 
              type="number" 
              [(ngModel)]="formData.stock" 
              name="stock"
              required
              min="0"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Garantia</label>
            <input 
              type="text" 
              [(ngModel)]="formData.warranty" 
              name="warranty"
              placeholder="Ex: 90 dias"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Upload de Imagens -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Imagens do Produto
            <span class="text-xs text-gray-500 font-normal ml-2">(Selecione até 4 imagens)</span>
          </label>
          <div class="space-y-3">
            <!-- Input de arquivo -->
            <div class="relative">
              <input 
                type="file" 
                (change)="onFileSelect($event)"
                accept="image/*"
                multiple
                class="hidden"
                #fileInput>
              <button 
                type="button"
                (click)="fileInput.click()"
                class="w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors font-medium flex items-center justify-center gap-2" style="border-color: #D7DDE3; color: #6B7785;" onmouseenter="this.style.borderColor='#7588A8'; this.style.color='#7588A8'" onmouseleave="this.style.borderColor='#D7DDE3'; this.style.color='#6B7785'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Selecionar Imagens da Galeria
              </button>
            </div>
            
            <!-- Preview das imagens -->
            <div class="grid grid-cols-4 gap-3">
              <div *ngFor="let url of imageUrls; let i = index; trackBy: trackByIndex" class="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                <img [src]="url" alt="Preview" class="w-full h-full object-cover">
                <button 
                  type="button"
                  (click)="removeImage(i)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div *ngIf="i === 0" class="absolute bottom-0 left-0 right-0 text-white text-xs font-bold py-1 text-center" style="background-color: #7588A8;">
                  Principal
                </div>
              </div>
            </div>
            
            <p *ngIf="imageUrls.length === 0" class="text-xs text-gray-500 text-center py-2">
              Nenhuma imagem selecionada
            </p>
          </div>
        </div>

        <!-- Featured -->
        <div class="flex items-center">
          <input 
            type="checkbox" 
            [(ngModel)]="formData.featured" 
            name="featured"
            id="featured"
            class="w-4 h-4 border-gray-300 rounded" style="accent-color: #7588A8;">
          <label for="featured" class="ml-2 text-sm font-medium text-gray-700">Produto em destaque</label>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 pt-4 border-t">
          <button 
            type="button"
            (click)="close()"
            class="flex-1 px-6 py-3 rounded-lg transition-colors font-medium" style="border: 1px solid #D7DDE3; color: #6B7785;">
            Cancelar
          </button>
          <button 
            type="submit"
            class="flex-1 px-6 py-3 text-white rounded-lg transition-colors font-bold shadow-lg" style="background-color: #7588A8;">
            {{ editMode ? 'Atualizar' : 'Criar' }} Produto
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class ProductFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product?: Product;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<ProductFormData>();

  editMode = false;
  imageUrls: string[] = [];
  formData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    condition: 'novo',
    category: '',
    images: null,
    stock: 1,
    material: '',
    color: '',
    brand: '',
    warranty: '',
    featured: false
  };

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProductData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta mudanças no @Input() product
    if (changes['product'] && !changes['product'].firstChange) {
      this.loadProductData();
    }
  }

  private loadProductData(): void {
    console.log('[ProductFormModal] loadProductData chamado. Product:', this.product);
    
    if (this.product) {
      this.editMode = true;
      this.imageUrls = this.product.images || [];
      this.formData = {
        name: this.product.name,
        description: this.product.description,
        price: this.product.price / 100, // Converte de centavos para reais
        costPrice: this.product.costPrice ? this.product.costPrice / 100 : undefined,
        condition: this.product.condition,
        category: this.product.category,
        images: this.product.images,
        stock: this.product.stock,
        dimensions: this.product.dimensions,
        material: this.product.material,
        color: this.product.color,
        brand: this.product.brand,
        warranty: this.product.warranty,
        featured: this.product.featured
      };
      console.log('[ProductFormModal] Formulário preenchido com:', this.formData);
    } else {
      // Reset para modo de criação
      console.log('[ProductFormModal] Modo criação - formulário resetado');
      this.editMode = false;
      this.imageUrls = [];
      this.formData = {
        name: '',
        description: '',
        price: 0,
        costPrice: 0,
        condition: 'novo',
        category: '',
        images: null,
        stock: 1,
        material: '',
        color: '',
        brand: '',
        warranty: '',
        featured: false
      };
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const maxFiles = 4;
      const filesToAdd = Math.min(input.files.length, maxFiles - this.imageUrls.length);
      
      console.log(`[ProductFormModal] Selecionadas ${filesToAdd} imagens para carregar`);
      
      for (let i = 0; i < filesToAdd; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target && e.target.result) {
            const imageUrl = e.target.result as string;
            console.log(`[ProductFormModal] Imagem carregada, tamanho: ${imageUrl.length} chars`);
            
            // Adiciona imagem dentro da zona do Angular
            this.imageUrls.push(imageUrl);
            
            // Força detecção de mudanças imediatamente
            this.cdr.detectChanges();
            
            console.log(`[ProductFormModal] Total de imagens agora: ${this.imageUrls.length}`);
          }
        };
        
        reader.readAsDataURL(file);
      }
      
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(): void {
    const data: ProductFormData = {
      ...this.formData,
      price: Math.round(this.formData.price * 100),
      costPrice: this.formData.costPrice ? Math.round(this.formData.costPrice * 100) : undefined,
      images: this.imageUrls.length > 0 ? this.imageUrls : null
    };
    this.submitForm.emit(data);
  }

  close(): void {
    this.closeModal.emit();
  }
}

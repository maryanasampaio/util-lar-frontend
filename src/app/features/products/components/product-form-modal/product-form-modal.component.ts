import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Product, ProductFormData, ProductFormSubmission } from '../../models/product.model';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="editMode ? 'Editar Produto' : 'Novo Produto'" (closeModal)="close()">
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Nome do Produto</label>
          <input 
            type="text" 
            [(ngModel)]="formData.name" 
            name="name"
            placeholder="Ex: Sofá 3 Lugares Retrátil"
            class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;" onfocus="this.style.boxShadow='0 0 0 2px #7588A8'" onblur="this.style.boxShadow='none'">
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Descrição</label>
          <textarea 
            [(ngModel)]="formData.description" 
            name="description"
            rows="3"
            placeholder="Descreva o produto..."
            class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;"></textarea>
        </div>

        <!-- Preço e Custo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Preço de Venda (R$)</label>
            <input 
              type="number" 
              [(ngModel)]="formData.price" 
              name="price"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Condição e Categoria -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Condição</label>
            <select 
              [(ngModel)]="formData.condition" 
              name="condition"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Categoria</label>
            <input 
              type="text" 
              [(ngModel)]="formData.category" 
              name="category"
              placeholder="Ex: Sofá, Mesa, Cadeira"
              class="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none" style="border: 1px solid #D7DDE3; background-color: #EDF1F4;">
          </div>
        </div>

        <!-- Material, Cor, Marca -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: #23292A;">Estoque</label>
            <input 
              type="number" 
              [(ngModel)]="formData.stock" 
              name="stock"
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
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div 
                *ngFor="let url of imageUrls; let i = index; trackBy: trackByIndex" 
                class="relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move transition-all"
                [class.border-gray-200]="draggedIndex !== i && dragOverIndex !== i"
                [class.opacity-40]="draggedIndex === i"
                [style.border-color]="dragOverIndex === i ? '#7588A8' : null"
                [style.transform]="dragOverIndex === i ? 'scale(1.05)' : null"
                draggable="true"
                (dragstart)="onDragStart($event, i)"
                (dragover)="onDragOver($event, i)"
                (dragleave)="onDragLeave()"
                (drop)="onDrop($event, i)"
                (dragend)="onDragEnd()"
                [title]="imageUrls.length > 1 ? 'Arraste para reordenar' : ''">
                <img [src]="url" alt="Preview" class="w-full h-full object-cover pointer-events-none">
                <button 
                  type="button"
                  (click)="removeImage(i)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <!-- Ícone de arraste -->
                <div *ngIf="imageUrls.length > 1" class="absolute top-1 left-1 bg-white/90 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4" fill="none" stroke="#6B7785" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </div>
                <div *ngIf="i === 0" class="absolute bottom-0 left-0 right-0 text-white text-xs font-bold py-1 text-center pointer-events-none" style="background-color: #7588A8;">
                  Principal
                </div>
              </div>
            </div>
            
            <p *ngIf="imageUrls.length === 0" class="text-xs text-gray-500 text-center py-2">
              Nenhuma imagem selecionada
            </p>
            
            <p *ngIf="imageUrls.length > 1" class="text-xs text-center py-1" style="color: #6B7785;">
              💡 Arraste as imagens para reordenar. A primeira é a imagem principal.
            </p>
          </div>
        </div>

        <!-- Produto em Destaque -->
        <div class="rounded-xl p-4 border-2 transition-all" 
          [style.background-color]="formData.featured ? '#FEF3C7' : '#F5F7FA'" 
          [style.border-color]="formData.featured ? '#F59E0B' : '#D7DDE3'">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" 
              [style.background-color]="formData.featured ? '#FCD34D' : '#E6EBEF'">
              <svg class="w-5 h-5" [attr.fill]="formData.featured ? '#92400E' : 'none'" [attr.stroke]="formData.featured ? '#92400E' : '#6B7785'" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <input 
                  type="checkbox" 
                  [(ngModel)]="formData.featured" 
                  name="featured"
                  id="featured"
                  class="w-5 h-5 border-2 rounded cursor-pointer transition-all" 
                  [style.accent-color]="formData.featured ? '#F59E0B' : '#7588A8'">
                <label for="featured" class="text-base font-bold cursor-pointer" 
                  [style.color]="formData.featured ? '#92400E' : '#23292A'">
                  Produto em Destaque
                </label>
              </div>
              <p class="text-xs leading-relaxed" 
                [style.color]="formData.featured ? '#78350F' : '#6B7785'">
                Este produto será exibido no carrossel principal da página inicial para maior visibilidade
              </p>
            </div>
          </div>
        </div>

        <div *ngIf="!editMode" class="rounded-xl p-4 space-y-2" style="background-color: #F5F7FA; border: 1px solid #D7DDE3;">
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              [(ngModel)]="publishToFacebookMarketplace"
              name="publishToFacebookMarketplace"
              id="publishToFacebookMarketplace"
              class="mt-1 w-4 h-4 border-gray-300 rounded"
              style="accent-color: #7588A8;">
            <div>
              <label for="publishToFacebookMarketplace" class="text-sm font-semibold cursor-pointer" style="color: #23292A;">
                Preparar publicação no Facebook Marketplace
              </label>
              <p class="text-xs leading-relaxed mt-1" style="color: #6B7785;">
                Depois de salvar, o app copia um texto de anúncio e abre o Marketplace em outra guia para você finalizar a publicação manualmente.
              </p>
            </div>
          </div>
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
  @Output() submitForm = new EventEmitter<ProductFormSubmission>();

  editMode = false;
  imageUrls: string[] = [];
  publishToFacebookMarketplace = false;
  
  // Estado de drag-and-drop
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;
  formData: ProductFormData = {
    name: '',
    description: '',
    price: null as unknown as number,
    costPrice: null as unknown as number,
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
      this.publishToFacebookMarketplace = false;
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
      this.publishToFacebookMarketplace = false;
      this.formData = {
        name: '',
        description: '',
        price: null as unknown as number,
        costPrice: null as unknown as number,
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
          if (e.target?.result) {
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

  /**
   * Drag-and-drop: início do arraste
   */
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  /**
   * Drag-and-drop: arrastando sobre outro item
   */
  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.draggedIndex !== null && this.draggedIndex !== index) {
      this.dragOverIndex = index;
      this.cdr.detectChanges();
    }
  }

  /**
   * Drag-and-drop: saiu da área de drop
   */
  onDragLeave(): void {
    this.dragOverIndex = null;
    this.cdr.detectChanges();
  }

  /**
   * Drag-and-drop: soltou o item - reordena o array
   */
  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.resetDragState();
      return;
    }

    const draggedItem = this.imageUrls[this.draggedIndex];
    this.imageUrls.splice(this.draggedIndex, 1);
    this.imageUrls.splice(dropIndex, 0, draggedItem);

    this.resetDragState();
    this.cdr.detectChanges();
  }

  /**
   * Drag-and-drop: finalizou o arraste
   */
  onDragEnd(): void {
    this.resetDragState();
  }

  private resetDragState(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    const data: ProductFormData = {
      ...this.formData,
      price: Math.round(this.formData.price * 100),
      costPrice: this.formData.costPrice ? Math.round(this.formData.costPrice * 100) : undefined,
      images: this.imageUrls.length > 0 ? this.imageUrls : null
    };
    this.submitForm.emit({
      product: data,
      publishToFacebookMarketplace: !this.editMode && this.publishToFacebookMarketplace
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}

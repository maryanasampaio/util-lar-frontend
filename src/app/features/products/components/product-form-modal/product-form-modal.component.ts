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
    <app-modal [isOpen]="isOpen" [title]="editMode ? 'Editar produto' : 'Novo produto'" (closeModal)="close()">
      <form (ngSubmit)="onSubmit()" class="space-y-6">

        <!-- Informações básicas -->
        <section class="space-y-4">
          <p class="section-kicker">Informações básicas</p>
          <div>
            <label for="pf-name" class="label">Nome do produto</label>
            <input id="pf-name" type="text" [(ngModel)]="formData.name" name="name" placeholder="Ex: Sofá 3 lugares retrátil" class="input px-3.5 py-2.5">
          </div>
          <div>
            <label for="pf-description" class="label">Descrição</label>
            <textarea id="pf-description" [(ngModel)]="formData.description" name="description" rows="3" placeholder="Descreva o produto: estado, medidas, diferenciais..." class="input px-3.5 py-2.5 resize-y"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="pf-condition" class="label">Condição</label>
              <div class="relative">
                <select id="pf-condition" [(ngModel)]="formData.condition" name="condition" class="input appearance-none pl-3.5 pr-9 py-2.5 cursor-pointer">
                  <option value="novo">Novo</option>
                  <option value="seminovo">Seminovo</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
            <div>
              <label for="pf-category" class="label">Categoria</label>
              <input id="pf-category" type="text" [(ngModel)]="formData.category" name="category" placeholder="Ex: Sofá, Geladeira, Mesa" class="input px-3.5 py-2.5">
            </div>
          </div>
        </section>

        <!-- Preço -->
        <section class="space-y-4">
          <p class="section-kicker">Preço</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="pf-cost" class="label">Custo (R$)</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-subtle">R$</span>
                <input id="pf-cost" type="number" [(ngModel)]="formData.costPrice" name="costPrice" step="0.01" min="0" placeholder="0,00" class="input pl-10 pr-3.5 py-2.5">
              </div>
            </div>
            <div>
              <label for="pf-price" class="label">Venda (R$)</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-subtle">R$</span>
                <input id="pf-price" type="number" [(ngModel)]="formData.price" name="price" step="0.01" min="0" placeholder="0,00" class="input pl-10 pr-3.5 py-2.5 font-semibold">
              </div>
            </div>
            <div>
              <label for="pf-stock" class="label">Estoque</label>
              <input id="pf-stock" type="number" [(ngModel)]="formData.stock" name="stock" min="0" class="input px-3.5 py-2.5">
            </div>
          </div>
        </section>

        <!-- Detalhes -->
        <section class="space-y-4">
          <p class="section-kicker">Detalhes</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label for="pf-material" class="label">Material</label>
              <input id="pf-material" type="text" [(ngModel)]="formData.material" name="material" placeholder="Madeira" class="input px-3.5 py-2.5">
            </div>
            <div>
              <label for="pf-color" class="label">Cor</label>
              <input id="pf-color" type="text" [(ngModel)]="formData.color" name="color" placeholder="Marrom" class="input px-3.5 py-2.5">
            </div>
            <div>
              <label for="pf-brand" class="label">Marca</label>
              <input id="pf-brand" type="text" [(ngModel)]="formData.brand" name="brand" placeholder="Brastemp" class="input px-3.5 py-2.5">
            </div>
            <div>
              <label for="pf-warranty" class="label">Garantia</label>
              <input id="pf-warranty" type="text" [(ngModel)]="formData.warranty" name="warranty" placeholder="90 dias" class="input px-3.5 py-2.5">
            </div>
          </div>
        </section>

        <!-- Fotos -->
        <section class="space-y-3">
          <div class="flex items-baseline justify-between gap-3">
            <p class="section-kicker">Fotos</p>
            <span class="text-xs text-muted">{{ imageUrls.length }}/4 · a primeira é a foto principal</span>
          </div>
          <input type="file" (change)="onFileSelect($event)" accept="image/*" multiple class="hidden" #fileInput>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              *ngFor="let url of imageUrls; let i = index; trackBy: trackByIndex"
              class="relative aspect-square rounded-xl overflow-hidden bg-canvas border-2 group cursor-move transition-all duration-200"
              [class.border-line]="dragOverIndex !== i"
              [class.border-brand-500]="dragOverIndex === i"
              [class.scale-105]="dragOverIndex === i"
              [class.opacity-40]="draggedIndex === i"
              draggable="true"
              (dragstart)="onDragStart($event, i)"
              (dragover)="onDragOver($event, i)"
              (dragleave)="onDragLeave()"
              (drop)="onDrop($event, i)"
              (dragend)="onDragEnd()"
              [title]="imageUrls.length > 1 ? 'Arraste para reordenar' : ''">
              <img [src]="url" alt="Foto do produto" class="w-full h-full object-contain pointer-events-none">
              <button type="button" (click)="removeImage(i)" class="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-danger-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Remover foto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <span *ngIf="i === 0" class="badge-brand absolute bottom-1.5 left-1.5 shadow-sm">Principal</span>
            </div>

            <button
              *ngIf="imageUrls.length < 4"
              type="button"
              (click)="fileInput.click()"
              class="aspect-square rounded-xl border-2 border-dashed border-line-strong text-muted flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-colors hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              Adicionar foto
            </button>
          </div>

          <p *ngIf="imageUrls.length > 1" class="text-xs text-muted">Arraste as fotos para reordenar.</p>
        </section>

        <!-- Opções -->
        <section class="space-y-3">
          <label class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors"
                 [class.border-brand-500]="formData.featured" [class.bg-brand-50]="formData.featured"
                 [class.border-line]="!formData.featured" [class.bg-white]="!formData.featured">
            <input type="checkbox" [(ngModel)]="formData.featured" name="featured" class="mt-0.5 w-4 h-4 accent-brand-500 cursor-pointer">
            <span class="flex-1">
              <span class="block text-sm font-bold text-ink">Produto em destaque</span>
              <span class="block text-xs text-muted mt-0.5">Marca este produto como destaque da loja.</span>
            </span>
            <svg class="w-5 h-5 shrink-0" [class.text-brand-500]="formData.featured" [class.text-subtle]="!formData.featured" [attr.fill]="formData.featured ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </label>

          <label *ngIf="!editMode" class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors"
                 [class.border-brand-500]="publishToFacebookMarketplace" [class.bg-brand-50]="publishToFacebookMarketplace"
                 [class.border-line]="!publishToFacebookMarketplace" [class.bg-white]="!publishToFacebookMarketplace">
            <input type="checkbox" [(ngModel)]="publishToFacebookMarketplace" name="publishToFacebookMarketplace" class="mt-0.5 w-4 h-4 accent-brand-500 cursor-pointer">
            <span class="flex-1">
              <span class="block text-sm font-bold text-ink">Preparar anúncio no Facebook Marketplace</span>
              <span class="block text-xs text-muted mt-0.5">Depois de salvar, o app copia o texto do anúncio e abre o Marketplace em outra guia para você concluir.</span>
            </span>
          </label>
        </section>

        <!-- Ações -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-line">
          <button type="button" (click)="close()" class="btn-secondary flex-1 h-11 text-sm">Cancelar</button>
          <button type="submit" class="btn-accent flex-1 h-11 text-sm">
            {{ editMode ? 'Salvar alterações' : 'Cadastrar produto' }}
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
      return;
    }

    // Recarrega/reseta o formulário toda vez que o modal é aberto.
    // Sem isso, ao abrir o modal de criação após um envio anterior, os
    // campos permanecem preenchidos com os valores do último produto
    // (porque @Input() product continua undefined e ngOnChanges não dispara).
    if (changes['isOpen'] && !changes['isOpen'].firstChange) {
      const becameOpen = changes['isOpen'].currentValue && !changes['isOpen'].previousValue;
      if (becameOpen) {
        this.loadProductData();
      }
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

        this.compressImage(file).then(imageUrl => {
          console.log(`[ProductFormModal] Imagem carregada, tamanho: ${imageUrl.length} chars`);
          this.imageUrls.push(imageUrl);
          this.cdr.detectChanges();
          console.log(`[ProductFormModal] Total de imagens agora: ${this.imageUrls.length}`);
        }).catch(err => {
          console.error('[ProductFormModal] Falha ao processar imagem:', err);
        });
      }
      
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      input.value = '';
    }
  }

  private compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<string> {
    const readOriginal = () => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    if (!file.type.startsWith('image/') || typeof document === 'undefined') {
      return readOriginal();
    }

    return new Promise<string>((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        if (scale === 1 && file.size < 300 * 1024) {
          readOriginal().then(resolve);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          readOriginal().then(resolve);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`[ProductFormModal] Foto comprimida: ${Math.round(file.size / 1024)} KB -> ${Math.round(dataUrl.length * 0.75 / 1024)} KB (${width}x${height})`);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        readOriginal().then(resolve);
      };
      img.src = objectUrl;
    });
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

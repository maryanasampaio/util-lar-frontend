import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Product } from '../../models/product.model';

type StatusTone = 'success' | 'error' | 'info';

@Component({
  selector: 'app-marketplace-publish-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" title="Publicar no Facebook Marketplace" (closeModal)="close()">
      <div *ngIf="product" class="space-y-6">
        <div class="rounded-xl p-4" style="background-color: #F5F7FA; border: 1px solid #D7DDE3;">
          <p class="text-sm leading-relaxed" style="color: #23292A;">
            O Facebook não permite que outro site preencha automaticamente os campos do Marketplace. Por isso, este painel prepara tudo para colar e enviar mais rápido.
          </p>
          <p *ngIf="copiedFullText" class="text-xs mt-2 font-medium" style="color: #5a8a6a;">
            O texto completo do anúncio já foi copiado automaticamente quando o produto foi criado.
          </p>
        </div>

        <div *ngIf="statusMessage" class="rounded-xl px-4 py-3 text-sm font-medium" [style]="getStatusStyle()">
          {{ statusMessage }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div class="space-y-4">
            <div *ngIf="product.images?.length" class="grid grid-cols-2 gap-3">
              <div *ngFor="let image of product.images; let i = index" class="rounded-xl overflow-hidden border" style="border-color: #D7DDE3; background-color: #F5F7FA;">
                <img [src]="image" [alt]="product.name + ' ' + (i + 1)" class="w-full aspect-square object-cover">
                <div class="px-3 py-2 text-xs font-medium" style="color: #6B7785;">Foto {{ i + 1 }}</div>
              </div>
            </div>

            <div *ngIf="!product.images?.length" class="rounded-xl p-6 text-sm text-center" style="background-color: #F5F7FA; border: 1px dashed #D7DDE3; color: #6B7785;">
              Este produto não tem fotos para enviar ao Marketplace.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                (click)="downloadImages()"
                class="px-4 py-3 rounded-xl font-semibold transition-colors"
                style="background-color: #7588A8; color: #FFFFFF;">
                Baixar fotos
              </button>

              <button
                *ngIf="canShareImages"
                type="button"
                (click)="shareImages()"
                class="px-4 py-3 rounded-xl font-semibold transition-colors"
                style="background-color: #E6EBEF; color: #23292A; border: 1px solid #D7DDE3;">
                Compartilhar fotos
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="rounded-xl p-4" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #6B7785;">Título</div>
                  <div class="text-sm font-semibold" style="color: #23292A;">{{ product.name }}</div>
                </div>
                <button type="button" (click)="copyField(product.name, 'Título copiado.')" class="px-3 py-2 rounded-lg text-sm font-semibold" style="background-color: #E6EBEF; color: #23292A;">
                  Copiar
                </button>
              </div>
            </div>

            <div class="rounded-xl p-4" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #6B7785;">Preço</div>
                  <div class="text-sm font-semibold" style="color: #23292A;">{{ marketplacePrice }}</div>
                </div>
                <button type="button" (click)="copyField(marketplacePrice, 'Preço copiado.')" class="px-3 py-2 rounded-lg text-sm font-semibold" style="background-color: #E6EBEF; color: #23292A;">
                  Copiar
                </button>
              </div>
            </div>

            <div class="rounded-xl p-4" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #6B7785;">Categoria sugerida</div>
                  <div class="text-sm font-semibold" style="color: #23292A;">{{ suggestedMarketplaceCategory }}</div>
                </div>
                <button type="button" (click)="copyField(suggestedMarketplaceCategory, 'Categoria sugerida copiada.')" class="px-3 py-2 rounded-lg text-sm font-semibold" style="background-color: #E6EBEF; color: #23292A;">
                  Copiar
                </button>
              </div>
            </div>

            <div class="rounded-xl p-4" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #6B7785;">Condição</div>
                  <div class="text-sm font-semibold" style="color: #23292A;">{{ marketplaceCondition }}</div>
                </div>
                <button type="button" (click)="copyField(marketplaceCondition, 'Condição copiada.')" class="px-3 py-2 rounded-lg text-sm font-semibold" style="background-color: #E6EBEF; color: #23292A;">
                  Copiar
                </button>
              </div>
            </div>

            <div class="rounded-xl p-4" style="background-color: #FFFFFF; border: 1px solid #D7DDE3;">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #6B7785;">Descrição</div>
                  <div class="text-sm leading-relaxed whitespace-pre-line" style="color: #23292A;">{{ marketplaceDescription }}</div>
                </div>
                <button type="button" (click)="copyField(marketplaceDescription, 'Descrição copiada.')" class="px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0" style="background-color: #E6EBEF; color: #23292A;">
                  Copiar
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                (click)="copyFullListing()"
                class="px-4 py-3 rounded-xl font-semibold transition-colors"
                style="background-color: #E6EBEF; color: #23292A; border: 1px solid #D7DDE3;">
                Copiar anúncio completo
              </button>

              <button
                type="button"
                (click)="openMarketplace()"
                class="px-4 py-3 rounded-xl font-semibold transition-colors"
                style="background-color: #7588A8; color: #FFFFFF;">
                Abrir Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-modal>
  `
})
export class MarketplacePublishModalComponent {
  @Input() isOpen = false;
  @Input() product?: Product;
  @Input() copiedFullText = false;
  @Output() closeModal = new EventEmitter<void>();

  statusMessage = '';
  statusTone: StatusTone = 'info';

  get canShareImages(): boolean {
    return typeof globalThis.navigator?.share === 'function' && !!this.product?.images?.length;
  }

  get marketplacePrice(): string {
    if (!this.product) return '';
    return (this.product.price / 100).toFixed(2).replace('.', ',');
  }

  get marketplaceCondition(): string {
    return this.product?.condition === 'novo' ? 'Novo' : 'Usado - em bom estado';
  }

  get suggestedMarketplaceCategory(): string {
    const text = `${this.product?.category ?? ''} ${this.product?.name ?? ''}`.toLowerCase();

    if (/(geladeira|fog[aã]o|micro-ondas|lavadora|m[aá]quina|freezer|air fryer|eletro)/.test(text)) {
      return 'Eletrodomésticos';
    }

    if (/(sof[aá]|mesa|cadeira|rack|guarda-roupa|arm[aá]rio|cama|colch[aã]o|m[oó]vel)/.test(text)) {
      return 'Móveis';
    }

    if (/(espelho|tapete|cortina|decora[cç][aã]o)/.test(text)) {
      return 'Casa e decoração';
    }

    return 'Casa e jardim';
  }

  get marketplaceDescription(): string {
    if (!this.product) return '';

    const details = [
      this.product.category && `Categoria: ${this.product.category}`,
      `Condição: ${this.marketplaceCondition}`,
      this.product.material && `Material: ${this.product.material}`,
      this.product.color && `Cor: ${this.product.color}`,
      this.product.brand && `Marca: ${this.product.brand}`,
      this.product.warranty && `Garantia: ${this.product.warranty}`,
      `Estoque: ${this.product.stock}`
    ].filter(Boolean);

    return [this.product.description, details.join(' | ')].filter(Boolean).join('\n\n');
  }

  close(): void {
    this.closeModal.emit();
  }

  async copyField(value: string, successMessage: string): Promise<void> {
    const copied = await this.copyText(value);
    this.setStatus(copied ? 'success' : 'error', copied ? successMessage : 'Não consegui copiar para a área de transferência neste navegador.');
  }

  async copyFullListing(): Promise<void> {
    if (!this.product) {
      return;
    }

    const fullText = [
      `${this.product.name} - R$ ${this.marketplacePrice}`,
      this.marketplaceDescription
    ].join('\n\n');

    const copied = await this.copyText(fullText);
    this.setStatus(copied ? 'success' : 'error', copied ? 'Anúncio completo copiado.' : 'Não consegui copiar o anúncio completo.');
  }

  async downloadImages(): Promise<void> {
    if (!this.product?.images?.length) {
      this.setStatus('info', 'Este produto não tem fotos para baixar.');
      return;
    }

    let successCount = 0;

    for (let index = 0; index < this.product.images.length; index++) {
      const imageUrl = this.product.images[index];

      try {
        await this.downloadSingleImage(imageUrl, index + 1);
        successCount += 1;
      } catch (error) {
        console.error('[MarketplacePublishModal] Erro ao baixar imagem:', error);
      }
    }

    if (successCount > 0) {
      this.setStatus('success', `${successCount} foto(s) enviada(s) para download.`);
      return;
    }

    this.setStatus('error', 'Não consegui baixar as fotos automaticamente.');
  }

  async shareImages(): Promise<void> {
    if (!this.product?.images?.length || typeof globalThis.navigator?.share !== 'function') {
      this.setStatus('info', 'Compartilhamento de fotos não está disponível neste dispositivo.');
      return;
    }

    try {
      const files = await Promise.all(
        this.product.images.map((imageUrl, index) => this.imageUrlToFile(imageUrl, index + 1))
      );

      if (typeof globalThis.navigator.canShare === 'function' && !globalThis.navigator.canShare({ files })) {
        this.setStatus('info', 'Este dispositivo não aceita compartilhar estas fotos diretamente.');
        return;
      }

      await globalThis.navigator.share({
        title: this.product.name,
        text: `${this.product.name} - R$ ${this.marketplacePrice}`,
        files
      });

      this.setStatus('success', 'Compartilhamento iniciado.');
    } catch (error) {
      const errorName = error instanceof Error ? error.name : '';

      if (errorName === 'AbortError') {
        this.setStatus('info', 'Compartilhamento cancelado.');
        return;
      }

      console.error('[MarketplacePublishModal] Erro ao compartilhar imagens:', error);
      this.setStatus('error', 'Não consegui compartilhar as fotos.');
    }
  }

  openMarketplace(): void {
    globalThis.open('https://www.facebook.com/marketplace/create/item', '_blank', 'noopener,noreferrer');
  }

  getStatusStyle(): string {
    switch (this.statusTone) {
      case 'success':
        return 'background-color: #ECF7EF; border: 1px solid #B7DEC1; color: #2D6A3F;';
      case 'error':
        return 'background-color: #FDEDED; border: 1px solid #F5C2C7; color: #A33A3A;';
      default:
        return 'background-color: #EEF2F5; border: 1px solid #D7DDE3; color: #44515C;';
    }
  }

  private async copyText(value: string): Promise<boolean> {
    if (!value || !globalThis.navigator?.clipboard?.writeText) {
      return false;
    }

    try {
      await globalThis.navigator.clipboard.writeText(value);
      return true;
    } catch (error) {
      console.error('[MarketplacePublishModal] Erro ao copiar texto:', error);
      return false;
    }
  }

  private setStatus(tone: StatusTone, message: string): void {
    this.statusTone = tone;
    this.statusMessage = message;
  }

  private async downloadSingleImage(imageUrl: string, index: number): Promise<void> {
    const href = await this.getDownloadUrl(imageUrl);
    const link = globalThis.document.createElement('a');
    link.href = href;
    link.download = `${this.slugify(this.product?.name || 'produto')}-${index}.jpg`;
    link.rel = 'noopener';
    globalThis.document.body.appendChild(link);
    link.click();
    link.remove();

    if (href.startsWith('blob:')) {
      globalThis.setTimeout(() => URL.revokeObjectURL(href), 1500);
    }
  }

  private async imageUrlToFile(imageUrl: string, index: number): Promise<File> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], `${this.slugify(this.product?.name || 'produto')}-${index}.jpg`, { type: blob.type || 'image/jpeg' });
  }

  private async getDownloadUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto';
  }
}
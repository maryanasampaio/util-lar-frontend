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
        <div class="rounded-xl p-4 bg-canvas border border-line flex gap-3">
          <svg class="w-5 h-5 shrink-0 text-brand-600 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <p class="text-sm leading-relaxed text-ink">
              O Facebook não permite que outro site preencha os campos do Marketplace automaticamente. Este painel deixa tudo pronto para copiar e colar.
            </p>
            <p *ngIf="copiedFullText" class="text-xs mt-1.5 font-semibold text-success-700">
              O texto completo do anúncio já foi copiado quando o produto foi criado.
            </p>
          </div>
        </div>

        <div *ngIf="statusMessage" class="rounded-xl px-4 py-3 text-sm font-semibold border" [ngClass]="statusClass">
          {{ statusMessage }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          <!-- Fotos -->
          <div class="space-y-4">
            <p class="section-kicker">Fotos</p>
            <div *ngIf="product.images?.length" class="grid grid-cols-2 gap-3">
              <div *ngFor="let image of product.images; let i = index" class="rounded-xl overflow-hidden border border-line bg-white">
                <div class="aspect-square flex items-center justify-center p-2 bg-canvas">
                  <img [src]="image" [alt]="product.name + ' ' + (i + 1)" class="max-w-full max-h-full w-auto h-auto object-contain">
                </div>
                <div class="px-3 py-2 text-xs font-semibold text-muted">Foto {{ i + 1 }}</div>
              </div>
            </div>

            <div *ngIf="!product.images?.length" class="rounded-xl p-6 text-sm text-center text-muted bg-canvas border border-dashed border-line-strong">
              Este produto não tem fotos para enviar ao Marketplace.
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" (click)="downloadImages()" class="btn-primary h-11 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Baixar fotos
              </button>
              <button *ngIf="canShareImages" type="button" (click)="shareImages()" class="btn-secondary h-11 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                Compartilhar fotos
              </button>
            </div>
          </div>

          <!-- Campos do anúncio -->
          <div class="space-y-3">
            <p class="section-kicker">Campos do anúncio</p>

            <div class="rounded-xl border border-line divide-y divide-line bg-white">
              <div class="flex items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  <p class="label mb-0.5">Título</p>
                  <p class="text-sm font-semibold text-ink">{{ product.name }}</p>
                </div>
                <button type="button" (click)="copyField(product.name, 'Título copiado.')" class="btn-soft h-9 px-3 text-xs shrink-0">Copiar</button>
              </div>

              <div class="flex items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  <p class="label mb-0.5">Preço</p>
                  <p class="text-sm font-semibold text-ink">R$ {{ marketplacePrice }}</p>
                </div>
                <button type="button" (click)="copyField(marketplacePrice, 'Preço copiado.')" class="btn-soft h-9 px-3 text-xs shrink-0">Copiar</button>
              </div>

              <div class="flex items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  <p class="label mb-0.5">Categoria sugerida</p>
                  <p class="text-sm font-semibold text-ink">{{ suggestedMarketplaceCategory }}</p>
                </div>
                <button type="button" (click)="copyField(suggestedMarketplaceCategory, 'Categoria sugerida copiada.')" class="btn-soft h-9 px-3 text-xs shrink-0">Copiar</button>
              </div>

              <div class="flex items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  <p class="label mb-0.5">Condição</p>
                  <p class="text-sm font-semibold text-ink">{{ marketplaceCondition }}</p>
                </div>
                <button type="button" (click)="copyField(marketplaceCondition, 'Condição copiada.')" class="btn-soft h-9 px-3 text-xs shrink-0">Copiar</button>
              </div>

              <div class="flex items-start justify-between gap-3 p-4">
                <div class="min-w-0">
                  <p class="label mb-0.5">Descrição</p>
                  <p class="text-sm leading-relaxed whitespace-pre-line text-ink">{{ marketplaceDescription }}</p>
                </div>
                <button type="button" (click)="copyField(marketplaceDescription, 'Descrição copiada.')" class="btn-soft h-9 px-3 text-xs shrink-0">Copiar</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button type="button" (click)="copyFullListing()" class="btn-secondary h-11 text-sm">Copiar anúncio completo</button>
              <button type="button" (click)="openMarketplace()" class="btn-accent h-11 text-sm">
                Abrir Marketplace
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
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

  get statusClass(): string {
    switch (this.statusTone) {
      case 'success':
        return 'bg-success-50 border-success-100 text-success-700';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-700';
      default:
        return 'bg-canvas border-line text-muted';
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
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { STORE_WHATSAPP_URL } from '../store-header/store-header.component';

/**
 * Rodapé da loja — contato, categorias e informações institucionais.
 */
@Component({
  selector: 'app-store-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-brand-900 text-brand-200 mt-16">
      <div class="container-store py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Marca -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2.5 mb-4">
            <img src="logo-branca.png" alt="Util Lar" class="h-10 w-10 object-contain">
            <span class="font-display text-xl font-extrabold text-white tracking-tight">Util Lar</span>
          </div>
          <p class="text-sm leading-relaxed text-brand-300">
            Móveis e eletrodomésticos novos e seminovos, selecionados com cuidado para transformar sua casa em um lar acolhedor — com os melhores preços de Alagoas.
          </p>
        </div>

        <!-- Categorias -->
        <div>
          <h4 class="footer-title">Categorias</h4>
          <ul class="space-y-2">
            <li><button (click)="catalog.setCategory('Todas')" routerLink="/dashboard" class="footer-link">Todos os produtos</button></li>
            <li *ngFor="let cat of (catalog.categories$ | async) | slice:0:6">
              <button (click)="catalog.setCategory(cat)" routerLink="/dashboard" class="footer-link capitalize">{{ cat }}</button>
            </li>
          </ul>
        </div>

        <!-- Atendimento -->
        <div>
          <h4 class="footer-title">Atendimento</h4>
          <ul class="space-y-3 text-sm">
            <li>
              <a [href]="whatsappUrl" target="_blank" rel="noopener noreferrer" class="footer-link flex items-center gap-2">
                <svg class="w-4 h-4 text-whatsapp" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                (82) 99657-2843
              </a>
            </li>
            <li class="flex items-center gap-2 text-brand-300">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Alagoas
            </li>
            <li><a routerLink="/favoritos" class="footer-link">Meus favoritos</a></li>
            <li><a routerLink="/configuracoes" class="footer-link">Receber novidades</a></li>
          </ul>
        </div>

        <!-- Vantagens -->
        <div>
          <h4 class="footer-title">Por que comprar aqui</h4>
          <ul class="space-y-3 text-sm text-brand-300">
            <li class="flex gap-2.5"><span class="footer-dot"></span>Produtos novos e seminovos revisados</li>
            <li class="flex gap-2.5"><span class="footer-dot"></span>Parcelamento em até 12x no cartão</li>
            <li class="flex gap-2.5"><span class="footer-dot"></span>Entrega rápida na região</li>
            <li class="flex gap-2.5"><span class="footer-dot"></span>Atendimento direto pelo WhatsApp</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10">
        <div class="container-store py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-300">
          <p>© {{ year }} Util Lar — Todos os direitos reservados.</p>
          <p>Móveis &amp; Eletrodomésticos · Alagoas</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-title { font-family: var(--font-display); font-weight: 800; color: #fff; font-size: .8125rem; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1rem; }
    .footer-link { font-size: .875rem; color: var(--color-brand-300); transition: color .2s; text-align: left; }
    .footer-link:hover { color: #fff; }
    .footer-dot { display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: var(--color-accent-500); margin-top: 7px; flex-shrink: 0; }
  `]
})
export class StoreFooterComponent {
  readonly catalog = inject(CatalogService);
  readonly whatsappUrl = STORE_WHATSAPP_URL;
  readonly year = new Date().getFullYear();
}

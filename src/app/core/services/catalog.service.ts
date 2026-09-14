import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { ProductService } from '../../features/products/services/product.service';

/**
 * Estado compartilhado do catálogo entre header, footer e a página de produtos.
 *
 * - `categories$`: categorias derivadas do cache de produtos (sem requisição extra)
 * - `search$` / `category$`: comandos vindos do header que a página de produtos aplica
 * - `loginRequested$`: pedido de abrir o modal de login admin (duplo clique na logo)
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly productService = inject(ProductService);

  private readonly searchSubject = new BehaviorSubject<string>('');
  private readonly categorySubject = new BehaviorSubject<string>('Todas');
  private readonly loginRequestedSubject = new Subject<void>();

  readonly search$: Observable<string> = this.searchSubject.asObservable();
  readonly category$: Observable<string> = this.categorySubject.asObservable();
  readonly loginRequested$: Observable<void> = this.loginRequestedSubject.asObservable();

  readonly categories$: Observable<string[]> = this.productService.getProdutosCache$().pipe(
    map(produtos => {
      const seen = new Set<string>();
      return produtos
        .map(p => p.category?.trim())
        .filter((c): c is string => !!c)
        .filter(c => (seen.has(c) ? false : (seen.add(c), true)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    })
  );

  get search(): string {
    return this.searchSubject.value;
  }

  get category(): string {
    return this.categorySubject.value;
  }

  setSearch(query: string): void {
    if (query !== this.searchSubject.value) {
      this.searchSubject.next(query);
    }
  }

  setCategory(category: string): void {
    if (category !== this.categorySubject.value) {
      this.categorySubject.next(category);
    }
  }

  requestAdminLogin(): void {
    this.loginRequestedSubject.next();
  }
}

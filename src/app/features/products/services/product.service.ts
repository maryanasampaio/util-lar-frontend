import { Observable, BehaviorSubject, of } from "rxjs";
import { tap, shareReplay } from "rxjs/operators";
import { ProductResponse, Product, ProductFormData } from "../models/product.model";
import { Injectable } from '@angular/core';
import { ProductsRepository } from '../repository/product.repository';

/**
 * Serviço principal de produtos com sistema de cache
 * Usa ProductsRepository para comunicação com backend real
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Cache de produtos
  private readonly produtosCache$ = new BehaviorSubject<ProductResponse[] | null>(null);
  private isLoaded = false;
  private loadingRequest$: Observable<ProductResponse[]> | null = null;

  constructor(private readonly repository: ProductsRepository) {}

  /**
   * Busca produtos com cache
   * - Se já carregado, retorna do cache
   * - Se não carregado, busca do backend
   * - Evita requisições duplicadas simultâneas
   */
  buscarProdutos(forceReload = false): Observable<ProductResponse[]> {
    // Se forçar reload, limpa o cache
    if (forceReload) {
      this.invalidateCache();
    }

    // Se já tem dados em cache, retorna
    const cachedData = this.produtosCache$.value;
    if (this.isLoaded && cachedData && !forceReload) {
      return of(cachedData);
    }

    // Se já tem uma requisição em andamento, retorna ela
    if (this.loadingRequest$) {
      return this.loadingRequest$;
    }

    // Faz a requisição e armazena em cache
    this.loadingRequest$ = this.repository.buscarProdutos().pipe(
      tap(produtos => {
        this.produtosCache$.next(produtos);
        this.isLoaded = true;
        this.loadingRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.loadingRequest$;
  }

  /**
   * Busca produto por ID
   * Tenta buscar do cache local primeiro, depois do backend se não encontrar
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    // Tenta buscar do cache primeiro
    const cachedData = this.produtosCache$.value;
    if (cachedData) {
      const produto = cachedData.find(p => p.id === id);
      if (produto) {
        return of(produto);
      }
    }

    // Se não encontrou no cache, busca do backend
    return this.repository.buscarProdutoPorId(id);
  }

  /**
   * Cria produto e invalida cache
   */
  criarProduto(data: ProductFormData): Observable<Product> {
    return this.repository.criarProduto(data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Atualiza produto e invalida cache
   */
  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    return this.repository.atualizarProduto(id, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Remove produto e invalida cache
   */
  removerProduto(id: number): Observable<void> {
    return this.repository.removerProduto(id).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Marca como vendido e invalida cache
   */
  marcarComoVendido(id: number): Observable<Product> {
    return this.repository.marcarComoVendido(id).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Reativa produto e invalida cache
   */
  reativarProduto(id: number, stock?: number): Observable<Product> {
    return this.repository.reativarProduto(id, stock).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Invalida o cache e força próximo carregamento
   */
  invalidateCache(): void {
    this.isLoaded = false;
    this.produtosCache$.next(null);
  }

  /**
   * Retorna observable do cache (para componentes que querem observar mudanças)
   */
  getProdutosCache$(): Observable<ProductResponse[] | null> {
    return this.produtosCache$.asObservable();
  }
}
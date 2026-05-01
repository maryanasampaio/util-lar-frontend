import { Observable, BehaviorSubject, of } from "rxjs";
import { tap, shareReplay, map, switchMap } from "rxjs/operators";
import { ProductResponse, Product, ProductFormData } from "../models/product.model";
import { Injectable } from '@angular/core';
import { ProductsRepository } from '../repository/product.repository';

/**
 * Serviço principal de produtos com sistema de cache e paginação
 * Usa ProductsRepository para comunicação com backend real
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Cache de produtos por página
  private readonly produtosCache$ = new BehaviorSubject<ProductResponse[]>([]);
  private currentPage = 0;
  private readonly pageSize = 24;
  private hasMorePages = true;
  private isLoadingPage = false;
  private loadingRequest$: Observable<ProductResponse[]> | null = null;

  constructor(private readonly repository: ProductsRepository) {}

  /**
   * Busca primeira página de produtos ou reseta o cache
   * @param forceReload - Se true, limpa cache e recarrega desde a primeira página
   */
  buscarProdutos(forceReload = false): Observable<ProductResponse[]> {
    // Se forçar reload, limpa o cache e reseta para página 0
    if (forceReload) {
      this.invalidateCache();
    }

    // Se já tem dados em cache e não forçou reload, retorna
    const cachedData = this.produtosCache$.value;
    if (cachedData.length > 0 && !forceReload) {
      return of(cachedData);
    }

    // Se já tem uma requisição em andamento, retorna ela
    if (this.loadingRequest$) {
      return this.loadingRequest$;
    }

    // Faz a requisição da primeira página
    this.isLoadingPage = true;
    this.loadingRequest$ = this.repository.buscarProdutos(0, this.pageSize).pipe(
      tap(produtos => {
        this.produtosCache$.next(produtos);
        this.currentPage = 0;
        this.hasMorePages = produtos.length === this.pageSize;
        this.isLoadingPage = false;
        this.loadingRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.loadingRequest$;
  }

  /**
   * Carrega a próxima página de produtos e adiciona ao cache
   * @returns Observable com TODOS os produtos (cache + nova página)
   */
  carregarProximaPagina(): Observable<ProductResponse[]> {
    // Se não há mais páginas ou já está carregando, retorna cache atual
    if (!this.hasMorePages || this.isLoadingPage) {
      return of(this.produtosCache$.value);
    }

    const nextPage = this.currentPage + 1;
    this.isLoadingPage = true;

    return this.repository.buscarProdutos(nextPage, this.pageSize).pipe(
      map(novosProdutos => {
        // Adiciona novos produtos ao cache existente
        const todosOsProdutos = [...this.produtosCache$.value, ...novosProdutos];
        this.produtosCache$.next(todosOsProdutos);
        this.currentPage = nextPage;
        this.hasMorePages = novosProdutos.length === this.pageSize;
        this.isLoadingPage = false;
        
        return todosOsProdutos;
      })
    );
  }

  /**
   * Verifica se há mais páginas para carregar
   */
  temMaisPaginas(): boolean {
    return this.hasMorePages;
  }

  /**
   * Verifica se está carregando uma página
   */
  estaCarregando(): boolean {
    return this.isLoadingPage;
  }

  /**
   * Busca TODOS os produtos carregando todas as páginas
   * Use apenas quando realmente precisar de todos os produtos (ex: favoritos)
   * ATENÇÃO: Pode ser lento se houver muitos produtos
   */
  buscarTodosProdutos(): Observable<ProductResponse[]> {
    const carregarTodasPaginas = (page: number, acumulados: ProductResponse[]): Observable<ProductResponse[]> => {
      return this.repository.buscarProdutos(page, this.pageSize).pipe(
        switchMap(produtos => {
          const todosOsProdutos = [...acumulados, ...produtos];
          
          // Se retornou menos que o tamanho da página, acabou
          if (produtos.length < this.pageSize) {
            return of(todosOsProdutos);
          }
          
          // Senão, carrega próxima página
          return carregarTodasPaginas(page + 1, todosOsProdutos);
        })
      );
    };

    return carregarTodasPaginas(0, []);
  }

  /**
   * Busca produto por ID
   * Tenta buscar do cache local primeiro, depois do backend se não encontrar
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    // Tenta buscar do cache primeiro
    const cachedData = this.produtosCache$.value;
    if (cachedData.length > 0) {
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
    this.currentPage = 0;
    this.hasMorePages = true;
    this.isLoadingPage = false;
    this.produtosCache$.next([]);
  }

  /**
   * Retorna observable do cache (para componentes que querem observar mudanças)
   */
  getProdutosCache$(): Observable<ProductResponse[]> {
    return this.produtosCache$.asObservable();
  }
}
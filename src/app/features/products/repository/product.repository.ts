import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { Product, ProductResponse, ProductFormData } from "../models/product.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Repository para comunicação com API de produtos
 * Base: http://localhost:8080
 * Rotas públicas (sem token): GET /produtos, GET /produtos/:id
 * Rotas privadas (com token): POST, PUT, DELETE, POST /sold
 */
@Injectable({ providedIn: 'root' })
export class ProductsRepository {

  private readonly apiUrl = environment.apiUrl; // http://localhost:8080

  constructor(private readonly http: HttpClient) {}

  /**
   * Buscar todos os produtos (PÚBLICO - sem token)
   * GET /produtos
   */
  buscarProdutos(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.apiUrl}/produtos`).pipe(
      map(produtos => produtos.map(produto => this.normalizeProductImages(produto)))
    );
  }

  /**
   * Buscar produto por ID (PÚBLICO - sem token)
   * GET /produtos/:id
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/produtos/${id}`).pipe(
      map(produto => this.normalizeProductImages(produto))
    );
  }

  /**
   * Criar novo produto (PRIVADO - requer token admin)
   * POST /produtos
   */
  criarProduto(data: ProductFormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos`, data);
  }

  /**
   * Atualizar produto existente (PRIVADO - requer token admin)
   * PUT /produtos/:id
   */
  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/produtos/${id}`, data);
  }

  /**
   * Deletar produto (PRIVADO - requer token admin)
   * DELETE /produtos/:id
   */
  removerProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produtos/${id}`);
  }

  /**
   * Marcar produto como vendido (PRIVADO - requer token admin)
   * POST /produtos/:id/sold
   * Define: disponivel = 0, stock = 0
   */
  marcarComoVendido(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos/${id}/sold`, {});
  }

  /**
   * Reativar produto (tornar disponível novamente) (PRIVADO - requer token admin)
   * POST /produtos/:id/available
   * Define: disponivel = 1, soldDate = null
   * @param id - ID do produto
   * @param stock - Estoque opcional (padrão: 1 ou mantém >0 existente)
   */
  reativarProduto(id: number, stock?: number): Observable<Product> {
    const body = stock !== undefined ? { stock } : {};
    return this.http.post<Product>(`${this.apiUrl}/produtos/${id}/available`, body);
  }

  /**
   * Normaliza as imagens do produto
   * Se images vier como string JSON, parseia para array
   * Se vier null ou vazio, retorna null
   */
  private normalizeProductImages(produto: ProductResponse): ProductResponse {
    if (!produto.images) {
      return { ...produto, images: null };
    }

    // Se images for string (JSON), tentar parsear
    if (typeof produto.images === 'string') {
      try {
        const parsed = JSON.parse(produto.images as any);
        return { ...produto, images: Array.isArray(parsed) ? parsed : null };
      } catch {
        return { ...produto, images: null };
      }
    }

    // Se já for array, retornar como está
    if (Array.isArray(produto.images)) {
      return produto;
    }

    // Caso não seja nem string nem array, retornar null
    return { ...produto, images: null };
  }
}
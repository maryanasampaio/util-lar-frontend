import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

/**
 * Estratégia customizada de reuso de rotas do Angular
 * 
 * Mantém componentes específicos em cache para evitar recarregamentos
 * desnecessários ao navegar entre páginas.
 * 
 * Rotas cacheadas:
 * - /dashboard (produtos)
 * - /favoritos
 * - /dashboard/produto/:id (detalhes)
 */
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<string, DetachedRouteHandle>();

  /**
   * Define quais rotas devem ser mantidas em cache
   */
  private shouldCacheRoute(route: ActivatedRouteSnapshot): boolean {
    // Cache apenas rotas específicas que são acessadas frequentemente
    const path = route.routeConfig?.path || '';
    
    // Rotas a serem cacheadas
    const cacheableRoutes = [
      'dashboard',           // Página principal de produtos
      'favoritos',          // Página de favoritos
      'produto/:id',        // Detalhes do produto
      'simulacao/:id'       // Simulações
    ];

    return cacheableRoutes.some(cached => 
      path === cached || path.startsWith(cached.replace(':id', ''))
    );
  }

  /**
   * Gera chave única para cada rota
   */
  private getRouteKey(route: ActivatedRouteSnapshot): string {
    let key = route.routeConfig?.path || '';
    
    // Para rotas com parâmetros, incluir o ID na chave
    if (route.params['id']) {
      key += `_${route.params['id']}`;
    }
    
    return key;
  }

  /**
   * Determina se a rota deve ser destacada quando saímos dela
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.shouldCacheRoute(route);
  }

  /**
   * Armazena o componente destacado
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (handle && this.shouldCacheRoute(route)) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
      
      // Limita o cache para evitar uso excessivo de memória
      // Mantém apenas as últimas 10 rotas
      if (this.handlers.size > 10) {
        const firstKey = this.handlers.keys().next().value;
        this.handlers.delete(firstKey);
      }
    }
  }

  /**
   * Determina se devemos anexar uma rota cacheada
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getRouteKey(route);
    return this.handlers.has(key) && this.shouldCacheRoute(route);
  }

  /**
   * Recupera o componente cacheado
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!this.shouldCacheRoute(route)) {
      return null;
    }
    
    const key = this.getRouteKey(route);
    return this.handlers.get(key) || null;
  }

  /**
   * Determina se a rota deve ser reutilizada
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Reusa se for a mesma rota e mesmos parâmetros
    return future.routeConfig === curr.routeConfig &&
           JSON.stringify(future.params) === JSON.stringify(curr.params);
  }

  /**
   * Limpa o cache (útil para logout ou mudanças importantes)
   */
  clearCache(): void {
    this.handlers.clear();
  }
}

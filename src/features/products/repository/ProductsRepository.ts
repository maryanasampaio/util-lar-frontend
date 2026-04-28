import { Product, Sale } from '../model/Product'
import { initialProducts, initialSales } from '../model/ProductsData'

const STORAGE_KEY_PRODUCTS = 'utillar:products'
const STORAGE_KEY_SALES = 'utillar:sales'

/**
 * Revive Date objects from JSON
 */
function reviveDates<T extends { createdAt?: Date | string; date?: Date | string }>(arr: T[]): T[] {
  return arr.map(item => ({
    ...item,
    ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
    ...(item.date ? { date: new Date(item.date) } : {}),
  })) as T[]
}

/**
 * Repository layer for Products data persistence
 */
export class ProductsRepository {
  /**
   * Load products from localStorage or return initial seed data
   */
  static getProducts(): Product[] {
    if (typeof window === 'undefined') return initialProducts
    
    const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (!stored) return initialProducts

    try {
      return reviveDates(JSON.parse(stored))
    } catch {
      return initialProducts
    }
  }

  /**
   * Save products to localStorage
   */
  static saveProducts(products: Product[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products))
  }

  /**
   * Load sales from localStorage or return initial seed data
   */
  static getSales(): Sale[] {
    if (typeof window === 'undefined') return initialSales

    const stored = localStorage.getItem(STORAGE_KEY_SALES)
    if (!stored) return initialSales

    try {
      return reviveDates(JSON.parse(stored))
    } catch {
      return initialSales
    }
  }

  /**
   * Save sales to localStorage
   */
  static saveSales(sales: Sale[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales))
  }

  /**
   * Clear all data from localStorage
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY_PRODUCTS)
    localStorage.removeItem(STORAGE_KEY_SALES)
  }
}

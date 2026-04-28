const STORAGE_KEY = 'utillar:favorites'

/**
 * Repository layer for Favorites data persistence
 */
export class FavoritesRepository {
  /**
   * Load favorites from localStorage
   */
  static getFavorites(): string[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  /**
   * Save favorites to localStorage
   */
  static saveFavorites(favorites: string[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }

  /**
   * Clear all favorites
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}

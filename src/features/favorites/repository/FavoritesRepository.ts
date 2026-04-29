const STORAGE_KEY = 'utillar:favorites'

/**
 * Repository layer for Favorites data persistence
 */
export class FavoritesRepository {
  /**
   * Load favorites from localStorage
   */
  static getFavorites(): number[] {
    if (globalThis.window === undefined) return []
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    try {
      return JSON.parse(stored)
        .map(Number)
        .filter((value: number) => Number.isFinite(value))
    } catch {
      return []
    }
  }

  /**
   * Save favorites to localStorage
   */
  static saveFavorites(favorites: number[]): void {
    if (globalThis.window === undefined) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }

  /**
   * Clear all favorites
   */
  static clearAll(): void {
    if (globalThis.window === undefined) return
    localStorage.removeItem(STORAGE_KEY)
  }
}

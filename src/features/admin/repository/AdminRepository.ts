const STORAGE_KEY = 'utillar:admin'
export const ADMIN_PASSWORD = '123456'

/**
 * Repository layer for Admin authentication
 */
export class AdminRepository {
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  }

  /**
   * Validate password and store auth state
   */
  static login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, '1')
      }
      return true
    }
    return false
  }

  /**
   * Clear authentication state
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }
}

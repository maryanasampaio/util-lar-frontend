const STORAGE_KEY = 'utillar:admin'
const API_TOKEN_STORAGE_KEY = 'utillar:admin-api-token'
export const ADMIN_PASSWORD = '123456'

/**
 * Repository layer for Admin authentication
 */
export class AdminRepository {
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (globalThis.window === undefined) return false
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  }

  /**
   * Validate password and store auth state
   */
  static login(password: string, apiToken?: string): boolean {
    if (password === ADMIN_PASSWORD) {
      if (globalThis.window !== undefined) {
        sessionStorage.setItem(STORAGE_KEY, '1')
        if (apiToken?.trim()) {
          sessionStorage.setItem(API_TOKEN_STORAGE_KEY, apiToken.trim())
        }
      }
      return true
    }
    return false
  }

  /**
   * Read bearer token used by protected backend endpoints
   */
  static getApiToken(): string | null {
    const envToken = import.meta.env.VITE_PRODUCTS_API_TOKEN?.trim()
    if (envToken) {
      return envToken
    }

    if (globalThis.window === undefined) return null
    return sessionStorage.getItem(API_TOKEN_STORAGE_KEY)
  }

  /**
   * Clear authentication state
   */
  static logout(): void {
    if (globalThis.window !== undefined) {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(API_TOKEN_STORAGE_KEY)
    }
  }
}

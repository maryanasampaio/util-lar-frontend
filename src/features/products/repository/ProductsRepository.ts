import { AdminRepository } from '@features/admin/repository/AdminRepository'
import { Product, ProductCondition, ProductFormValues, ProductDimensions, Sale } from '../model/Product'

const STORAGE_KEY_SALES = 'utillar:sales'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.nextagecode.com/util-lar').replace(/\/$/, '')
const PRODUCTS_API_PREFIX = (import.meta.env.VITE_PRODUCTS_API_PREFIX ?? '/produtos').replace(/\/$/, '')

interface BackendProduct {
  id: number
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number | null
  costPrice: number | null
  condition: ProductCondition
  category: string
  images: string[] | null
  stock: number
  dimensions: ProductDimensions | null
  material: string | null
  color: string | null
  brand: string | null
  warranty: string | null
  featured: boolean
  soldDate: string | null
  disponivel: number
  createdAt: string | null
  updatedAt: string | null
}

type ProductMutation = Partial<ProductFormValues>

interface ApiErrorPayload {
  error?: string
  message?: string | string[]
  statusCode?: number
  errors?: Array<{ field?: string; message?: string }>
}

function centsToCurrency(value?: number | null): number | null {
  if (value === null || value === undefined) return null
  return value / 100
}

function currencyToCents(value?: number | null): number | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  return Math.round(value * 100)
}

function formatDimensions(dimensions?: ProductDimensions | null): string | null {
  if (!dimensions) return null

  const values = [dimensions.width, dimensions.height, dimensions.depth].filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  )

  if (values.length === 0) return dimensions.unit ?? null

  const unit = dimensions.unit ? ` ${dimensions.unit}` : ''
  return `${values.join(' x ')}${unit}`
}

function parseDimensions(dimensions?: string): ProductDimensions | null | undefined {
  if (dimensions === undefined) return undefined

  const trimmed = dimensions.trim()
  if (!trimmed) return null

  const matches = trimmed.match(/\d+(?:[.,]\d+)?/g)
  if (!matches || matches.length === 0) return null

  const [width, height, depth] = matches.map((value) => Number(value.replace(',', '.')))
  const unitMatch = /[a-zA-Z]+$/.exec(trimmed)

  return {
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    depth: Number.isFinite(depth) ? depth : null,
    unit: unitMatch?.[0]?.toLowerCase() ?? 'cm',
  }
}

function normalizeOptionalString(value?: string | null): string | undefined {
  if (value === undefined || value === null) return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function assignOptionalString(payload: Record<string, unknown>, key: string, value?: string | null): void {
  const normalized = normalizeOptionalString(value)
  if (normalized !== undefined) {
    payload[key] = normalized
  }
}

function mapProduct(product: BackendProduct): Product {
  const images = product.images ?? []

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: centsToCurrency(product.price) ?? 0,
    originalPrice: centsToCurrency(product.originalPrice),
    costPrice: centsToCurrency(product.costPrice),
    condition: product.condition,
    category: product.category,
    brand: product.brand,
    imageUrl: images[0] ?? '',
    images,
    stock: product.stock,
    sold: Boolean(product.soldDate) || product.disponivel === 0 || product.stock === 0,
    featured: product.featured,
    material: product.material,
    color: product.color,
    warranty: product.warranty,
    dimensions: formatDimensions(product.dimensions),
    soldDate: product.soldDate,
    disponivel: product.disponivel,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function buildPayload(values: ProductMutation): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (values.name !== undefined) payload.name = values.name.trim()
  if (values.description !== undefined) payload.description = values.description.trim()
  if (values.price !== undefined) payload.price = currencyToCents(values.price)
  if ('originalPrice' in values) payload.originalPrice = currencyToCents(values.originalPrice ?? null)
  if ('costPrice' in values) payload.costPrice = currencyToCents(values.costPrice ?? null)
  if (values.condition !== undefined) payload.condition = values.condition
  if (values.category !== undefined) payload.category = values.category.trim()
  
  // Combina imageUrl (capa) com images adicionais
  if ('imageUrl' in values || 'images' in values) {
    const allImages: string[] = []
    if (values.imageUrl) allImages.push(values.imageUrl.trim())
    if (values.images) {
      allImages.push(...values.images.filter(img => img.trim()).map(img => img.trim()))
    }
    payload.images = allImages.length > 0 ? allImages : []
  }
  
  if (values.stock !== undefined) payload.stock = values.stock
  if (values.dimensions !== undefined) payload.dimensions = parseDimensions(values.dimensions)
  if (values.featured !== undefined) payload.featured = values.featured

  assignOptionalString(payload, 'material', values.material)
  assignOptionalString(payload, 'color', values.color)
  assignOptionalString(payload, 'brand', values.brand)
  assignOptionalString(payload, 'warranty', values.warranty)

  return payload
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

function getErrorMessage(payload?: ApiErrorPayload): string {
  if (!payload) return 'Falha ao comunicar com o backend de produtos.'
  if (Array.isArray(payload.message)) return payload.message.join(', ')
  if (payload.errors?.length) {
    return payload.errors.map((item) => item.message).filter(Boolean).join(', ')
  }
  return payload.message ?? payload.error ?? 'Falha ao comunicar com o backend de produtos.'
}

async function request<T>(path = '', init?: RequestInit, requiresAuth = false): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')

  if (requiresAuth) {
    const token = AdminRepository.getApiToken()
    if (!token) {
      throw new Error('Configure a variável de ambiente VITE_PRODUCTS_API_TOKEN no arquivo .env para usar ações administrativas.')
    }
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${PRODUCTS_API_PREFIX}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const payload = await parseResponse<ApiErrorPayload>(response).catch(() => undefined)
    throw new Error(getErrorMessage(payload))
  }

  return parseResponse<T>(response)
}

function reviveSalesDates(arr: Sale[]): Sale[] {
  return arr.map((item) => ({
    ...item,
    date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
  }))
}

/**
 * Repository layer for Products data persistence
 */
export class ProductsRepository {
  /**
   * Load products from backend API
   */
  static async getProducts(): Promise<Product[]> {
    const products = await request<BackendProduct[]>()
    return products.map(mapProduct)
  }

  /**
   * Load a single product from backend API
   */
  static async getProductById(id: number): Promise<Product> {
    const product = await request<BackendProduct>(`/${id}`)
    return mapProduct(product)
  }

  /**
   * Create product through backend API
   */
  static async createProduct(values: ProductFormValues): Promise<Product> {
    const product = await request<BackendProduct>(
      '',
      {
        method: 'POST',
        body: JSON.stringify(buildPayload(values)),
      },
      true,
    )
    return mapProduct(product)
  }

  /**
   * Update product through backend API
   */
  static async updateProduct(id: number, values: ProductMutation): Promise<Product> {
    const product = await request<BackendProduct>(
      `/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(buildPayload(values)),
      },
      true,
    )
    return mapProduct(product)
  }

  /**
   * Delete product through backend API
   */
  static async deleteProduct(id: number): Promise<void> {
    await request(`/${id}`, { method: 'DELETE' }, true)
  }

  /**
   * Toggle sold state using dedicated backend endpoints
   */
  static async setSoldState(id: number, sold: boolean): Promise<Product> {
    const path = sold ? `/${id}/sold` : `/${id}/available`
    const body = sold ? {} : { stock: 1 }
    const product = await request<BackendProduct>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      true,
    )
    return mapProduct(product)
  }

  /**
   * Load sales from localStorage or return initial seed data
   */
  static getSales(): Sale[] {
    if (globalThis.window === undefined) return []

    const stored = localStorage.getItem(STORAGE_KEY_SALES)
    if (!stored) return []

    try {
      return reviveSalesDates(JSON.parse(stored))
    } catch {
      return []
    }
  }

  /**
   * Save sales to localStorage
   */
  static saveSales(sales: Sale[]): void {
    if (globalThis.window === undefined) return
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales))
  }

  /**
   * Clear local-only sales data
   */
  static clearAll(): void {
    if (globalThis.window === undefined) return
    localStorage.removeItem(STORAGE_KEY_SALES)
  }
}

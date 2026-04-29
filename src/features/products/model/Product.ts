export type ProductCondition = 'novo' | 'seminovo'

export interface ProductDimensions {
  width?: number | null
  height?: number | null
  depth?: number | null
  unit?: string | null
}

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  costPrice: number | null
  condition: ProductCondition
  category: string
  brand: string | null
  imageUrl: string
  images: string[]
  stock: number
  sold: boolean
  featured: boolean
  material: string | null
  color: string | null
  warranty: string | null
  dimensions: string | null
  soldDate: string | null
  disponivel: number
  createdAt: string | null
  updatedAt: string | null
}

export interface ProductFormValues {
  name: string
  description: string
  price: number
  originalPrice?: number | null
  costPrice?: number | null
  condition: ProductCondition
  category: string
  brand: string
  imageUrl: string
  images: string[]
  stock: number
  featured: boolean
  material: string
  color: string
  warranty: string
  dimensions: string
}

export interface Sale {
  id: string
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  installments?: number
  interestRate?: number
  finalPrice?: number
  date: string
}

export interface DashboardStats {
  totalRevenue: number
  totalProfit: number
  totalSales: number
  lowStockProducts: number
}

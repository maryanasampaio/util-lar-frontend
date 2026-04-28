export type ProductCondition = 'novo' | 'usado'

export type ProductCategory = 
  | 'sofas'
  | 'mesas'
  | 'armarios'
  | 'cadeiras'
  | 'racks'
  | 'eletrodomesticos'
  | 'sem-categoria'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  costPrice: number
  condition: ProductCondition
  category: ProductCategory
  brand: string
  imageUrl: string
  images?: string[]
  stock: number
  sold: boolean
  featured: boolean
  material?: string
  color?: string
  warranty?: string
  dimensions?: string
  createdAt: Date
}

export interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  installments?: number
  interestRate?: number
  finalPrice?: number
  date: Date
}

export interface DashboardStats {
  totalRevenue: number
  totalProfit: number
  totalSales: number
  lowStockProducts: number
}

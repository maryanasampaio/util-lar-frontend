import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, Sale } from '../model/Product'
import { ProductsRepository } from '../repository/ProductsRepository'

interface ProductsContextType {
  products: Product[]
  sales: Sale[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleSold: (id: string) => void
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from repository on mount
  useEffect(() => {
    setProducts(ProductsRepository.getProducts())
    setSales(ProductsRepository.getSales())
    setMounted(true)
  }, [])

  // Persist products when changed
  useEffect(() => {
    if (mounted) {
      ProductsRepository.saveProducts(products)
    }
  }, [products, mounted])

  // Persist sales when changed
  useEffect(() => {
    if (mounted) {
      ProductsRepository.saveSales(sales)
    }
  }, [sales, mounted])

  const addProduct: ProductsContextType['addProduct'] = (product) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setProducts(prev => [newProduct, ...prev])
  }

  const updateProduct: ProductsContextType['updateProduct'] = (id, patch) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }

  const deleteProduct: ProductsContextType['deleteProduct'] = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const toggleSold: ProductsContextType['toggleSold'] = (id) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, sold: !p.sold } : p)))
  }

  const addSale: ProductsContextType['addSale'] = (sale) => {
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      date: new Date(),
    }
    setSales(prev => [newSale, ...prev])
  }

  return (
    <ProductsContext.Provider
      value={{ products, sales, addProduct, updateProduct, deleteProduct, toggleSold, addSale }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}

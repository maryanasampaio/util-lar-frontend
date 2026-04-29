import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { toast } from '@shared/ui/sonner'
import { Product, ProductFormValues, Sale } from '../model/Product'
import { ProductsRepository } from '../repository/ProductsRepository'

interface ProductsContextType {
  products: Product[]
  sales: Sale[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
  addProduct: (product: ProductFormValues) => Promise<void>
  updateProduct: (id: number, patch: Partial<ProductFormValues>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  toggleSold: (id: number) => Promise<void>
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const bubbleError = (fallbackMessage: string, err: unknown) => {
    const message = err instanceof Error ? err.message : fallbackMessage
    setError(message)
    toast.error(message)
    throw err
  }

  const refreshProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const loadedProducts = await ProductsRepository.getProducts()
      setProducts(loadedProducts)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar produtos.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Load from repository on mount
  useEffect(() => {
    setSales(ProductsRepository.getSales())
    setMounted(true)
    void refreshProducts()
  }, [])

  // Persist sales when changed
  useEffect(() => {
    if (mounted) {
      ProductsRepository.saveSales(sales)
    }
  }, [sales, mounted])

  const addProduct: ProductsContextType['addProduct'] = async (product) => {
    try {
      const createdProduct = await ProductsRepository.createProduct(product)
      setProducts(prev => [createdProduct, ...prev])
      toast.success('Produto criado com sucesso.')
    } catch (err) {
      bubbleError('Falha ao criar produto.', err)
    }
  }

  const updateProduct: ProductsContextType['updateProduct'] = async (id, patch) => {
    try {
      const updatedProduct = await ProductsRepository.updateProduct(id, patch)
      setProducts(prev => prev.map((product) => (product.id === id ? updatedProduct : product)))
      toast.success('Produto atualizado com sucesso.')
    } catch (err) {
      bubbleError('Falha ao atualizar produto.', err)
    }
  }

  const deleteProduct: ProductsContextType['deleteProduct'] = async (id) => {
    try {
      await ProductsRepository.deleteProduct(id)
      setProducts(prev => prev.filter((product) => product.id !== id))
      toast.success('Produto removido com sucesso.')
    } catch (err) {
      bubbleError('Falha ao remover produto.', err)
    }
  }

  const toggleSold: ProductsContextType['toggleSold'] = async (id) => {
    const currentProduct = products.find((product) => product.id === id)
    if (!currentProduct) {
      return
    }

    try {
      const updatedProduct = await ProductsRepository.setSoldState(id, !currentProduct.sold)
      setProducts(prev => prev.map((product) => (product.id === id ? updatedProduct : product)))
      toast.success(updatedProduct.sold ? 'Produto marcado como vendido.' : 'Produto disponibilizado novamente.')
    } catch (err) {
      bubbleError('Falha ao atualizar disponibilidade do produto.', err)
    }
  }

  const addSale: ProductsContextType['addSale'] = (sale) => {
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    }
    setSales(prev => [newSale, ...prev])
  }

  const value = useMemo(
    () => ({ products, sales, loading, error, refreshProducts, addProduct, updateProduct, deleteProduct, toggleSold, addSale }),
    [products, sales, loading, error],
  )

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}

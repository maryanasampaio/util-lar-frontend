import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { useProducts } from '@features/products/viewmodel/ProductsContext'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { Header } from '@shared/components/Header'
import { HeroBanner } from '@shared/components/HeroBanner'
import { ProductCard } from '@features/products/view/components/ProductCard'
import { SidebarFilters } from '@features/products/view/components/SidebarFilters'
import { FeaturedCarousel } from '@features/products/view/components/FeaturedCarousel'
import { WhatsAppButton } from '@shared/components/WhatsAppButton'
import { ProductFormDialog } from '@features/products/view/components/ProductFormDialog'
import { Button } from '@shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Spinner } from '@shared/ui/spinner'

export function HomePage() {
  const { products, loading, error, refreshProducts } = useProducts()
  const { isAdmin } = useAdmin()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [selectedCondition, setSelectedCondition] = useState('todas')
  const [selectedBrand, setSelectedBrand] = useState('todas')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState('popular')

  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 5000

  const categoryOptions = useMemo(
    () => ['todas', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  )

  const brandOptions = useMemo(
    () => ['todas', ...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products],
  )

  useEffect(() => {
    setPriceRange(([currentMin, currentMax]) => {
      const nextMax = maxPrice || 5000
      const nextMin = Math.min(currentMin, nextMax)
      const safeMax = currentMax > nextMax || currentMax === 5000 ? nextMax : currentMax
      return [nextMin, safeMax] as [number, number]
    })
  }, [maxPrice])

  const featuredProducts = useMemo(() => {
    return products.filter(p => p.featured && !p.sold)
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === 'todas' || product.category === selectedCategory
      const matchesCondition = selectedCondition === 'todas' || product.condition === selectedCondition
      const matchesBrand = selectedBrand === 'todas' || product.brand === selectedBrand
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesCategory && matchesCondition && matchesBrand && matchesPrice
    })

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return filtered
  }, [products, selectedCategory, selectedCondition, selectedBrand, priceRange, sortBy])

  let productsContent = (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Nenhum produto encontrado
      </h3>
      <p className="text-muted-foreground">
        Tente ajustar os filtros para encontrar o que procura.
      </p>
    </div>
  )

  if (loading && products.length === 0) {
    productsContent = (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg gap-4">
        <Spinner size="lg" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Carregando produtos
        </h3>
      </div>
    )
  } else if (error && products.length === 0) {
    productsContent = (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center bg-card rounded-lg">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Não foi possível carregar os produtos
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => void refreshProducts()}>
          Tentar novamente
        </Button>
      </div>
    )
  } else if (filteredProducts.length > 0) {
    productsContent = (
      <div className="grid gap-1.5 sm:gap-4 grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Header />
        <HeroBanner />
      </div>

      <main className="container mx-auto px-2 sm:px-6 md:px-10 lg:px-16 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span className="text-primary font-medium">Util Lar</span>
          <ChevronRight className="w-4 h-4" />
          <span>Todos os Produtos</span>
        </nav>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Destaques</h2>
          <FeaturedCarousel products={featuredProducts} />
        </section>

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} produtos encontrados
          </p>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button 
                onClick={() => setCreateOpen(true)} 
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" /> Novo produto
              </Button>
            )}
            <span className="text-sm text-muted-foreground">Ordenar por</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Mais populares</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <SidebarFilters
            categories={categoryOptions}
            brands={brandOptions}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCondition={selectedCondition}
            setSelectedCondition={setSelectedCondition}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            maxPrice={maxPrice}
          />

          <div className="flex-1">
            {productsContent}
          </div>
        </div>
      </main>

      <WhatsAppButton />
      {isAdmin && <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  )
}

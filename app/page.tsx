'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { Header } from '@/components/header'
import { HeroBanner } from '@/components/hero-banner'
import { ProductCard } from '@/components/product-card'
import { SidebarFilters } from '@/components/sidebar-filters'
import { FeaturedCarousel } from '@/components/featured-carousel'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ProductFormDialog } from '@/components/product-form-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProducts } from '@/contexts/products-context'
import { useAdmin } from '@/contexts/admin-context'

export default function HomePage() {
  const { products } = useProducts()
  const { isAdmin } = useAdmin()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [selectedCondition, setSelectedCondition] = useState('todas')
  const [selectedBrand, setSelectedBrand] = useState('todas')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState('popular')

  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 5000

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
              <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Novo produto
              </Button>
            )}
            <span className="text-sm text-muted-foreground">Ordenar por</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Mais populares</SelectItem>
                <SelectItem value="price-asc">Menor preco</SelectItem>
                <SelectItem value="price-desc">Maior preco</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <SidebarFilters
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
            {filteredProducts.length > 0 ? (
              <div className="grid gap-2 sm:gap-4 grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros para encontrar o que procura.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <WhatsAppButton />
      {isAdmin && <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  )
}

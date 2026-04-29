import { useEffect, useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Slider } from '@shared/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@shared/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shared/ui/collapsible'
import { conditions } from '@features/products/model/ProductsData'

interface SidebarFiltersProps {
  readonly categories: string[]
  readonly brands: string[]
  readonly selectedCategory: string
  readonly setSelectedCategory: (value: string) => void
  readonly selectedCondition: string
  readonly setSelectedCondition: (value: string) => void
  readonly selectedBrand: string
  readonly setSelectedBrand: (value: string) => void
  readonly priceRange: [number, number]
  readonly setPriceRange: (value: [number, number]) => void
  readonly maxPrice: number
}

function FiltersContent({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  maxPrice,
}: SidebarFiltersProps) {
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [conditionOpen, setConditionOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)
  const [tempMinPrice, setTempMinPrice] = useState(priceRange[0].toString())
  const [tempMaxPrice, setTempMaxPrice] = useState(priceRange[1].toString())

  useEffect(() => {
    setTempMinPrice(priceRange[0].toString())
    setTempMaxPrice(priceRange[1].toString())
  }, [priceRange])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price)
  }

  const handleApplyPriceFilter = () => {
    const min = Math.max(0, Number.parseInt(tempMinPrice) || 0)
    const max = Math.min(maxPrice, Number.parseInt(tempMaxPrice) || maxPrice)
    setPriceRange([min, max])
  }

  const hasActiveFilters =
    selectedCategory !== 'todas' ||
    selectedCondition !== 'todas' ||
    selectedBrand !== 'todas' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPrice

  const clearAllFilters = () => {
    setSelectedCategory('todas')
    setSelectedCondition('todas')
    setSelectedBrand('todas')
    setPriceRange([0, maxPrice])
    setTempMinPrice('0')
    setTempMaxPrice(maxPrice.toString())
  }

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full gap-2 text-xs"
          size="sm"
        >
          <X className="w-3 h-3" /> Limpar filtros
        </Button>
      )}

      {/* Categoria */}
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-foreground">Categoria</h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedCategory === category
                    ? 'text-accent font-medium'
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {category === 'todas' ? 'Todas' : category}
              </button>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Preço */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-foreground">Preço</h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>MÍNIMO:</span>
              <span>MÁXIMO:</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1 border rounded-md px-2 py-1.5 bg-background">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    value={tempMinPrice}
                    onChange={(e) => setTempMinPrice(e.target.value)}
                    className="border-0 p-0 h-auto text-sm focus-visible:ring-0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 border rounded-md px-2 py-1.5 bg-background">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(e.target.value)}
                    className="border-0 p-0 h-auto text-sm focus-visible:ring-0"
                    placeholder={maxPrice.toString()}
                  />
                </div>
              </div>
            </div>

            <Slider
              value={priceRange}
              onValueChange={(value) => {
                setPriceRange(value as [number, number])
                setTempMinPrice(value[0].toString())
                setTempMaxPrice(value[1].toString())
              }}
              max={maxPrice}
              min={0}
              step={50}
              className="w-full"
            />

            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleApplyPriceFilter}
            >
              APLICAR FILTRO
            </Button>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Condição */}
      <Collapsible open={conditionOpen} onOpenChange={setConditionOpen}>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-foreground">Condição</h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${conditionOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-1">
            {conditions.map((cond) => (
              <button
                key={cond.value}
                onClick={() => setSelectedCondition(cond.value)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedCondition === cond.value
                    ? 'text-accent font-medium'
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {cond.label}
              </button>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Marca */}
      <Collapsible open={brandOpen} onOpenChange={setBrandOpen}>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-foreground">Marca</h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-1">
            <button
              onClick={() => setSelectedBrand('todas')}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                selectedBrand === 'todas'
                  ? 'text-accent font-medium'
                  : 'text-foreground hover:text-accent'
              }`}
            >
              Todas
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedBrand === brand
                    ? 'text-accent font-medium'
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {brand}
              </button>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

export function SidebarFilters(props: SidebarFiltersProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 space-y-4 shrink-0">
        <FiltersContent {...props} />
      </aside>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-sm p-0 flex flex-col gap-0"
        >
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FiltersContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

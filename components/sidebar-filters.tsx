'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SlidersHorizontal, X } from 'lucide-react'
import { Category, ProductCondition } from '@/types'
import { categoryLabels, conditionLabels } from '@/data/products'

interface SidebarFiltersProps {
  selectedCategories: Category[]
  onCategoryToggle: (category: Category) => void
  minPrice: number
  maxPrice: number
  onPriceChange: (min: number, max: number) => void
  maxPriceLimit: number
  selectedConditions: ProductCondition[]
  onConditionToggle: (condition: ProductCondition) => void
  onClearFilters: () => void
}

export function SidebarFilters({
  selectedCategories,
  onCategoryToggle,
  minPrice,
  maxPrice,
  onPriceChange,
  maxPriceLimit,
  selectedConditions,
  onConditionToggle,
  onClearFilters
}: SidebarFiltersProps) {
  const [tempMinPrice, setTempMinPrice] = useState(String(minPrice))
  const [tempMaxPrice, setTempMaxPrice] = useState(String(maxPrice))
  const [open, setOpen] = useState(false)

  const categories: Category[] = ['cozinha', 'banheiro', 'quarto', 'sala', 'decoracao', 'organizacao', 'limpeza', 'diversos']
  const conditions: ProductCondition[] = ['novo', 'usado', 'seminovo']

  const applyPriceFilter = () => {
    const min = Math.max(0, Number.parseInt(tempMinPrice) || 0)
    const max = Math.min(maxPriceLimit, Number.parseInt(tempMaxPrice) || maxPriceLimit)
    onPriceChange(min, max)
  }

  const handleClearFilters = () => {
    onClearFilters()
    setTempMinPrice('0')
    setTempMaxPrice(String(maxPriceLimit))
    setOpen(false)
  }

  const filtersContent = (
    <div className="space-y-6">
      {/* Cabeçalho com botão limpar (só em mobile, no drawer) */}
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-semibold text-base">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Limpar
        </Button>
      </div>

      {/* Categorias */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Categorias</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => onCategoryToggle(cat)}
              />
              <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                {categoryLabels[cat]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Faixa de preço</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={tempMinPrice}
            onChange={(e) => setTempMinPrice(e.target.value)}
            onBlur={applyPriceFilter}
            className="w-full text-sm"
          />
          <Input
            type="number"
            placeholder="Max"
            value={tempMaxPrice}
            onChange={(e) => setTempMaxPrice(e.target.value)}
            onBlur={applyPriceFilter}
            className="w-full text-sm"
          />
        </div>
      </div>

      {/* Condição */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Condição</h4>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <div key={cond} className="flex items-center space-x-2">
              <Checkbox
                id={`cond-${cond}`}
                checked={selectedConditions.includes(cond)}
                onCheckedChange={() => onConditionToggle(cond)}
              />
              <Label htmlFor={`cond-${cond}`} className="text-sm cursor-pointer">
                {conditionLabels[cond]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Limpar (só desktop) */}
      <Button variant="outline" onClick={handleClearFilters} className="w-full hidden lg:flex">
        <X className="w-4 h-4 mr-2" />
        Limpar filtros
      </Button>
    </div>
  )

  return (
    <>
      {/* Mobile: Sheet com botão trigger */}
      <div className="lg:hidden mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros de produtos</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filtersContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar normal */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-6 pr-6 border-r">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>
        {filtersContent}
      </aside>
    </>
  )
}

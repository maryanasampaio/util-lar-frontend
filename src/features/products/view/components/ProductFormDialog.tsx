import { useEffect, useState } from 'react'
import { Button } from '@shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@shared/ui/dialog'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { Switch } from '@shared/ui/switch'
import { useProducts } from '@features/products/viewmodel/ProductsContext'
import { Product, ProductCategory, ProductCondition } from '@features/products/model/Product'
import { categoryLabels } from '@features/products/model/ProductsData'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  costPrice: 0,
  condition: 'novo' as ProductCondition,
  category: 'sem-categoria' as ProductCategory,
  brand: '',
  imageUrl: '',
  stock: 1,
  sold: false,
  featured: false,
  material: '',
  color: '',
  warranty: '',
  dimensions: '',
}

const categoryOptions: ProductCategory[] = [
  'sofas',
  'mesas',
  'armarios',
  'cadeiras',
  'racks',
  'eletrodomesticos',
  'sem-categoria',
]

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { addProduct, updateProduct } = useProducts()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        condition: product.condition,
        category: product.category,
        brand: product.brand,
        imageUrl: product.imageUrl,
        stock: product.stock,
        sold: product.sold,
        featured: product.featured,
        material: product.material ?? '',
        color: product.color ?? '',
        warranty: product.warranty ?? '',
        dimensions: product.dimensions ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product) {
      updateProduct(product.id, form)
    } else {
      addProduct(form)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Atualize as informações do produto.' : 'Cadastre um novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="price">Preço de venda (R$)</Label>
            <Input id="price" type="number" min={0} step={0.01} required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <Label htmlFor="costPrice">Preço de custo (R$)</Label>
            <Input id="costPrice" type="number" min={0} step={0.01} required value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{categoryLabels[c] ?? c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condição</Label>
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as ProductCondition })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="stock">Estoque</Label>
            <Input id="stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="imageUrl">URL da imagem</Label>
            <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="color">Cor</Label>
            <Input id="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="warranty">Garantia</Label>
            <Input id="warranty" value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="dimensions">Dimensões</Label>
            <Input id="dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
          </div>

          <div className="flex items-center justify-between rounded border p-3">
            <Label htmlFor="featured">Destaque</Label>
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
          </div>
          <div className="flex items-center justify-between rounded border p-3">
            <Label htmlFor="sold">Vendido</Label>
            <Switch id="sold" checked={form.sold} onCheckedChange={(v) => setForm({ ...form, sold: v })} />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{product ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

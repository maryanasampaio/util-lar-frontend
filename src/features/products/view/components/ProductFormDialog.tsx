import { useEffect, useState, useRef } from 'react'
import { X, ChevronUp, ChevronDown, Upload } from 'lucide-react'
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
import { Spinner } from '@shared/ui/spinner'
import { useProducts } from '@features/products/viewmodel/ProductsContext'
import { Product, ProductCondition, ProductFormValues } from '@features/products/model/Product'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

const emptyForm: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  costPrice: undefined,
  condition: 'novo' as ProductCondition,
  category: 'Sem categoria',
  brand: '',
  imageUrl: '',
  images: [],
  stock: 1,
  featured: false,
  material: '',
  color: '',
  warranty: '',
  dimensions: '',
}

export function ProductFormDialog({ open, onOpenChange, product }: Readonly<ProductFormDialogProps>) {
  const { addProduct, updateProduct } = useProducts()
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean)
      setImageUrls(allImages)
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        costPrice: product.costPrice ?? undefined,
        condition: product.condition,
        category: product.category,
        brand: product.brand ?? '',
        imageUrl: product.imageUrl,
        images: product.images || [],
        stock: product.stock,
        featured: product.featured,
        material: product.material ?? '',
        color: product.color ?? '',
        warranty: product.warranty ?? '',
        dimensions: product.dimensions ?? '',
      })
    } else {
      setImageUrls([])
      setForm(emptyForm)
    }
  }, [product, open])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImageUrls: string[] = []
    
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            newImageUrls.push(reader.result)
          }
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    setImageUrls([...imageUrls, ...newImageUrls])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newUrls = [...imageUrls]
    ;[newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]]
    setImageUrls(newUrls)
  }

  const moveImageDown = (index: number) => {
    if (index === imageUrls.length - 1) return
    const newUrls = [...imageUrls]
    ;[newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]]
    setImageUrls(newUrls)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newUrls = [...imageUrls]
    const draggedItem = newUrls[draggedIndex]
    newUrls.splice(draggedIndex, 1)
    newUrls.splice(index, 0, draggedItem)
    
    setImageUrls(newUrls)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)

    try {
      const [firstImage, ...restImages] = imageUrls
      const updatedForm = {
        ...form,
        imageUrl: firstImage || '',
        images: restImages,
      }
      
      if (product) {
        await updateProduct(product.id, updatedForm)
      } else {
        await addProduct(updatedForm)
      }

      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
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
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>

          <div>
            <Label>Condição</Label>
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as ProductCondition })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="seminovo">Seminovo</SelectItem>
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

          <div className="md:col-span-2 space-y-3">
            <div className="space-y-2">
              <Label>Imagens do produto</Label>
              <p className="text-xs text-muted-foreground">
                A primeira imagem será a capa. Arraste para reordenar ou use as setas.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.map((url, index) => (
                    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                    <div 
                      key={`preview-${url.substring(0, 30)}-${index}`} 
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      aria-label={`Imagem ${index + 1}${index === 0 ? ' (Capa)' : ''}`}
                      className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${
                        draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                            Capa
                          </span>
                        </div>
                      )}
                      
                      <div className="aspect-square bg-muted pointer-events-none">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveImageDown(index)}
                          disabled={index === imageUrls.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imageUrls.length === 0 ? 'Adicionar imagens' : 'Adicionar mais imagens'}
              </Button>
            </div>
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
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Spinner size="sm" />}
              {product ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

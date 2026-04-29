import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ImageIcon, Share2, Check, Pencil, Trash2, CheckCircle, RotateCcw } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent } from '@shared/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/alert-dialog'
import { Spinner } from '@shared/ui/spinner'
import { useFavorites } from '@features/favorites/viewmodel/FavoritesContext'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { useProducts } from '@features/products/viewmodel/ProductsContext'
import { Product } from '@features/products/model/Product'
import { categoryLabels } from '@features/products/model/ProductsData'
import { ProductFormDialog } from './ProductFormDialog'

interface ProductCardProps {
  readonly product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isAdmin } = useAdmin()
  const { deleteProduct, toggleSold } = useProducts()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const favorite = isFavorite(product.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const url = `${globalThis.window.location.origin}/produto/${product.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <Card 
      className="group relative overflow-hidden border-0 sm:border shadow-sm hover:shadow-md transition-shadow bg-card rounded-lg sm:rounded-xl flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/produto/${product.id}`)}
    >
      <div className="relative aspect-[4/5] sm:aspect-square bg-muted rounded-t-lg sm:rounded-t-xl overflow-hidden shrink-0">
        <Badge 
          className={`absolute top-2 left-2 z-10 text-[9px] sm:text-xs px-1.5 py-0.5 ${
            product.condition === 'novo' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-orange-500 text-white'
          }`}
        >
          {product.condition === 'novo' ? 'NOVO' : 'SEMINOVO'}
        </Badge>
        
        <button
          onClick={(e) => { e.stopPropagation(); handleFavorite(e); }}
          className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors ${
            favorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {product.sold && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-white text-xl font-bold">
              <Check className="w-6 h-6" />
              VENDIDO
            </div>
          </div>
        )}

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <CardContent className="p-2 sm:p-4 flex flex-col flex-1">
        <div className="min-h-[2.5rem] sm:min-h-[3rem]">
          <h3 className="font-semibold text-xs sm:text-base text-foreground line-clamp-2 leading-tight">{product.name}</h3>
        </div>
        <Badge variant="secondary" className="mt-1 text-[9px] sm:text-xs font-normal px-1.5 py-0 self-start">
          {categoryLabels[product.category] || product.category}
        </Badge>
        
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block min-h-[2.5rem] mt-2">
          {product.description || '\u00A0'}
        </p>
        
        <p className="text-sm sm:text-base font-bold text-foreground mt-2">
          {formatPrice(product.price)}
        </p>

        <div className="flex gap-2 mt-auto pt-2 sm:pt-3">
          <Button 
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-[10px] sm:text-sm h-7 sm:h-9"
            disabled={product.sold}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">Ver detalhes</span>
            <span className="sm:hidden">Ver</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={(e) => { e.stopPropagation(); handleShare(e); }}
            className="shrink-0 h-7 w-7 sm:h-9 sm:w-9"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-dashed">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-0 gap-1 h-7 sm:h-9 px-2 text-[10px] sm:text-sm"
              onClick={async (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIsToggling(true);
                try {
                  await toggleSold(product.id);
                } finally {
                  setIsToggling(false);
                }
              }}
              disabled={isToggling}
              title={product.sold ? 'Marcar como disponível' : 'Marcar como vendido'}
            >
              {isToggling ? (
                <Spinner size="sm" />
              ) : (
                <>
                  {product.sold ? <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> : <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
                  <span className="truncate">{product.sold ? 'Reverter' : 'Vendido'}</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="shrink-0 h-7 w-7 sm:h-9 sm:w-9"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditOpen(true) }}
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="shrink-0 h-7 w-7 sm:h-9 sm:w-9 text-destructive hover:text-destructive"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true) }}
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {isAdmin && (
        <>
          <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{product.name}&quot; será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsDeleting(true);
                    try {
                      await deleteProduct(product.id);
                      setDeleteOpen(false);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                >
                  {isDeleting && <Spinner size="sm" />}
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  )
}

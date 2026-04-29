import { ChevronLeft, ImageIcon } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Header } from '@shared/components/Header'
import { WhatsAppButton } from '@shared/components/WhatsAppButton'
import { useProducts } from '@features/products/viewmodel/ProductsContext'

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function ProductStateMessage({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const productId = Number(id)
  const product = Number.isFinite(productId)
    ? products.find((item) => item.id === productId)
    : undefined
  const whatsappMessage = product ? `Olá! Tenho interesse no produto ${product.name}.` : ''
  const whatsappUrl = product
    ? `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
    : '#'
  
  // Combina imageUrl com images array para ter todas as imagens
  const allImages = product ? [product.imageUrl, ...(product.images || [])].filter(Boolean) : []

  let content = <ProductStateMessage title="Produto não encontrado" description="O item pode ter sido removido ou ainda não estar disponível." />

  if (loading && !product) {
    content = <ProductStateMessage title="Carregando produto" description="Aguarde um momento." />
  } else if (product) {
    content = (
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="flex flex-col-reverse lg:flex-row gap-3">
          {/* Miniaturas - embaixo em mobile, à esquerda em desktop */}
          {allImages.length > 1 && (
            <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-20 overflow-x-auto lg:overflow-x-visible">
              {allImages.map((img, index) => (
                <button
                  key={`thumb-${index}-${img.substring(0, 20)}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all shrink-0 w-16 lg:w-full ${
                    selectedImageIndex === index 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-transparent hover:border-muted-foreground/20'
                  }`}
                >
                  <img src={img} alt={`${product.name} - foto ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
          {/* Imagem principal */}
          <div className="flex-1 rounded-3xl border bg-card overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImageIndex]} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-16 h-16 text-muted-foreground/40" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Informações principais */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{product.condition === 'novo' ? 'Novo' : 'Seminovo'}</Badge>
              {product.featured && <Badge variant="secondary">Destaque</Badge>}
              {product.sold && <Badge variant="destructive">Vendido</Badge>}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">{product.name}</h1>
            </div>

            <div className="space-y-2">
              {product.originalPrice ? (
                <p className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
              ) : null}
              <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <p className="text-base leading-7 text-muted-foreground">{product.description}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3 rounded-2xl border bg-card p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Marca</p>
                <p className="mt-1 font-medium text-foreground">{product.brand || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estoque</p>
                <p className="mt-1 font-medium text-foreground">{product.stock}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Material</p>
                <p className="mt-1 font-medium text-foreground">{product.material || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cor</p>
                <p className="mt-1 font-medium text-foreground">{product.color || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Garantia</p>
                <p className="mt-1 font-medium text-foreground">{product.warranty || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Dimensões</p>
                <p className="mt-1 font-medium text-foreground">{product.dimensions || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Botão WhatsApp sempre na mesma posição */}
          <div className="mt-auto">
            {product.sold ? (
              <Button className="w-full" disabled>
                Produto indisponível
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Falar no WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 px-0 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para produtos
        </Button>
        {content}
      </main>

      <WhatsAppButton />
    </div>
  )
}

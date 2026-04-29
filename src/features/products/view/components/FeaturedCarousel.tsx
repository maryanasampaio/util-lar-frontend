import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Product } from '@features/products/model/Product'

interface FeaturedCarouselProps {
  readonly products: Product[]
}

const AUTOPLAY_MS = 3000

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [paused, setPaused] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 3
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }

  useEffect(() => {
    if (paused || products.length <= 1) return
    const interval = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const scrollAmount = el.clientWidth / 3
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
      setTimeout(checkScroll, 300)
    }, AUTOPLAY_MS)
    return () => clearInterval(interval)
  }, [paused, products.length])

  if (products.length === 0) {
    return null
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/produto/${product.id}`}
            className="flex-shrink-0 w-[calc((100%-1rem)/3)] sm:w-[calc((100%-2rem)/3)] group"
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/2] rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                <h3 className="text-white font-bold text-xs sm:text-lg uppercase tracking-wide line-clamp-2">
                  {product.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-lg z-10"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-lg z-10"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}

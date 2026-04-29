import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { AdminLoginDialog } from './AdminLoginDialog'
import logoBranca from '@/public/logo-branca.png'

const slides = [
  {
    title: 'UTIL LAR',
    subtitle: 'Moveis e Eletrodomesticos',
    description: 'Especializados em produtos novos e seminovos de alta qualidade. Transforme sua casa em um lar acolhedor!',
    features: ['Qualidade Garantida', 'Melhor Preco', 'Entrega Rapida']
  },
  {
    title: 'UTIL LAR',
    subtitle: 'Ofertas Especiais',
    description: 'Aproveite nossas promocoes exclusivas em moveis e eletrodomesticos. Parcele em ate 12x no cartao!',
    features: ['Ate 12x sem Juros', 'Frete Gratis', 'Garantia Estendida']
  },
  {
    title: 'UTIL LAR',
    subtitle: 'Seminovos Selecionados',
    description: 'Produtos seminovos com qualidade garantida e precos imbativeis. Economia sem abrir mao da qualidade!',
    features: ['Produtos Revisados', 'Garantia 30 Dias', 'Melhor Custo-Beneficio']
  }
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loginOpen, setLoginOpen] = useState(false)
  const { isAdmin } = useAdmin()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSecretDoubleClick = () => {
    if (!isAdmin) {
      setLoginOpen(true)
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className="relative text-primary-foreground overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(213, 20%, 56%) 0%, hsl(213, 18%, 50%) 100%)' }}>
      {/* Blur orbs decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      {/* Padrão geométrico de fundo (pontos) */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Círculos flutuantes sutis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-2/3 left-1/2 w-3 h-3 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Decoração em forma de onda */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-32 text-white/[0.06]"
          viewBox="0 0 800 100"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M0,80 Q200,20 400,60 T800,40" />
          <path d="M0,90 Q200,40 400,80 T800,60" />
        </svg>
      </div>
      
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold tracking-widest opacity-80">BEM-VINDO AO</p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">{slide.title}</h1>
            <h2 className="text-xl md:text-2xl font-medium opacity-90">{slide.subtitle}</h2>
            <p className="text-base opacity-80 max-w-lg leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              {slide.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-shrink-0 hidden md:block">
            <img
              src={logoBranca}
              alt="Util Lar"
              onDoubleClick={handleSecretDoubleClick}
              className="w-48 h-48 object-contain opacity-90 cursor-pointer select-none"
            />
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((slide, index) => (
            <button
              key={slide.title + index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-primary-foreground' : 'bg-primary-foreground/40'
              }`}
            />
          ))}
        </div>
      </div>

      <AdminLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}

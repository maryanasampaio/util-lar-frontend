import { Link, useLocation } from 'react-router-dom'
import { Heart, Bell, Download, Menu } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { useFavorites } from '@features/favorites/viewmodel/FavoritesContext'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { useAdminSidebar } from '@features/admin/viewmodel/AdminSidebarContext'

export function Header() {
  const { favorites } = useFavorites()
  const { isAdmin } = useAdmin()
  const { setOpen } = useAdminSidebar()
  const location = useLocation()
  const favoritesCount = favorites.length
  const isProductDetailPage = location.pathname.startsWith('/produto/')

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
      {isAdmin ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Abrir painel admin"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        <Link to="/favoritos" className="relative">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </Link>
        
        <Link to="/notificacoes">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </div>
        </Link>
        
        {!isProductDetailPage && (
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-foreground border-0 hover:bg-white/90 gap-2"
          >
            <Download className="w-4 h-4" />
            Instalar
          </Button>
        )}
      </div>
    </header>
  )
}

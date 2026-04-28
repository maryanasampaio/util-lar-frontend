import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Package, Calculator, BarChart3, LogOut, Home, X, Menu } from 'lucide-react'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { useAdminSidebar } from '@features/admin/viewmodel/AdminSidebarContext'
import { cn } from '@shared/utils/cn'

const navItems = [
  { href: '/', label: 'Produtos', icon: Package, exact: true },
  { href: '/admin/simulacoes', label: 'Simulações', icon: Calculator },
  { href: '/admin/gerenciamento', label: 'Gerenciamento', icon: BarChart3 },
]

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  const { isAdmin, logout } = useAdmin()
  const { open, setOpen } = useAdminSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  const sidebarVisible = isAdmin && open

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <div className="flex min-h-screen bg-background">
      {isAdmin && (
        <>
          {/* Backdrop (apenas mobile) */}
          {sidebarVisible && (
            <button
              type="button"
              aria-label="Fechar painel"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
          )}

          <aside
            aria-hidden={!sidebarVisible}
            className={cn(
              // Mobile: overlay fixo por cima do conteúdo
              'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden transition-transform duration-300 ease-in-out',
              sidebarVisible ? 'translate-x-0' : '-translate-x-full',
              // Desktop: empurra o conteúdo (sticky + animação de largura)
              'lg:sticky lg:top-0 lg:self-start lg:h-screen lg:shrink-0 lg:translate-x-0 lg:transition-[width]',
              sidebarVisible ? 'lg:w-72' : 'lg:w-0'
            )}
          >
            <div className="w-72 flex flex-col h-screen">
              <div className="flex items-start justify-between p-6 border-b border-sidebar-border">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70">Painel</p>
                  <h2 className="font-serif text-lg">Util Lar Admin</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md hover:bg-sidebar-accent transition-colors"
                  aria-label="Fechar painel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon, exact }) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive(href, exact)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-sidebar-border space-y-1">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Ver loja
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0">{children}</div>

      {/* Botão flutuante para reabrir o sidebar quando estiver fechado */}
      {isAdmin && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir painel"
          className="absolute top-4 left-4 z-40 p-2.5 rounded-md hover:bg-accent/40 transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  )
}

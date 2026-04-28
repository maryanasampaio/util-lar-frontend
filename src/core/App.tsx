import { BrowserRouter } from 'react-router-dom'
import { AdminProvider } from '@features/admin/viewmodel/AdminContext'
import { AdminSidebarProvider } from '@features/admin/viewmodel/AdminSidebarContext'
import { ProductsProvider } from '@features/products/viewmodel/ProductsContext'
import { FavoritesProvider } from '@features/favorites/viewmodel/FavoritesContext'
import { ThemeProvider } from '@shared/providers/ThemeProvider'
import { Toaster } from '@shared/ui/sonner'
import AppRouter from './router/AppRouter'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="utillar-theme">
      <AdminProvider>
        <AdminSidebarProvider>
          <ProductsProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
              <Toaster />
            </FavoritesProvider>
          </ProductsProvider>
        </AdminSidebarProvider>
      </AdminProvider>
    </ThemeProvider>
  )
}

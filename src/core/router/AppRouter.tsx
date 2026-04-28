import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'
import { AppShell } from '@shared/layouts/AppShell'


import { HomePage } from '@features/products/view/pages/HomePage'
import { ProductDetailPage } from '@features/products/view/pages/ProductDetailPage'
import { FavoritesPage } from '@features/favorites/view/pages/FavoritesPage'
import { AdminSimulacoesPage } from '@/features/admin/view/pages/AdminSimulacoesPage'
import { AdminGerenciamentoPage } from '@/features/admin/view/pages/AdminGerenciamentoPage'

export default function AppRouter() {
  const { isAdmin } = useAdmin()

  return (
    <AppShell>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/produto/:id" element={<ProductDetailPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/simulacoes"
          element={isAdmin ? <AdminSimulacoesPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/gerenciamento"
          element={isAdmin ? <AdminGerenciamentoPage /> : <Navigate to="/" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

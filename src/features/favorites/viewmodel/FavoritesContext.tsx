import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { FavoritesRepository } from '../repository/FavoritesRepository'

interface FavoritesContextType {
  favorites: number[]
  addFavorite: (productId: number) => void
  removeFavorite: (productId: number) => void
  toggleFavorite: (productId: number) => void
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from repository on mount
  useEffect(() => {
    setFavorites(FavoritesRepository.getFavorites())
    setMounted(true)
  }, [])

  // Persist when changed
  useEffect(() => {
    if (mounted) {
      FavoritesRepository.saveFavorites(favorites)
    }
  }, [favorites, mounted])

  const addFavorite = (productId: number) => {
    setFavorites(prev => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  const removeFavorite = (productId: number) => {
    setFavorites(prev => prev.filter(id => id !== productId))
  }

  const toggleFavorite = (productId: number) => {
    if (favorites.includes(productId)) {
      removeFavorite(productId)
    } else {
      addFavorite(productId)
    }
  }

  const isFavorite = (productId: number) => favorites.includes(productId)

  const value = useMemo(
    () => ({ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }),
    [favorites],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

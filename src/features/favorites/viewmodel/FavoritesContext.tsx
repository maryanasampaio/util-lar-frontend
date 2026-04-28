import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FavoritesRepository } from '../repository/FavoritesRepository'

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
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

  const addFavorite = (productId: string) => {
    setFavorites(prev => [...prev, productId])
  }

  const removeFavorite = (productId: string) => {
    setFavorites(prev => prev.filter(id => id !== productId))
  }

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFavorite(productId)
    } else {
      addFavorite(productId)
    }
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
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

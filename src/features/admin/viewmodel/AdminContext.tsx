import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AdminRepository } from '../repository/AdminRepository'

interface AdminContextType {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(AdminRepository.isAuthenticated())
  }, [])

  const login = (password: string) => {
    const success = AdminRepository.login(password)
    if (success) {
      setIsAdmin(true)
    }
    return success
  }

  const logout = () => {
    AdminRepository.logout()
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider')
  return ctx
}

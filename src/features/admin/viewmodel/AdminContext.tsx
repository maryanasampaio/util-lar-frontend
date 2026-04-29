import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { AdminRepository } from '../repository/AdminRepository'

interface AdminContextType {
  isAdmin: boolean
  login: (password: string, apiToken?: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(AdminRepository.isAuthenticated())
  }, [])

  const login = (password: string, apiToken?: string) => {
    const success = AdminRepository.login(password, apiToken)
    if (success) {
      setIsAdmin(true)
    }
    return success
  }

  const logout = () => {
    AdminRepository.logout()
    setIsAdmin(false)
  }

  const value = useMemo(
    () => ({ isAdmin, login, logout }),
    [isAdmin],
  )

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider')
  return ctx
}

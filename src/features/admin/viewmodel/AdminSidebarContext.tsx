import { createContext, useContext, useState, useMemo, ReactNode } from 'react'

interface AdminSidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AdminSidebarContext = createContext<AdminSidebarContextValue | undefined>(undefined)

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])
  return <AdminSidebarContext.Provider value={value}>{children}</AdminSidebarContext.Provider>
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext)
  if (!ctx) throw new Error('useAdminSidebar must be used within AdminSidebarProvider')
  return ctx
}

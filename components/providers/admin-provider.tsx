"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { SuperAdminRole } from "@prisma/client"
import { SidebarProvider } from "./sidebar-provider"

interface AdminContextValue {
  admin: {
    id: string
    email: string
    name: string
    role: SuperAdminRole
    permissions: string[]
  }
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({
  children,
  admin,
}: {
  children: ReactNode
  admin: AdminContextValue["admin"]
}) {
  return (
    <AdminContext.Provider value={{ admin }}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

export function useAdminPermission(permission: string): boolean {
  const { admin } = useAdmin()
  if (admin.permissions.includes("super:*")) return true
  return admin.permissions.includes(permission)
}

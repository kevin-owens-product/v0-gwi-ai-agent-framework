"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { SuperAdminRole } from "@prisma/client"
import { hasGWIPermission, type GWIPermission } from "@/lib/gwi-permissions"

interface GWIAdminContextValue {
  admin: {
    id: string
    email: string
    name: string
    role: SuperAdminRole
    permissions: string[]
  }
}

const GWIAdminContext = createContext<GWIAdminContextValue | null>(null)

export function GWIProvider({
  children,
  admin,
}: {
  children: ReactNode
  admin: GWIAdminContextValue["admin"]
}) {
  return (
    <GWIAdminContext.Provider value={{ admin }}>
      {children}
    </GWIAdminContext.Provider>
  )
}

export function useGWIAdmin() {
  const context = useContext(GWIAdminContext)
  if (!context) {
    throw new Error("useGWIAdmin must be used within a GWIProvider")
  }
  return context
}

export function useGWIPermission(permission: GWIPermission): boolean {
  const { admin } = useGWIAdmin()
  // Check role-based permissions
  if (hasGWIPermission(admin.role, permission)) return true
  // Check explicit permissions (for custom overrides)
  if (admin.permissions.includes("gwi:*")) return true
  return admin.permissions.includes(permission)
}

export function useHasAnyGWIPermission(permissions: GWIPermission[]): boolean {
  const { admin } = useGWIAdmin()
  return permissions.some(permission => {
    if (hasGWIPermission(admin.role, permission)) return true
    if (admin.permissions.includes("gwi:*")) return true
    return admin.permissions.includes(permission)
  })
}

"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false)

  const toggleMobile = () => setMobileOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen, toggleMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

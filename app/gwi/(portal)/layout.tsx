import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { GWISidebar } from "@/components/gwi/sidebar"
import { GWIHeader } from "@/components/gwi/header"
import { GWIProvider } from "@/components/providers/gwi-provider"
import { canAccessGWIPortal } from "@/lib/gwi-permissions"

export default async function GWILayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const gwiToken = cookieStore.get("gwiToken")?.value

  if (!gwiToken) {
    redirect("/login?type=gwi")
  }

  // Validate GWI session
  const session = await prisma.superAdminSession.findUnique({
    where: { token: gwiToken },
    include: { admin: true },
  })

  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    redirect("/login?type=gwi")
  }

  // Check if user has GWI portal access
  if (!canAccessGWIPortal(session.admin.role)) {
    redirect("/login?type=gwi&error=unauthorized")
  }

  return (
    <GWIProvider
      admin={{
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        role: session.admin.role,
        permissions: session.admin.permissions,
      }}
    >
      <div className="min-h-screen bg-background gwi-portal">
        <GWISidebar />
        <div className="lg:pl-64">
          <GWIHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </GWIProvider>
  )
}

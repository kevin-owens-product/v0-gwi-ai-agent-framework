import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AdminProvider } from "@/components/providers/admin-provider"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("adminToken")?.value

  if (!adminToken) {
    redirect("/admin/login")
  }

  // Validate admin session
  const session = await prisma.superAdminSession.findUnique({
    where: { token: adminToken },
    include: { admin: true },
  })

  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    redirect("/admin/login")
  }

  return (
    <AdminProvider
      admin={{
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        role: session.admin.role,
        permissions: session.admin.permissions,
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminProvider>
  )
}

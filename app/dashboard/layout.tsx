import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { OrganizationProvider } from "@/components/providers/organization-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user's organizations
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  })

  // If user has no organizations, redirect to onboarding
  if (memberships.length === 0) {
    redirect("/onboarding")
  }

  // Get current organization from cookie or use first org
  const cookieStore = await cookies()
  const currentOrgId = cookieStore.get("currentOrgId")?.value
  const currentMembership = currentOrgId
    ? memberships.find(m => m.organization.id === currentOrgId) || memberships[0]
    : memberships[0]

  const org = currentMembership.organization
  return (
    <OrganizationProvider
      organization={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        planTier: org.planTier,
        settings: org.settings && typeof org.settings === 'object' && !Array.isArray(org.settings)
          ? org.settings as Record<string, unknown>
          : undefined,
        subscription: org.subscription ? {
          id: org.subscription.id,
          status: org.subscription.status,
          planId: org.subscription.planId,
          currentPeriodEnd: org.subscription.currentPeriodEnd?.toISOString(),
        } : null,
      }}
      membership={{
        id: currentMembership.id,
        role: currentMembership.role,
        joinedAt: currentMembership.joinedAt.toISOString(),
      }}
      organizations={memberships.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        planTier: m.organization.planTier,
      }))}
      user={{
        id: session.user.id!,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }}
    >
      <DashboardShell>
        <div className="min-h-screen bg-background">
          <DashboardSidebar />
          <div className="lg:pl-60">
            <DashboardHeader />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </DashboardShell>
    </OrganizationProvider>
  )
}

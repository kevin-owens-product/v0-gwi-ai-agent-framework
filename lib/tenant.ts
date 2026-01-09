import { headers } from 'next/headers'
import { prisma } from './db'

export async function getCurrentOrganization() {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  // Extract subdomain (e.g., acme.gwi-insights.com -> acme)
  const subdomain = host.split('.')[0]

  if (!subdomain || subdomain === 'www' || subdomain === 'app' || subdomain === 'localhost') {
    return null
  }

  const org = await prisma.organization.findUnique({
    where: { slug: subdomain },
    include: {
      subscription: true,
      ssoConfig: true,
    }
  })

  return org
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          subscription: true,
        }
      }
    }
  })

  return memberships.map(m => ({
    ...m.organization,
    role: m.role,
  }))
}

export async function getUserMembership(userId: string, orgId: string) {
  return prisma.organizationMember.findUnique({
    where: {
      orgId_userId: { orgId, userId }
    }
  })
}

export async function getOrganizationById(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      ssoConfig: true,
      _count: {
        select: {
          members: true,
          agents: true,
          dataSources: true,
        }
      }
    }
  })
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      subscription: true,
      ssoConfig: true,
    }
  })
}

// Create a new organization with the creating user as owner
export async function createOrganization(data: {
  name: string
  slug: string
  userId: string
}) {
  const { name, slug, userId } = data

  // Create org and add user as owner in a transaction
  const org = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      }
    })

    await tx.organizationMember.create({
      data: {
        orgId: organization.id,
        userId,
        role: 'OWNER',
      }
    })

    // Create default billing subscription
    await tx.billingSubscription.create({
      data: {
        orgId: organization.id,
        planId: 'starter',
        status: 'TRIALING',
      }
    })

    return organization
  })

  return org
}

// Helper to validate slug availability
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await prisma.organization.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true }
  })
  return !existing
}

// Generate a unique slug from a name
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

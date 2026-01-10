import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const onboardingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jobTitle: z.string().optional(),
  role: z.string().optional(),
  companyName: z.string().min(1),
  teamSize: z.string().optional(),
  goals: z.array(z.string()).optional(),
  selectedAgents: z.array(z.string()).optional(),
})

// GET /api/v1/onboarding - Check onboarding status
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has an organization membership (indicates completed onboarding)
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    if (membership) {
      return NextResponse.json({
        completed: true,
        organization: {
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
        },
      })
    }

    return NextResponse.json({ completed: false })
  } catch (error) {
    console.error('GET /api/v1/onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/onboarding - Complete onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = onboardingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, companyName, teamSize, goals, selectedAgents } = validation.data

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an organization
    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    // Create slug from company name
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for slug uniqueness and append number if needed
    let slug = baseSlug
    let counter = 1
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Extract userId before transaction for TypeScript
    const userId = session.user!.id

    // Create organization and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user name
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: `${firstName} ${lastName}`,
        },
      })

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
          settings: {
            teamSize: teamSize || 'unknown',
            goals: goals || [],
            onboardingCompleted: true,
          },
        },
      })

      // Create membership as owner
      await tx.organizationMember.create({
        data: {
          orgId: organization.id,
          userId,
          role: 'OWNER',
        },
      })

      // Create selected agents if any
      if (selectedAgents && selectedAgents.length > 0) {
        const agentTypeMap: Record<string, string> = {
          'audience-strategist': 'RESEARCH',
          'creative-brief': 'REPORTING',
          'competitive-tracker': 'MONITORING',
          'trend-spotter': 'ANALYSIS',
          'media-planner': 'ANALYSIS',
          'insight-generator': 'RESEARCH',
        }

        const agentDescriptions: Record<string, string> = {
          'audience-strategist': 'Build detailed audience personas from GWI data',
          'creative-brief': 'Generate data-driven creative briefs',
          'competitive-tracker': 'Monitor brand perception vs competitors',
          'trend-spotter': 'Identify emerging consumer trends',
          'media-planner': 'Optimize media mix recommendations',
          'insight-generator': 'Surface key insights from data queries',
        }

        for (const agentId of selectedAgents) {
          const name = agentId
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          await tx.agent.create({
            data: {
              name,
              description: agentDescriptions[agentId] || `${name} agent`,
              type: (agentTypeMap[agentId] as any) || 'CUSTOM',
              status: 'ACTIVE',
              orgId: organization.id,
              createdBy: userId,
              configuration: {},
            },
          })
        }
      }

      return { user, organization }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
    })
  } catch (error) {
    console.error('POST /api/v1/onboarding error:', error)

    // Provide more specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Organization with this name already exists' },
          { status: 400 }
        )
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid user or organization reference' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

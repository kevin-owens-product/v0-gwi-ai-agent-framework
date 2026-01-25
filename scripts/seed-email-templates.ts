/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * Seed script for default email templates
 * Run with: npx ts-node scripts/seed-email-templates.ts
 * Or: npx tsx scripts/seed-email-templates.ts
 */

import { PrismaClient } from '@prisma/client'
import { DEFAULT_SYSTEM_TEMPLATES } from '../lib/email-templates'

const prisma = new PrismaClient()

async function seedEmailTemplates() {
  console.log('Starting email template seed...')

  for (const template of DEFAULT_SYSTEM_TEMPLATES) {
    try {
      const existing = await prisma.emailTemplate.findUnique({
        where: { slug: template.slug },
      })

      if (existing) {
        console.log(`Template "${template.slug}" already exists, skipping...`)
        continue
      }

      const created = await prisma.emailTemplate.create({
        data: {
          name: template.name,
          slug: template.slug,
          subject: template.subject,
          description: template.description,
          category: template.category,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          variables: template.variables,
          previewData: template.previewData,
          isSystem: true,
          isActive: true,
        },
      })

      // Create initial version
      await prisma.emailTemplateVersion.create({
        data: {
          templateId: created.id,
          version: 1,
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          changeNote: 'Initial system template',
        },
      })

      console.log(`Created template: ${template.name} (${template.slug})`)
    } catch (error) {
      console.error(`Error creating template "${template.slug}":`, error)
    }
  }

  console.log('Email template seed complete!')
}

seedEmailTemplates()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

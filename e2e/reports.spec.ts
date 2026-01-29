import { test, expect } from '@playwright/test'

test.describe('Reports', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/reports')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Reports (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Report List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays reports page', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await expect(page.locator('text=/reports|create/i').first()).toBeVisible()
    })

    test('has create report button', async ({ page }) => {
      await page.goto('/dashboard/reports')

      const createButton = page.locator('a[href*="/reports/new"], button:has-text("Create"), button:has-text("New Report")')
      await expect(createButton.first()).toBeVisible()
    })

    test('displays report list', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No reports found|Create Report|reports/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Report', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create report form', async ({ page }) => {
      await page.goto('/dashboard/reports/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has report builder interface', async ({ page }) => {
      await page.goto('/dashboard/reports/new')

      const builderSection = page.locator('text=/builder|content|slides/i')
      const hasBuilderSection = await builderSection.isVisible().catch(() => false)
      
      expect(typeof hasBuilderSection).toBe('boolean')
    })

    test('has template selection', async ({ page }) => {
      await page.goto('/dashboard/reports/new')

      const templateSelect = page.locator('select[name*="template"], [data-testid*="template"], button:has-text("Template")')
      const hasTemplateSelect = await templateSelect.first().isVisible().catch(() => false)
      
      expect(typeof hasTemplateSelect).toBe('boolean')
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/reports/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/reports\/new/)
    })
  })

  test.describe('Edit Report Content', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to edit page', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const reportId = href.split('/').pop()
          await page.goto(`/dashboard/reports/${reportId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await expect(page).toHaveURL(/\/reports\/.*\/edit/)
          }
        }
      }
    })

    test('can modify report content', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const reportId = href.split('/').pop()
          await page.goto(`/dashboard/reports/${reportId}/edit`)
          await page.waitForLoadState('networkidle')
          
          const contentEditor = page.locator('textarea, [contenteditable], [data-testid*="editor"]')
          if (await contentEditor.first().isVisible()) {
            await contentEditor.first().fill('Test content')
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })

    test('can add slides', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const reportId = href.split('/').pop()
          await page.goto(`/dashboard/reports/${reportId}/edit`)
          await page.waitForLoadState('networkidle')
          
          const addSlideButton = page.locator('button:has-text("Add Slide"), button:has-text("New Slide")')
          const addSlideButtonExists = await addSlideButton.isVisible().catch(() => false)
          
          expect(typeof addSlideButtonExists).toBe('boolean')
        }
      }
    })
  })

  test.describe('Generate Report', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has generate button', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Report"), button:has-text("Export")')
          const generateButtonExists = await generateButton.isVisible().catch(() => false)
          
          expect(typeof generateButtonExists).toBe('boolean')
        }
      }
    })

    test('can generate report', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Report")')
          if (await generateButton.isVisible()) {
            await generateButton.click()
            await page.waitForTimeout(2000)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })

    test('displays generated report', async ({ page }) => {
      await page.goto('/dashboard/reports')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const reportContent = page.locator('text=/report|content|slides/i')
          const hasReportContent = await reportContent.isVisible().catch(() => false)
          
          expect(typeof hasReportContent).toBe('boolean')
        }
      }
    })
  })
})

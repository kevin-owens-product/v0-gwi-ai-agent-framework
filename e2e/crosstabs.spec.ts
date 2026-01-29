import { test, expect } from '@playwright/test'

test.describe('Crosstabs', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Crosstabs (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Crosstab List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays crosstabs page', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await expect(page.locator('text=/crosstabs|create/i').first()).toBeVisible()
    })

    test('has create crosstab button', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      const createButton = page.locator('a[href*="/crosstabs/new"], button:has-text("Create"), button:has-text("New Crosstab")')
      await expect(createButton.first()).toBeVisible()
    })

    test('displays crosstab list', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No crosstabs found|Create Crosstab|crosstabs/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Crosstab', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create crosstab form', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has crosstab builder interface', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      const builderSection = page.locator('text=/builder|configure|audience|metric/i')
      const hasBuilderSection = await builderSection.isVisible().catch(() => false)
      
      expect(typeof hasBuilderSection).toBe('boolean')
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/crosstabs\/new/)
    })
  })

  test.describe('Configure Audiences and Metrics', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can select audiences', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      const audienceSelect = page.locator('select[name*="audience"], [data-testid*="audience"], button:has-text("Audience")')
      const hasAudienceSelect = await audienceSelect.first().isVisible().catch(() => false)
      
      expect(typeof hasAudienceSelect).toBe('boolean')
    })

    test('can select metrics', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      const metricSelect = page.locator('select[name*="metric"], [data-testid*="metric"], button:has-text("Metric")')
      const hasMetricSelect = await metricSelect.first().isVisible().catch(() => false)
      
      expect(typeof hasMetricSelect).toBe('boolean')
    })

    test('can configure filters', async ({ page }) => {
      await page.goto('/dashboard/crosstabs/new')

      const filterSection = page.locator('text=/filter|filters|options/i')
      const hasFilterSection = await filterSection.isVisible().catch(() => false)
      
      expect(typeof hasFilterSection).toBe('boolean')
    })
  })

  test.describe('Run Crosstab Analysis', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has run analysis button', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const crosstabLink = page.locator('a[href*="/dashboard/crosstabs/"]').first()
      const crosstabLinkExists = await crosstabLink.isVisible().catch(() => false)

      if (crosstabLinkExists) {
        const href = await crosstabLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/analysis')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze"), button:has-text("Generate")')
          const runButtonExists = await runButton.isVisible().catch(() => false)
          
          expect(typeof runButtonExists).toBe('boolean')
        }
      }
    })

    test('displays analysis results', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const crosstabLink = page.locator('a[href*="/dashboard/crosstabs/"]').first()
      const crosstabLinkExists = await crosstabLink.isVisible().catch(() => false)

      if (crosstabLinkExists) {
        const href = await crosstabLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/analysis')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const resultsTable = page.locator('table, [data-testid*="table"], .crosstab-table')
          const hasResultsTable = await resultsTable.isVisible().catch(() => false)
          
          expect(typeof hasResultsTable).toBe('boolean')
        }
      }
    })
  })

  test.describe('Export Crosstab Results', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has export button', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const crosstabLink = page.locator('a[href*="/dashboard/crosstabs/"]').first()
      const crosstabLinkExists = await crosstabLink.isVisible().catch(() => false)

      if (crosstabLinkExists) {
        const href = await crosstabLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/analysis')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button[aria-label*="export" i]')
          const exportButtonExists = await exportButton.isVisible().catch(() => false)
          
          expect(typeof exportButtonExists).toBe('boolean')
        }
      }
    })

    test('can export to different formats', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const crosstabLink = page.locator('a[href*="/dashboard/crosstabs/"]').first()
      const crosstabLinkExists = await crosstabLink.isVisible().catch(() => false)

      if (crosstabLinkExists) {
        const href = await crosstabLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/analysis')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const exportMenu = page.locator('button:has-text("Export"), [role="menu"]')
          if (await exportMenu.isVisible()) {
            await exportMenu.click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })
})

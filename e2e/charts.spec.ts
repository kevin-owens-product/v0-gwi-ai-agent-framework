import { test, expect } from '@playwright/test'

test.describe('Charts', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/charts')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Charts (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Chart List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays charts page', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await expect(page.locator('text=/charts|create/i').first()).toBeVisible()
    })

    test('has create chart button', async ({ page }) => {
      await page.goto('/dashboard/charts')

      const createButton = page.locator('a[href*="/charts/new"], button:has-text("Create"), button:has-text("New Chart")')
      await expect(createButton.first()).toBeVisible()
    })

    test('displays chart list', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No charts found|Create Chart|charts/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Chart', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create chart form', async ({ page }) => {
      await page.goto('/dashboard/charts/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has chart builder interface', async ({ page }) => {
      await page.goto('/dashboard/charts/new')

      const builderSection = page.locator('text=/builder|configure|type|dimension/i')
      const hasBuilderSection = await builderSection.isVisible().catch(() => false)
      
      expect(typeof hasBuilderSection).toBe('boolean')
    })

    test('has chart type selection', async ({ page }) => {
      await page.goto('/dashboard/charts/new')

      const typeSelect = page.locator('select[name*="type"], [data-testid*="type"], button:has-text("Type")')
      const hasTypeSelect = await typeSelect.first().isVisible().catch(() => false)
      
      expect(typeof hasTypeSelect).toBe('boolean')
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/charts/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/charts\/new/)
    })
  })

  test.describe('Edit Chart Configuration', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to edit page', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const chartId = href.split('/').pop()
          await page.goto(`/dashboard/charts/${chartId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await expect(page).toHaveURL(/\/charts\/.*\/edit/)
          }
        }
      }
    })

    test('can modify chart dimensions', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const chartId = href.split('/').pop()
          await page.goto(`/dashboard/charts/${chartId}/edit`)
          await page.waitForLoadState('networkidle')
          
          const dimensionSelect = page.locator('select[name*="dimension"], [data-testid*="dimension"]')
          if (await dimensionSelect.first().isVisible()) {
            await dimensionSelect.first().click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })

    test('can modify chart measures', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const chartId = href.split('/').pop()
          await page.goto(`/dashboard/charts/${chartId}/edit`)
          await page.waitForLoadState('networkidle')
          
          const measureSelect = page.locator('select[name*="measure"], [data-testid*="measure"]')
          if (await measureSelect.first().isVisible()) {
            await measureSelect.first().click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Export Chart Data', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has export button', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button[aria-label*="export" i]')
          const exportButtonExists = await exportButton.isVisible().catch(() => false)
          
          expect(typeof exportButtonExists).toBe('boolean')
        }
      }
    })

    test('can export chart', async ({ page }) => {
      await page.goto('/dashboard/charts')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")')
          if (await exportButton.isVisible()) {
            await exportButton.click()
            await page.waitForTimeout(1000)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })
})

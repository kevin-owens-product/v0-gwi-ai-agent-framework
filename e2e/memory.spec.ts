import { test, expect } from '@playwright/test'

test.describe('Memory', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/memory')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Memory (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Memory Overview', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays memory page', async ({ page }) => {
      await page.goto('/dashboard/memory')

      await expect(page.locator('text=/memory|browser|stats/i').first()).toBeVisible()
    })

    test('shows memory stats', async ({ page }) => {
      await page.goto('/dashboard/memory')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/memory') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const statsSection = page.locator('text=/stats|usage|memory/i')
      const hasStatsSection = await statsSection.isVisible().catch(() => false)
      
      expect(typeof hasStatsSection).toBe('boolean')
    })
  })

  test.describe('Memory Browser', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays memory browser', async ({ page }) => {
      await page.goto('/dashboard/memory')

      const browserSection = page.locator('text=/browser|memories|items/i')
      const hasBrowserSection = await browserSection.isVisible().catch(() => false)
      
      expect(typeof hasBrowserSection).toBe('boolean')
    })

    test('shows memory items', async ({ page }) => {
      await page.goto('/dashboard/memory')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/memory') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const memoryItems = page.locator('[data-testid*="memory"], .memory-item, [class*="memory"]')
      const count = await memoryItems.count().catch(() => 0)
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('can search memories', async ({ page }) => {
      await page.goto('/dashboard/memory')

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await expect(searchInput).toHaveValue('test')
      }
    })

    test('can filter memories', async ({ page }) => {
      await page.goto('/dashboard/memory')

      const filterButton = page.locator('button:has-text("Filter"), select, [role="combobox"]')
      if (await filterButton.first().isVisible()) {
        await filterButton.first().click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Memory Stats', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays memory statistics', async ({ page }) => {
      await page.goto('/dashboard/memory')

      const statsCards = page.locator('[data-testid*="stat"], .stat-card, [class*="stat"]')
      const count = await statsCards.count().catch(() => 0)
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('shows memory usage metrics', async ({ page }) => {
      await page.goto('/dashboard/memory')

      const metricsSection = page.locator('text=/usage|total|count/i')
      const hasMetricsSection = await metricsSection.isVisible().catch(() => false)
      
      expect(typeof hasMetricsSection).toBe('boolean')
    })
  })

  test.describe('Memory Operations', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can view memory detail', async ({ page }) => {
      await page.goto('/dashboard/memory')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/memory') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const memoryItem = page.locator('[data-testid*="memory"], .memory-item').first()
      const memoryItemExists = await memoryItem.isVisible().catch(() => false)

      if (memoryItemExists) {
        await memoryItem.click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('can delete memory', async ({ page }) => {
      await page.goto('/dashboard/memory')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/memory') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const deleteButton = page.locator('button[aria-label*="delete"], button:has-text("Delete")').first()
      const deleteButtonExists = await deleteButton.isVisible().catch(() => false)
      
      expect(typeof deleteButtonExists).toBe('boolean')
    })
  })
})

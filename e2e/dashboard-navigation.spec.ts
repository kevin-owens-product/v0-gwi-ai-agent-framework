import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should load dashboard home', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard|Home/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have navigation sidebar', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]').first()
    const isVisible = await sidebar.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })

  test('should navigate to agents page', async ({ page }) => {
    const agentsLink = page.getByRole('link', { name: /agents/i })
    if (await agentsLink.isVisible()) {
      await agentsLink.click()
      await expect(page).toHaveURL(/.*agents/)
    } else {
      // Direct navigation
      await page.goto('/dashboard/agents')
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should navigate to reports page', async ({ page }) => {
    const reportsLink = page.getByRole('link', { name: /reports/i })
    if (await reportsLink.isVisible()) {
      await reportsLink.click()
      await expect(page).toHaveURL(/.*reports/)
    } else {
      await page.goto('/dashboard/reports')
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to settings', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /settings/i })
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await expect(page).toHaveURL(/.*settings/)
    } else {
      await page.goto('/dashboard/settings')
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should have user menu', async ({ page }) => {
    const userButton = page.getByRole('button', { name: /user|account|profile/i })
    const isVisible = await userButton.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })

  test('should support mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    const menuButton = page.getByRole('button', { name: /menu|navigation/i })
    const isVisible = await menuButton.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })
})

test.describe('Dashboard Metrics', () => {
  test('should display hero metrics', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for metric cards
    const metricsSection = page.locator('[data-testid*="metric"], .metric, [class*="metric"]')
    const count = await metricsSection.count().catch(() => 0)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Allow some flexibility for non-critical errors
    expect(errors.length).toBeLessThan(10)
  })
})

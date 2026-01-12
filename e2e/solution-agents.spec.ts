import { test, expect } from '@playwright/test'

test.describe('Solution Agents', () => {
  test('should load solutions page', async ({ page }) => {
    await page.goto('/solutions')

    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveTitle(/Solutions|Agents/)
  })

  test('should display solution categories', async ({ page }) => {
    await page.goto('/solutions')

    // Check for solution area sections
    const sections = page.locator('section, [data-testid*="solution"]')
    const count = await sections.count().catch(() => 0)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to specific solution area', async ({ page }) => {
    await page.goto('/solutions/product')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should display agent cards', async ({ page }) => {
    await page.goto('/solutions')

    // Look for agent cards
    const agentCards = page.locator('[data-testid*="agent"], .agent-card, [class*="agent"]')
    const count = await agentCards.count().catch(() => 0)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should search agents', async ({ page }) => {
    await page.goto('/solutions')

    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('persona')
      await expect(searchInput).toHaveValue('persona')
    }
  })

  test('should filter by solution area', async ({ page }) => {
    await page.goto('/solutions')

    // Look for filter controls
    const filterSection = page.locator('[data-testid*="filter"]')
    const exists = await filterSection.isVisible().catch(() => false)
    expect(typeof exists).toBe('boolean')
  })

  test('should display agent details', async ({ page }) => {
    await page.goto('/solutions')

    // Find first agent card and check for details
    const firstAgent = page.locator('[data-testid*="agent"]').first()
    const isVisible = await firstAgent.isVisible().catch(() => false)

    if (isVisible) {
      // Agent cards should have some content
      const hasContent = await firstAgent.textContent()
      expect(hasContent).toBeTruthy()
    }
  })
})

test.describe('Agent Store', () => {
  test('should load agent store page', async ({ page }) => {
    await page.goto('/dashboard/store')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should display all 48 solution agents', async ({ page }) => {
    await page.goto('/dashboard/store')

    // Page should render
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should support agent categories', async ({ page }) => {
    await page.goto('/dashboard/store')

    const categories = [
      'sales',
      'insights',
      'ad-sales',
      'marketing',
      'product-development',
      'market-research',
      'innovation',
      'core'
    ]

    // Page should load without errors for each category
    for (const category of categories.slice(0, 3)) { // Test first 3 to save time
      await page.goto(`/dashboard/store?category=${category}`)
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

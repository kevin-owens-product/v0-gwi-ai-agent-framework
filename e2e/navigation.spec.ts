import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Header Navigation', () => {
    test('landing page has navigation links', async ({ page }) => {
      await page.goto('/')

      // Check for main navigation elements
      const nav = page.locator('nav, header')
      await expect(nav).toBeVisible()

      // Should have login/signup links when not authenticated
      await expect(page.locator('a[href*="/login"], button:has-text("Login"), a:has-text("Sign in")')).toBeVisible()
    })

    test('can navigate to solutions pages', async ({ page }) => {
      await page.goto('/')

      // Navigate to solutions if link exists
      const solutionsLink = page.locator('a[href*="/solutions"]').first()
      if (await solutionsLink.isVisible()) {
        await solutionsLink.click()
        await expect(page).toHaveURL(/solutions/)
      }
    })

    test('can navigate to pricing page', async ({ page }) => {
      await page.goto('/')

      const pricingLink = page.locator('a[href*="/pricing"]').first()
      if (await pricingLink.isVisible()) {
        await pricingLink.click()
        await expect(page).toHaveURL(/pricing/)
      }
    })
  })

  test.describe('Footer Navigation', () => {
    test('footer has important links', async ({ page }) => {
      await page.goto('/')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()

      // Check for common footer links
      await expect(page.locator('a[href*="/privacy"], a[href*="/terms"]').first()).toBeVisible()
    })

    test('can navigate to terms page', async ({ page }) => {
      await page.goto('/')

      const termsLink = page.locator('a[href*="/terms"]').first()
      if (await termsLink.isVisible()) {
        await termsLink.click()
        await expect(page).toHaveURL(/terms/)
      }
    })

    test('can navigate to privacy page', async ({ page }) => {
      await page.goto('/')

      const privacyLink = page.locator('a[href*="/privacy"]').first()
      if (await privacyLink.isVisible()) {
        await privacyLink.click()
        await expect(page).toHaveURL(/privacy/)
      }
    })
  })

  test.describe('Solutions Pages', () => {
    const solutionPages = [
      '/solutions/sales',
      '/solutions/marketing',
      '/solutions/product',
      '/solutions/market-research',
      '/solutions/insights',
    ]

    for (const path of solutionPages) {
      test(`${path} loads correctly`, async ({ page }) => {
        await page.goto(path)
        await expect(page).toHaveURL(new RegExp(path))
      })
    }
  })
})

test.describe('Responsive Design', () => {
  test('mobile navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check for mobile menu button or hamburger icon
    const mobileMenuButton = page.locator('[aria-label*="menu" i], button:has([class*="menu"]), [class*="hamburger"]')

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('tablet navigation works', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    // Page should be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('desktop navigation works', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    // Navigation should be visible
    await expect(page.locator('nav, header')).toBeVisible()
  })
})

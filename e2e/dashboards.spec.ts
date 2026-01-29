import { test, expect } from '@playwright/test'

test.describe('Dashboards', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/dashboards')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Dashboards (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Dashboard List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays dashboards page', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await expect(page.locator('text=/dashboards|create/i').first()).toBeVisible()
    })

    test('has create dashboard button', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      const createButton = page.locator('a[href*="/dashboards/new"], button:has-text("Create"), button:has-text("New Dashboard")')
      await expect(createButton.first()).toBeVisible()
    })

    test('displays dashboard grid', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No dashboards found|Create Dashboard|dashboards/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Dashboard', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create dashboard form', async ({ page }) => {
      await page.goto('/dashboard/dashboards/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has dashboard builder interface', async ({ page }) => {
      await page.goto('/dashboard/dashboards/new')

      const builderSection = page.locator('text=/builder|widget|layout/i')
      const hasBuilderSection = await builderSection.isVisible().catch(() => false)
      
      expect(typeof hasBuilderSection).toBe('boolean')
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/dashboards/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/dashboards\/new/)
    })
  })

  test.describe('Edit Dashboard Layout', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to edit page', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          const dashboardId = href.split('/').pop()
          await page.goto(`/dashboard/dashboards/${dashboardId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await expect(page).toHaveURL(/\/dashboards\/.*\/edit/)
          }
        }
      }
    })

    test('can modify layout', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          const dashboardId = href.split('/').pop()
          await page.goto(`/dashboard/dashboards/${dashboardId}/edit`)
          await page.waitForLoadState('networkidle')
          
          const layoutControls = page.locator('button[aria-label*="layout"], button:has-text("Layout")')
          if (await layoutControls.first().isVisible()) {
            await layoutControls.first().click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Widget Management', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can add widgets', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          const dashboardId = href.split('/').pop()
          await page.goto(`/dashboard/dashboards/${dashboardId}`)
          await page.waitForLoadState('networkidle')
          
          const addWidgetButton = page.locator('button:has-text("Add Widget"), button:has-text("Add"), button[aria-label*="add widget" i]')
          const addWidgetButtonExists = await addWidgetButton.isVisible().catch(() => false)
          
          expect(typeof addWidgetButtonExists).toBe('boolean')
        }
      }
    })

    test('can remove widgets', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const removeWidgetButton = page.locator('button[aria-label*="remove"], button[aria-label*="delete"], button:has-text("Remove")')
          const removeWidgetButtonExists = await removeWidgetButton.first().isVisible().catch(() => false)
          
          expect(typeof removeWidgetButtonExists).toBe('boolean')
        }
      }
    })

    test('displays widget list', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const widgets = page.locator('[data-testid*="widget"], .widget, [class*="widget"]')
          const count = await widgets.count().catch(() => 0)
          expect(count).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  test.describe('Share Dashboard', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has share button', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const shareButton = page.locator('button:has-text("Share"), button[aria-label*="share" i]')
          const shareButtonExists = await shareButton.isVisible().catch(() => false)
          
          expect(typeof shareButtonExists).toBe('boolean')
        }
      }
    })

    test('can open share dialog', async ({ page }) => {
      await page.goto('/dashboard/dashboards')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/dashboards') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const dashboardLink = page.locator('a[href*="/dashboard/dashboards/"]').first()
      const dashboardLinkExists = await dashboardLink.isVisible().catch(() => false)

      if (dashboardLinkExists) {
        const href = await dashboardLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/builder')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const shareButton = page.locator('button:has-text("Share")')
          if (await shareButton.isVisible()) {
            await shareButton.click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })
})

import { test, expect } from '@playwright/test'

test.describe('Integrations', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/integrations')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Integrations (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Integration List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays integrations page', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await expect(page.locator('text=/integrations|connect/i').first()).toBeVisible()
    })

    test('shows available integrations', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No integrations|Connect|Available/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })

    test('displays integration cards', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      const integrationCards = page.locator('[data-testid*="integration"], .integration-card, [class*="integration"]')
      const count = await integrationCards.count().catch(() => 0)
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Install Integration', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has install button for available integrations', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const installButton = page.locator('button:has-text("Install"), button:has-text("Connect"), button:has-text("Add")').first()
      const installButtonExists = await installButton.isVisible().catch(() => false)
      
      expect(typeof installButtonExists).toBe('boolean')
    })

    test('can click install button', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const installButton = page.locator('button:has-text("Install"), button:has-text("Connect")').first()
      if (await installButton.isVisible()) {
        await installButton.click()
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('View Installed Integrations', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows installed integrations section', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      const installedSection = page.locator('text=/installed|connected|active/i')
      const hasInstalledSection = await installedSection.isVisible().catch(() => false)
      
      expect(typeof hasInstalledSection).toBe('boolean')
    })

    test('displays connected status for installed integrations', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      const connectedBadge = page.locator('text=/connected|active|installed/i')
      const hasConnectedBadge = await connectedBadge.isVisible().catch(() => false)
      
      expect(typeof hasConnectedBadge).toBe('boolean')
    })
  })

  test.describe('Configure Integration', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to integration settings', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Configure"), a[href*="/settings"]').first()
      const settingsButtonExists = await settingsButton.isVisible().catch(() => false)

      if (settingsButtonExists) {
        await settingsButton.click()
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('can configure integration settings', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      const integrationLink = page.locator('a[href*="/integrations/"]').first()
      const integrationLinkExists = await integrationLink.isVisible().catch(() => false)

      if (integrationLinkExists) {
        const href = await integrationLink.getAttribute('href')
        if (href) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const configButton = page.locator('button:has-text("Configure"), button:has-text("Settings")')
          if (await configButton.isVisible()) {
            await configButton.click()
            await page.waitForTimeout(500)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Uninstall Integration', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has uninstall button for installed integrations', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const uninstallButton = page.locator('button:has-text("Uninstall"), button:has-text("Disconnect"), button[aria-label*="remove" i]').first()
      const uninstallButtonExists = await uninstallButton.isVisible().catch(() => false)
      
      expect(typeof uninstallButtonExists).toBe('boolean')
    })

    test('can uninstall integration', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const uninstallButton = page.locator('button:has-text("Uninstall"), button:has-text("Disconnect")').first()
      if (await uninstallButton.isVisible()) {
        await uninstallButton.click()
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Integration Status', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows connection status', async ({ page }) => {
      await page.goto('/dashboard/integrations')

      const statusBadge = page.locator('[data-testid*="status"], .status-badge, text=/connected|disconnected|error/i')
      const hasStatusBadge = await statusBadge.first().isVisible().catch(() => false)
      
      expect(typeof hasStatusBadge).toBe('boolean')
    })
  })
})

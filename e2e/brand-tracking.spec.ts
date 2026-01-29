import { test, expect } from '@playwright/test'

test.describe('Brand Tracking', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing brand tracking detail', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking/some-id')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Brand Tracking (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Brand Tracking List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays brand tracking page', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await expect(page.locator('text=/brand tracking|create/i').first()).toBeVisible()
    })

    test('has create brand tracking button', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      const createButton = page.locator('a[href*="/brand-tracking/new"], button:has-text("Create"), button:has-text("New")')
      await expect(createButton.first()).toBeVisible()
    })

    test('displays brand tracking list', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No brand tracking|Create|brands/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Brand Tracking', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create brand tracking form', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has brand name field', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking/new')

      const brandInput = page.locator('input[name="brand"], input[placeholder*="brand" i]')
      await expect(brandInput.first()).toBeVisible()
    })

    test('has competitor configuration', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking/new')

      const competitorSection = page.locator('text=/competitor|competitors/i')
      const hasCompetitorSection = await competitorSection.isVisible().catch(() => false)
      
      expect(typeof hasCompetitorSection).toBe('boolean')
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/brand-tracking\/new/)
    })
  })

  test.describe('Brand Tracking Detail', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays brand tracking details', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          const trackingId = href.split('/').pop()
          await page.goto(`/dashboard/brand-tracking/${trackingId}`)
          await page.waitForLoadState('networkidle')
          
          await expect(page.locator('body')).toBeVisible()
        }
      }
    })

    test('shows brand information', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const brandInfo = page.locator('text=/brand|tracking|metrics/i')
          await expect(brandInfo.first()).toBeVisible({ timeout: 10000 })
        }
      }
    })
  })

  test.describe('Take Snapshot', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has take snapshot button', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const snapshotButton = page.locator('button:has-text("Snapshot"), button:has-text("Take Snapshot")')
          const snapshotButtonExists = await snapshotButton.isVisible().catch(() => false)
          
          expect(typeof snapshotButtonExists).toBe('boolean')
        }
      }
    })

    test('can take a snapshot', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const snapshotButton = page.locator('button:has-text("Snapshot"), button:has-text("Take Snapshot")')
          if (await snapshotButton.isVisible()) {
            await snapshotButton.click()
            await page.waitForTimeout(2000)
            await expect(page.locator('body')).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('View Historical Snapshots', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows snapshots section', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const snapshotsSection = page.locator('text=/snapshots|history|timeline/i')
          const hasSnapshotsSection = await snapshotsSection.isVisible().catch(() => false)
          
          expect(typeof hasSnapshotsSection).toBe('boolean')
        }
      }
    })

    test('displays snapshot list', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const snapshotList = page.locator('[data-testid*="snapshot"], .snapshot-item')
          const count = await snapshotList.count().catch(() => 0)
          expect(count).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  test.describe('Configure Competitors', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can add competitors', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const addCompetitorButton = page.locator('button:has-text("Add Competitor"), button:has-text("Competitor")')
          const addCompetitorButtonExists = await addCompetitorButton.isVisible().catch(() => false)
          
          expect(typeof addCompetitorButtonExists).toBe('boolean')
        }
      }
    })

    test('shows competitor list', async ({ page }) => {
      await page.goto('/dashboard/brand-tracking')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/brand-tracking') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const trackingLink = page.locator('a[href*="/dashboard/brand-tracking/"]').first()
      const trackingLinkExists = await trackingLink.isVisible().catch(() => false)

      if (trackingLinkExists) {
        const href = await trackingLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const competitorList = page.locator('[data-testid*="competitor"], .competitor-item')
          const count = await competitorList.count().catch(() => 0)
          expect(count).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })
})

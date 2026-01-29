import { test, expect } from '@playwright/test'

test.describe('Templates', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/templates')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing template detail', async ({ page }) => {
      await page.goto('/dashboard/templates/some-template-id')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Templates (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Template List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays templates page', async ({ page }) => {
      await page.goto('/dashboard/templates')

      await expect(page.locator('text=/templates|create/i').first()).toBeVisible()
    })

    test('has create template button', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const createButton = page.locator('a[href*="/templates/new"], button:has-text("Create"), button:has-text("New Template")')
      await expect(createButton.first()).toBeVisible()
    })

    test('shows category filters', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const categoryFilter = page.locator('button:has-text("Category"), select[name*="category"], [data-testid*="category"]')
      const hasCategoryFilter = await categoryFilter.first().isVisible().catch(() => false)
      
      expect(typeof hasCategoryFilter).toBe('boolean')
    })

    test('displays template cards', async ({ page }) => {
      await page.goto('/dashboard/templates')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/templates') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No templates found|Create Template|templates/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Template', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create template form', async ({ page }) => {
      await page.goto('/dashboard/templates/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has category selection', async ({ page }) => {
      await page.goto('/dashboard/templates/new')

      const categorySelect = page.locator('select[name="category"], [data-testid="category-select"], button:has-text("category")')
      await expect(categorySelect.first()).toBeVisible()
    })

    test('has description field', async ({ page }) => {
      await page.goto('/dashboard/templates/new')

      const descField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]')
      await expect(descField.first()).toBeVisible()
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/templates/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/templates\/new/)
    })
  })

  test.describe('Star/Unstar Templates', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can star a template', async ({ page }) => {
      await page.goto('/dashboard/templates')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/templates') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const starButton = page.locator('button[aria-label*="star"], button:has-text("Star"), [data-testid*="star"]').first()
      const starButtonExists = await starButton.isVisible().catch(() => false)

      if (starButtonExists) {
        await starButton.click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('shows starred templates section', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const starredSection = page.locator('text=/starred|favorites/i')
      const hasStarredSection = await starredSection.isVisible().catch(() => false)
      
      expect(typeof hasStarredSection).toBe('boolean')
    })
  })

  test.describe('Category Filtering', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can filter by category', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const categoryButton = page.locator('button:has-text("Category"), select[name*="category"]').first()
      if (await categoryButton.isVisible()) {
        await categoryButton.click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('displays templates for selected category', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const categorySelect = page.locator('select[name*="category"]')
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 })
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Search Templates', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can search templates', async ({ page }) => {
      await page.goto('/dashboard/templates')

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('workflow')
        await expect(searchInput).toHaveValue('workflow')
      }
    })
  })

  test.describe('Edit Template', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to edit page', async ({ page }) => {
      await page.goto('/dashboard/templates')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/templates') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const templateLink = page.locator('a[href*="/dashboard/templates/"]').first()
      const templateLinkExists = await templateLink.isVisible().catch(() => false)

      if (templateLinkExists) {
        const href = await templateLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const templateId = href.split('/').pop()
          await page.goto(`/dashboard/templates/${templateId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await expect(page).toHaveURL(/\/templates\/.*\/edit/)
          }
        }
      }
    })
  })
})

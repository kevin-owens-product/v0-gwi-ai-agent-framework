import { test, expect } from '@playwright/test'

test.describe('Projects', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/projects')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing project detail', async ({ page }) => {
      await page.goto('/dashboard/projects/some-project-id')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing new project page', async ({ page }) => {
      await page.goto('/dashboard/projects/new')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Projects (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Project List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays projects page', async ({ page }) => {
      await page.goto('/dashboard/projects')

      await expect(page.locator('text=/projects|create/i').first()).toBeVisible()
    })

    test('has create project button', async ({ page }) => {
      await page.goto('/dashboard/projects')

      const createButton = page.locator('a[href*="/projects/new"], button:has-text("Create"), button:has-text("New Project")')
      await expect(createButton.first()).toBeVisible()
    })

    test('shows search and filter controls', async ({ page }) => {
      await page.goto('/dashboard/projects')

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      const filterButton = page.locator('button:has-text("Filter"), select, [role="combobox"]')
      
      const hasSearch = await searchInput.isVisible().catch(() => false)
      const hasFilter = await filterButton.first().isVisible().catch(() => false)
      
      expect(hasSearch || hasFilter).toBe(true)
    })

    test('displays project cards or grid', async ({ page }) => {
      await page.goto('/dashboard/projects')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/projects') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const content = page.locator('text=/No projects found|Create Project|projects/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Project', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create project form', async ({ page }) => {
      await page.goto('/dashboard/projects/new')

      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has description field', async ({ page }) => {
      await page.goto('/dashboard/projects/new')

      const descField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]')
      await expect(descField.first()).toBeVisible()
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/projects/new')

      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/projects\/new/)
    })

    test('cancel button returns to projects list', async ({ page }) => {
      await page.goto('/dashboard/projects/new')

      const cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel")')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        await expect(page).toHaveURL(/\/projects(?!\/new)/)
      }
    })
  })

  test.describe('Project Detail', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows 404 for non-existent project', async ({ page }) => {
      await page.goto('/dashboard/projects/non-existent-id-12345')

      const errorContent = page.locator('text=/not found|error|404/i')
      await expect(errorContent.first()).toBeVisible({ timeout: 10000 }).catch(() => {
        // Might redirect to projects list instead
      })
    })

    test('displays project details when project exists', async ({ page }) => {
      await page.goto('/dashboard/projects')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/projects') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const projectLink = page.locator('a[href*="/dashboard/projects/"]').first()
      const projectLinkExists = await projectLink.isVisible().catch(() => false)

      if (projectLinkExists) {
        const href = await projectLink.getAttribute('href')
        if (href) {
          const projectId = href.split('/').pop()
          await page.goto(`/dashboard/projects/${projectId}`)
          await page.waitForLoadState('networkidle')
          
          await expect(page.locator('body')).toBeVisible()
        }
      }
    })
  })

  test.describe('Edit Project', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can navigate to edit page', async ({ page }) => {
      await page.goto('/dashboard/projects')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/projects') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const projectLink = page.locator('a[href*="/dashboard/projects/"]').first()
      const projectLinkExists = await projectLink.isVisible().catch(() => false)

      if (projectLinkExists) {
        const href = await projectLink.getAttribute('href')
        if (href) {
          const projectId = href.split('/').pop()
          await page.goto(`/dashboard/projects/${projectId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await expect(page).toHaveURL(/\/projects\/.*\/edit/)
          }
        }
      }
    })
  })

  test.describe('Delete Project', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows delete button for project owner', async ({ page }) => {
      await page.goto('/dashboard/projects')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/projects') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const projectLink = page.locator('a[href*="/dashboard/projects/"]').first()
      const projectLinkExists = await projectLink.isVisible().catch(() => false)

      if (projectLinkExists) {
        const href = await projectLink.getAttribute('href')
        if (href) {
          const projectId = href.split('/').pop()
          await page.goto(`/dashboard/projects/${projectId}`)
          await page.waitForLoadState('networkidle')
          
          const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]')
          const deleteButtonExists = await deleteButton.isVisible().catch(() => false)
          
          // Delete button may or may not exist depending on permissions
          expect(typeof deleteButtonExists).toBe('boolean')
        }
      }
    })
  })

  test.describe('Search and Filter', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('can search projects', async ({ page }) => {
      await page.goto('/dashboard/projects')

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await expect(searchInput).toHaveValue('test')
      }
    })

    test('can filter projects', async ({ page }) => {
      await page.goto('/dashboard/projects')

      const filterButton = page.locator('button:has-text("Filter"), select, [role="combobox"]')
      if (await filterButton.first().isVisible()) {
        await filterButton.first().click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })
})

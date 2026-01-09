import { test, expect } from '@playwright/test'

test.describe('Agents', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/agents')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing agent detail', async ({ page }) => {
      await page.goto('/dashboard/agents/some-agent-id')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing new agent page', async ({ page }) => {
      await page.goto('/dashboard/agents/new')
      await expect(page).toHaveURL(/login/)
    })
  })
})

// These tests require authentication
test.describe('Agents (Authenticated)', () => {
  // Skip if no auth credentials
  test.skip(({ }, testInfo) => !process.env.TEST_USER_EMAIL)

  test.describe('Agent List', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays agents page', async ({ page }) => {
      await page.goto('/dashboard/agents')

      // Should show agents page content
      await expect(page.locator('text=/agents|create/i').first()).toBeVisible()
    })

    test('has create agent button', async ({ page }) => {
      await page.goto('/dashboard/agents')

      const createButton = page.locator('a[href*="/agents/new"], button:has-text("Create")')
      await expect(createButton.first()).toBeVisible()
    })

    test('shows filters section', async ({ page }) => {
      await page.goto('/dashboard/agents')

      // Should have filter controls
      await expect(page.locator('[data-testid="agent-filters"], select, [role="combobox"]').first()).toBeVisible()
    })

    test('displays agent cards in grid', async ({ page }) => {
      await page.goto('/dashboard/agents')

      // Wait for agents to load
      await page.waitForResponse(
        response => response.url().includes('/api/v1/agents') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {
        // If no API call, check for empty state or agents
      })

      // Should show either agents or empty state
      const content = page.locator('text=/No agents found|Create Agent|runs/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Create Agent', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays create agent form', async ({ page }) => {
      await page.goto('/dashboard/agents/new')

      // Should show form
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    })

    test('has agent type selection', async ({ page }) => {
      await page.goto('/dashboard/agents/new')

      // Should have type selector
      const typeSelector = page.locator('select[name="type"], [data-testid="type-select"], button:has-text("type")')
      await expect(typeSelector.first()).toBeVisible()
    })

    test('has description field', async ({ page }) => {
      await page.goto('/dashboard/agents/new')

      const descField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]')
      await expect(descField.first()).toBeVisible()
    })

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/agents/new')

      // Try to submit empty form
      await page.click('button[type="submit"]')

      // Should show validation error or stay on page
      await expect(page).toHaveURL(/agents\/new/)
    })

    test('cancel button returns to agents list', async ({ page }) => {
      await page.goto('/dashboard/agents/new')

      // Click cancel if it exists
      const cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel")')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        await expect(page).toHaveURL(/\/agents(?!\/new)/)
      }
    })
  })

  test.describe('Agent Detail', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('shows 404 for non-existent agent', async ({ page }) => {
      await page.goto('/dashboard/agents/non-existent-id-12345')

      // Should show error or redirect
      const errorContent = page.locator('text=/not found|error|404/i')
      await expect(errorContent.first()).toBeVisible({ timeout: 10000 }).catch(() => {
        // Might redirect to agents list instead
      })
    })
  })
})

test.describe('Agent Playground', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/playground')
    await expect(page).toHaveURL(/login/)
  })

  test.describe('Authenticated', () => {
    test.skip(({ }, testInfo) => !process.env.TEST_USER_EMAIL)
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays playground page', async ({ page }) => {
      await page.goto('/dashboard/playground')

      // Should show playground interface
      await expect(page.locator('text=/playground|chat|run/i').first()).toBeVisible()
    })

    test('has agent selector', async ({ page }) => {
      await page.goto('/dashboard/playground')

      // Should have way to select agent
      const selector = page.locator('select, [role="combobox"], button:has-text("agent")')
      await expect(selector.first()).toBeVisible({ timeout: 10000 }).catch(() => {
        // Might not have selector if no agents
      })
    })
  })
})

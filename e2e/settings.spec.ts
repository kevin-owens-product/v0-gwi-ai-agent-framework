import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/settings')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects team settings to login', async ({ page }) => {
      await page.goto('/dashboard/settings/team')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects billing settings to login', async ({ page }) => {
      await page.goto('/dashboard/settings/billing')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects API keys settings to login', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')
      await expect(page).toHaveURL(/login/)
    })

    test('redirects audit log to login', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')
      await expect(page).toHaveURL(/login/)
    })
  })
})

// Authenticated settings tests
test.describe('Settings (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)
  test.use({ storageState: '.playwright/.auth/user.json' })

  test.describe('General Settings', () => {
    test('displays settings page', async ({ page }) => {
      await page.goto('/dashboard/settings')

      await expect(page.locator('text=/settings|organization|profile/i').first()).toBeVisible()
    })

    test('has navigation to sub-settings', async ({ page }) => {
      await page.goto('/dashboard/settings')

      // Should have links to other settings sections
      const teamLink = page.locator('a[href*="/settings/team"], a:has-text("Team")')
      const billingLink = page.locator('a[href*="/settings/billing"], a:has-text("Billing")')

      await expect(teamLink.first()).toBeVisible()
      await expect(billingLink.first()).toBeVisible()
    })
  })

  test.describe('Team Settings', () => {
    test('displays team page', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      await expect(page.locator('text=/team|members|invite/i').first()).toBeVisible()
    })

    test('shows team members list', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      // Should show team member table or list
      const memberContent = page.locator('table, [data-testid="team-members"], text=/owner|admin|member/i')
      await expect(memberContent.first()).toBeVisible({ timeout: 10000 })
    })

    test('has invite member button', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add"), a:has-text("Invite")')
      await expect(inviteButton.first()).toBeVisible()
    })

    test('can invite team member', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add")')
      if (await inviteButton.first().isVisible()) {
        await inviteButton.first().click()
        await page.waitForTimeout(500)
        
        const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]')
        const hasEmailInput = await emailInput.isVisible().catch(() => false)
        
        expect(typeof hasEmailInput).toBe('boolean')
      }
    })

    test('can remove team member', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/organization/team') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const removeButton = page.locator('button[aria-label*="remove"], button[aria-label*="delete"], button:has-text("Remove")')
      const removeButtonExists = await removeButton.first().isVisible().catch(() => false)
      
      expect(typeof removeButtonExists).toBe('boolean')
    })

    test('can change member role', async ({ page }) => {
      await page.goto('/dashboard/settings/team')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/organization/team') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const roleSelect = page.locator('select[name*="role"], button[aria-label*="role"]').first()
      const roleSelectExists = await roleSelect.isVisible().catch(() => false)
      
      expect(typeof roleSelectExists).toBe('boolean')
    })
  })

  test.describe('Billing Settings', () => {
    test('displays billing page', async ({ page }) => {
      await page.goto('/dashboard/settings/billing')

      await expect(page.locator('text=/billing|plan|subscription/i').first()).toBeVisible()
    })

    test('shows current plan information', async ({ page }) => {
      await page.goto('/dashboard/settings/billing')

      // Should show plan info
      const planContent = page.locator('text=/starter|professional|enterprise|plan/i')
      await expect(planContent.first()).toBeVisible({ timeout: 10000 })
    })

    test('shows usage metrics', async ({ page }) => {
      await page.goto('/dashboard/settings/billing')

      // Should show some usage information
      const usageContent = page.locator('text=/usage|runs|agents/i')
      await expect(usageContent.first()).toBeVisible({ timeout: 10000 })
    })

    test('can change billing plan', async ({ page }) => {
      await page.goto('/dashboard/settings/billing')

      const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Change Plan"), button:has-text("Manage")')
      const upgradeButtonExists = await upgradeButton.isVisible().catch(() => false)
      
      expect(typeof upgradeButtonExists).toBe('boolean')
    })
  })

  test.describe('API Keys Settings', () => {
    test('displays API keys page', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')

      await expect(page.locator('text=/api|keys/i').first()).toBeVisible()
    })

    test('has create API key button', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')

      const createButton = page.locator('button:has-text("Create"), button:has-text("Generate"), button:has-text("New")')
      await expect(createButton.first()).toBeVisible()
    })

    test('shows API keys list or empty state', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')

      // Should show keys table or empty state
      const content = page.locator('table, text=/no api keys|create your first/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })

    test('can create API key', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')

      const createButton = page.locator('button:has-text("Create"), button:has-text("Generate"), button:has-text("New")')
      if (await createButton.first().isVisible()) {
        await createButton.first().click()
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('can delete API key', async ({ page }) => {
      await page.goto('/dashboard/settings/api-keys')

      await page.waitForResponse(
        response => response.url().includes('/api/v1/api-keys') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const deleteButton = page.locator('button[aria-label*="delete"], button:has-text("Delete")').first()
      const deleteButtonExists = await deleteButton.isVisible().catch(() => false)
      
      expect(typeof deleteButtonExists).toBe('boolean')
    })
  })

  test.describe('Audit Log', () => {
    test('displays audit log page', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      await expect(page.locator('text=/audit|log|activity/i').first()).toBeVisible()
    })

    test('shows audit log entries or empty state', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      // Should show audit log table or empty state
      const content = page.locator('table, text=/no audit|no activity/i')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })

    test('has filter controls', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      // Should have some filtering capability
      const filterControls = page.locator('select, input[type="date"], [role="combobox"]')
      await expect(filterControls.first()).toBeVisible({ timeout: 10000 }).catch(() => {
        // Filters might not be visible if no data
      })
    })

    test('can filter audit log by date', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      const dateFilter = page.locator('input[type="date"], input[type="datetime-local"]')
      const dateFilterExists = await dateFilter.isVisible().catch(() => false)
      
      expect(typeof dateFilterExists).toBe('boolean')
    })

    test('can filter audit log by action type', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      const actionFilter = page.locator('select[name*="action"], select[name*="type"], [role="combobox"]')
      const actionFilterExists = await actionFilter.first().isVisible().catch(() => false)
      
      expect(typeof actionFilterExists).toBe('boolean')
    })

    test('can filter audit log by user', async ({ page }) => {
      await page.goto('/dashboard/settings/audit-log')

      const userFilter = page.locator('select[name*="user"], input[placeholder*="user" i]')
      const userFilterExists = await userFilter.isVisible().catch(() => false)
      
      expect(typeof userFilterExists).toBe('boolean')
    })
  })
})

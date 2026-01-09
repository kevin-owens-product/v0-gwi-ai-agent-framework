import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.playwright/.auth/user.json')

/**
 * Authentication setup for E2E tests
 *
 * This setup file authenticates a test user and stores the session
 * for use in other tests. Run this before tests that require authentication.
 *
 * Note: This requires a test user to exist in the database.
 * For CI/CD, ensure the database is seeded with test data.
 */
setup('authenticate', async ({ page }) => {
  // Skip if no test credentials are provided
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD

  if (!testEmail || !testPassword) {
    console.log('Skipping auth setup: TEST_USER_EMAIL and TEST_USER_PASSWORD not set')
    console.log('Tests requiring authentication will be skipped')
    return
  }

  // Navigate to login
  await page.goto('/login')

  // Wait for the form to be visible
  await expect(page.locator('form')).toBeVisible()

  // Fill credentials
  await page.fill('input[type="email"], input[name="email"]', testEmail)
  await page.fill('input[type="password"], input[name="password"]', testPassword)

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

  // Verify we're logged in
  await expect(page.locator('text=/dashboard|agents|insights/i').first()).toBeVisible()

  // Store authentication state
  await page.context().storageState({ path: authFile })
})

/**
 * Optional: Additional setup for specific test scenarios
 */
setup.describe('Additional auth scenarios', () => {
  setup.skip(({ }, testInfo) => {
    // Skip these optional setups unless explicitly enabled
    return !process.env.RUN_FULL_AUTH_SETUP
  })

  setup('create test organization', async ({ page }) => {
    // This would create a test organization for integration tests
    // Requires authenticated context
  })

  setup('seed test data', async ({ page }) => {
    // This would seed test data for specific test scenarios
    // Useful for integration tests that need specific data
  })
})

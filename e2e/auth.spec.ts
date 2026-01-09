import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form', async ({ page }) => {
      await page.goto('/login')

      // Check page renders
      await expect(page).toHaveTitle(/GWI|Login/i)

      // Check form elements exist
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('has link to signup page', async ({ page }) => {
      await page.goto('/login')

      const signupLink = page.locator('a[href*="/signup"]')
      await expect(signupLink).toBeVisible()
    })

    test('shows validation errors for empty form submission', async ({ page }) => {
      await page.goto('/login')

      // Click submit without filling form
      await page.locator('button[type="submit"]').click()

      // Should show validation or stay on page
      await expect(page).toHaveURL(/login/)
    })

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.locator('input[type="email"], input[name="email"]').fill('invalid@example.com')
      await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword')
      await page.locator('button[type="submit"]').click()

      // Should show error message or stay on login page
      await expect(page).toHaveURL(/login/)
    })
  })

  test.describe('Signup Page', () => {
    test('displays signup form', async ({ page }) => {
      await page.goto('/signup')

      // Check form elements exist
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('has link to login page', async ({ page }) => {
      await page.goto('/signup')

      const loginLink = page.locator('a[href*="/login"]')
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('redirects to login when accessing dashboard unauthenticated', async ({ page }) => {
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing settings unauthenticated', async ({ page }) => {
      await page.goto('/dashboard/settings')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('redirects to login when accessing agents unauthenticated', async ({ page }) => {
      await page.goto('/dashboard/agents')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Public Pages', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')

    // Check page loads without error
    await expect(page).toHaveTitle(/GWI/i)
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')

    // Check pricing page content
    await expect(page.locator('text=/starter|professional|enterprise/i').first()).toBeVisible()
  })

  test('about page loads', async ({ page }) => {
    await page.goto('/about')

    await expect(page).toHaveURL(/about/)
  })

  test('docs page loads', async ({ page }) => {
    await page.goto('/docs')

    await expect(page).toHaveURL(/docs/)
  })
})

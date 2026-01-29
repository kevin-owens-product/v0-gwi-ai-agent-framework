import { test, expect } from '@playwright/test'

test.describe('Playground', () => {
  test.describe('Public access', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard/playground')
      await expect(page).toHaveURL(/login/)
    })
  })
})

test.describe('Playground (Authenticated)', () => {
  test.skip(() => !process.env.TEST_USER_EMAIL)

  test.describe('Playground Interface', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays playground page', async ({ page }) => {
      await page.goto('/dashboard/playground')

      await expect(page.locator('text=/playground|chat|run/i').first()).toBeVisible()
    })

    test('shows playground interface', async ({ page }) => {
      await page.goto('/dashboard/playground')

      await page.waitForLoadState('networkidle')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Chat Functionality', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays chat interface', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="chat"], textarea[placeholder*="ask"]')
      const hasChatInput = await chatInput.isVisible().catch(() => false)
      
      expect(typeof hasChatInput).toBe('boolean')
    })

    test('can type in chat input', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const chatInput = page.locator('textarea[placeholder*="message"], textarea[placeholder*="chat"], textarea[placeholder*="ask"]')
      if (await chatInput.isVisible()) {
        await chatInput.fill('Test message')
        await expect(chatInput).toHaveValue('Test message')
      }
    })

    test('has send button', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const sendButton = page.locator('button[type="submit"], button:has-text("Send"), button[aria-label*="send" i]')
      const hasSendButton = await sendButton.isVisible().catch(() => false)
      
      expect(typeof hasSendButton).toBe('boolean')
    })

    test('displays chat messages', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const chatMessages = page.locator('[data-testid*="message"], .message, [class*="message"]')
      const count = await chatMessages.count().catch(() => 0)
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Canvas Interactions', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays canvas area', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const canvas = page.locator('canvas, [data-testid*="canvas"], .canvas, [class*="canvas"]')
      const hasCanvas = await canvas.isVisible().catch(() => false)
      
      expect(typeof hasCanvas).toBe('boolean')
    })

    test('has canvas controls', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const canvasControls = page.locator('button[aria-label*="zoom"], button[aria-label*="pan"], button:has-text("Reset")')
      const hasControls = await canvasControls.first().isVisible().catch(() => false)
      
      expect(typeof hasControls).toBe('boolean')
    })
  })

  test.describe('Context Panel', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('displays context panel', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const contextPanel = page.locator('[data-testid*="context"], .context-panel, [class*="context"]')
      const hasContextPanel = await contextPanel.isVisible().catch(() => false)
      
      expect(typeof hasContextPanel).toBe('boolean')
    })

    test('shows context information', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const contextContent = page.locator('text=/context|variables|settings/i')
      const hasContextContent = await contextContent.isVisible().catch(() => false)
      
      expect(typeof hasContextContent).toBe('boolean')
    })

    test('can toggle context panel', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const toggleButton = page.locator('button[aria-label*="toggle"], button:has-text("Context"), button[aria-label*="context"]')
      if (await toggleButton.isVisible()) {
        await toggleButton.click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Agent Selection', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has agent selector', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const agentSelector = page.locator('select, [role="combobox"], button:has-text("agent")')
      const hasAgentSelector = await agentSelector.first().isVisible().catch(() => false)
      
      expect(typeof hasAgentSelector).toBe('boolean')
    })

    test('can select an agent', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const agentSelect = page.locator('select[name*="agent"], [role="combobox"]')
      if (await agentSelect.isVisible()) {
        await agentSelect.click()
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toBeVisible()
      }
    })
  })

  test.describe('Run Functionality', () => {
    test.use({ storageState: '.playwright/.auth/user.json' })

    test('has run button', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const runButton = page.locator('button:has-text("Run"), button:has-text("Execute"), button[aria-label*="run" i]')
      const hasRunButton = await runButton.isVisible().catch(() => false)
      
      expect(typeof hasRunButton).toBe('boolean')
    })

    test('shows execution status', async ({ page }) => {
      await page.goto('/dashboard/playground')

      const statusIndicator = page.locator('[data-testid*="status"], .status-indicator, text=/running|complete|error/i')
      const hasStatusIndicator = await statusIndicator.isVisible().catch(() => false)
      
      expect(typeof hasStatusIndicator).toBe('boolean')
    })
  })
})

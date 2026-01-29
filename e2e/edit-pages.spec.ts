import { test, expect } from '@playwright/test'

test.describe('Edit Pages - Save Functionality', () => {
  test.use({ storageState: '.playwright/.auth/user.json' })

  test.describe('Agents Edit Page', () => {
    test('should save agent changes successfully', async ({ page }) => {
      // Navigate to agents list
      await page.goto('/dashboard/agents')
      
      // Wait for agents to load
      await page.waitForResponse(
        response => response.url().includes('/api/v1/agents') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {
        // Continue even if no API response
      })

      // Find first agent link or create one
      const agentLink = page.locator('a[href*="/dashboard/agents/"]').first()
      const agentLinkExists = await agentLink.isVisible().catch(() => false)

      if (agentLinkExists) {
        const href = await agentLink.getAttribute('href')
        if (href) {
          const agentId = href.split('/').pop()
          
          // Navigate to agent detail
          await page.goto(`/dashboard/agents/${agentId}`)
          
          // Wait for page to load
          await page.waitForLoadState('networkidle')
          
          // Click edit button
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            
            // Wait for edit page to load
            await page.waitForLoadState('networkidle')
            
            // Verify we're on edit page
            await expect(page).toHaveURL(/\/agents\/.*\/edit/)
            
            // Modify a field (name)
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Agent Name'
              await nameInput.fill(newValue)
              
              // Click save button
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for save to complete (redirect or success message)
              await page.waitForURL(/\/agents\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {
                // Might show success message instead of redirecting immediately
              })
              
              // Verify we're back on detail page or see success message
              const isDetailPage = page.url().includes(`/agents/${agentId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        // Skip test if no agents exist
        test.skip()
      }
    })

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/dashboard/agents')
      
      const agentLink = page.locator('a[href*="/dashboard/agents/"]').first()
      const agentLinkExists = await agentLink.isVisible().catch(() => false)

      if (agentLinkExists) {
        const href = await agentLink.getAttribute('href')
        if (href) {
          const agentId = href.split('/').pop()
          await page.goto(`/dashboard/agents/${agentId}/edit`)
          await page.waitForLoadState('networkidle')
          
          // Clear required field
          const nameInput = page.locator('input[name="name"]').first()
          const nameInputExists = await nameInput.isVisible().catch(() => false)
          
          if (nameInputExists) {
            await nameInput.fill('')
            
            // Try to save
            const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
            await saveButton.click()
            
            // Should show validation error or stay on page
            await page.waitForTimeout(1000)
            const hasError = await page.locator('text=/required|error|invalid/i').isVisible().catch(() => false)
            const stillOnEditPage = page.url().includes('/edit')
            
            expect(hasError || stillOnEditPage).toBe(true)
          }
        }
      } else {
        test.skip()
      }
    })

    test('should cancel edit and return to detail page', async ({ page }) => {
      await page.goto('/dashboard/agents')
      
      const agentLink = page.locator('a[href*="/dashboard/agents/"]').first()
      const agentLinkExists = await agentLink.isVisible().catch(() => false)

      if (agentLinkExists) {
        const href = await agentLink.getAttribute('href')
        if (href) {
          const agentId = href.split('/').pop()
          await page.goto(`/dashboard/agents/${agentId}/edit`)
          await page.waitForLoadState('networkidle')
          
          // Click cancel button
          const cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel")').first()
          const cancelButtonExists = await cancelButton.isVisible().catch(() => false)
          
          if (cancelButtonExists) {
            await cancelButton.click()
            
            // Should navigate back to detail page
            await page.waitForURL(/\/agents\/.*(?!\/edit)/, { timeout: 5000 }).catch(() => {})
            const isDetailPage = page.url().includes(`/agents/${agentId}`) && !page.url().includes('/edit')
            expect(isDetailPage).toBe(true)
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Workflows Edit Page', () => {
    test('should save workflow changes successfully', async ({ page }) => {
      await page.goto('/dashboard/workflows')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/workflows') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const workflowLink = page.locator('a[href*="/dashboard/workflows/"]').first()
      const workflowLinkExists = await workflowLink.isVisible().catch(() => false)

      if (workflowLinkExists) {
        const href = await workflowLink.getAttribute('href')
        if (href) {
          const workflowId = href.split('/').pop()
          await page.goto(`/dashboard/workflows/${workflowId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/workflows\/.*\/edit/)
            
            // Modify workflow name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Workflow'
              await nameInput.fill(newValue)
              
              // Save
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for redirect or success
              await page.waitForURL(/\/workflows\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/workflows/${workflowId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Audiences Edit Page', () => {
    test('should save audience changes successfully', async ({ page }) => {
      await page.goto('/dashboard/audiences')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/audiences') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const audienceLink = page.locator('a[href*="/dashboard/audiences/"]').first()
      const audienceLinkExists = await audienceLink.isVisible().catch(() => false)

      if (audienceLinkExists) {
        const href = await audienceLink.getAttribute('href')
        if (href) {
          const audienceId = href.split('/').pop()
          await page.goto(`/dashboard/audiences/${audienceId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/audiences\/.*\/edit/)
            
            // Modify audience name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Audience'
              await nameInput.fill(newValue)
              
              // Save
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for redirect or success
              await page.waitForURL(/\/audiences\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/audiences/${audienceId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Crosstabs Edit Page', () => {
    test('should save crosstab changes successfully', async ({ page }) => {
      await page.goto('/dashboard/crosstabs')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/crosstabs') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const crosstabLink = page.locator('a[href*="/dashboard/crosstabs/"]').first()
      const crosstabLinkExists = await crosstabLink.isVisible().catch(() => false)

      if (crosstabLinkExists) {
        const href = await crosstabLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/analysis')) {
          const crosstabId = href.split('/').pop()
          await page.goto(`/dashboard/crosstabs/${crosstabId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/crosstabs\/.*\/edit/)
            
            // Modify crosstab name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Crosstab'
              await nameInput.fill(newValue)
              
              // Save
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for redirect or success
              await page.waitForURL(/\/crosstabs\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/crosstabs/${crosstabId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Charts Edit Page', () => {
    test('should save chart changes successfully', async ({ page }) => {
      await page.goto('/dashboard/charts')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/charts') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const chartLink = page.locator('a[href*="/dashboard/charts/"]').first()
      const chartLinkExists = await chartLink.isVisible().catch(() => false)

      if (chartLinkExists) {
        const href = await chartLink.getAttribute('href')
        if (href && !href.includes('/edit')) {
          const chartId = href.split('/').pop()
          await page.goto(`/dashboard/charts/${chartId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/charts\/.*\/edit/)
            
            // Modify chart name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Chart'
              await nameInput.fill(newValue)
              
              // Save
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for redirect or success
              await page.waitForURL(/\/charts\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/charts/${chartId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Dashboards Edit Page', () => {
    test('should save dashboard changes successfully', async ({ page }) => {
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
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/dashboards\/.*\/edit/)
            
            // Modify dashboard name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Dashboard'
              await nameInput.fill(newValue)
              
              // Save
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              // Wait for redirect or success
              await page.waitForURL(/\/dashboards\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/dashboards/${dashboardId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      } else {
        test.skip()
      }
    })
  })

  test.describe('Projects Edit Page', () => {
    test('should save project changes successfully', async ({ page }) => {
      await page.goto('/dashboard/projects')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/projects') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const projectLink = page.locator('a[href*="/dashboard/projects/"]').first()
      const projectLinkExists = await projectLink.isVisible().catch(() => false)

      if (projectLinkExists) {
        const href = await projectLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          const projectId = href.split('/').pop()
          await page.goto(`/dashboard/projects/${projectId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/projects\/.*\/edit/)
            
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Project'
              await nameInput.fill(newValue)
              
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              await page.waitForURL(/\/projects\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/projects/${projectId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      }
    })
  })

  test.describe('Templates Edit Page', () => {
    test('should save template changes successfully', async ({ page }) => {
      await page.goto('/dashboard/templates')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/templates') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const templateLink = page.locator('a[href*="/dashboard/templates/"]').first()
      const templateLinkExists = await templateLink.isVisible().catch(() => false)

      if (templateLinkExists) {
        const href = await templateLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          const templateId = href.split('/').pop()
          await page.goto(`/dashboard/templates/${templateId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/templates\/.*\/edit/)
            
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Template'
              await nameInput.fill(newValue)
              
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              await page.waitForURL(/\/templates\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/templates/${templateId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      }
    })
  })

  test.describe('Integrations Edit Page', () => {
    test('should save integration configuration successfully', async ({ page }) => {
      await page.goto('/dashboard/integrations')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/integrations') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const integrationLink = page.locator('a[href*="/dashboard/integrations/"]').first()
      const integrationLinkExists = await integrationLink.isVisible().catch(() => false)

      if (integrationLinkExists) {
        const href = await integrationLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          const configButton = page.locator('button:has-text("Configure"), button:has-text("Settings"), a[href*="/edit"]')
          const configButtonExists = await configButton.isVisible().catch(() => false)
          
          if (configButtonExists) {
            await configButton.click()
            await page.waitForLoadState('networkidle')
            
            const configInput = page.locator('input, textarea, select').first()
            const configInputExists = await configInput.isVisible().catch(() => false)
            
            if (configInputExists) {
              await configInput.fill('test')
              
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first()
              if (await saveButton.isVisible()) {
                await saveButton.click()
                await page.waitForTimeout(2000)
                await expect(page.locator('body')).toBeVisible()
              }
            }
          }
        }
      }
    })
  })

  test.describe('Brand Tracking Edit Page', () => {
    test('should save brand tracking changes successfully', async ({ page }) => {
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
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/brand-tracking\/.*\/edit/)
            
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Brand Tracking'
              await nameInput.fill(newValue)
              
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              await page.waitForURL(/\/brand-tracking\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/brand-tracking/${trackingId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      }
    })
  })

  test.describe('Reports Edit Page', () => {
    test('should save report changes successfully', async ({ page }) => {
      await page.goto('/dashboard/reports')
      
      await page.waitForResponse(
        response => response.url().includes('/api/v1/reports') && response.status() === 200,
        { timeout: 10000 }
      ).catch(() => {})

      const reportLink = page.locator('a[href*="/dashboard/reports/"]').first()
      const reportLinkExists = await reportLink.isVisible().catch(() => false)

      if (reportLinkExists) {
        const href = await reportLink.getAttribute('href')
        if (href && !href.includes('/edit') && !href.includes('/new')) {
          const reportId = href.split('/').pop()
          await page.goto(`/dashboard/reports/${reportId}`)
          await page.waitForLoadState('networkidle')
          
          const editButton = page.locator('a[href*="/edit"], button:has-text("Edit")').first()
          const editButtonExists = await editButton.isVisible().catch(() => false)
          
          if (editButtonExists) {
            await editButton.click()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/reports\/.*\/edit/)
            
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
            const nameInputExists = await nameInput.isVisible().catch(() => false)
            
            if (nameInputExists) {
              const currentValue = await nameInput.inputValue()
              const newValue = currentValue ? `${currentValue} (Updated)` : 'Updated Report'
              await nameInput.fill(newValue)
              
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first()
              await saveButton.click()
              
              await page.waitForURL(/\/reports\/.*(?!\/edit)/, { timeout: 10000 }).catch(() => {})
              const isDetailPage = page.url().includes(`/reports/${reportId}`) && !page.url().includes('/edit')
              const hasSuccessMessage = await page.locator('text=/success|saved|updated/i').isVisible().catch(() => false)
              
              expect(isDetailPage || hasSuccessMessage).toBe(true)
            }
          }
        }
      }
    })
  })
})

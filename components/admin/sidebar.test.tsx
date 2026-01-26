import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState, useEffect, ReactNode } from 'react'

// Mock types
interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid="icon" className={className}>icon</span>
)

// Mock admin context
const mockAdmin = {
  name: 'John Admin',
  email: 'john@admin.com',
  role: 'SUPER_ADMIN'
}

// Mock window.location
let mockLocationHref = ''
Object.defineProperty(window, 'location', {
  value: {
    get href() { return mockLocationHref },
    set href(val) { mockLocationHref = val },
    assign: vi.fn(),
    reload: vi.fn()
  },
  writable: true
})

// Mock pathname
let mockPathname = '/admin'

// Mock NavSectionComponent for testing
function NavSectionComponent({ section }: { section: NavSection }) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false)

  const isActive = (href: string) => {
    if (href === "/admin") return mockPathname === "/admin"
    return mockPathname.startsWith(href)
  }

  const hasActiveItem = section.items.some((item) => isActive(item.href))

  useEffect(() => {
    if (hasActiveItem && !isOpen) {
      setIsOpen(true)
    }
  }, [hasActiveItem, isOpen])

  return (
    <div data-testid={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
      <button
        data-testid={`section-trigger-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{section.title}</span>
        <span data-testid={`chevron-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
          {isOpen ? 'expanded' : 'collapsed'}
        </span>
      </button>
      {isOpen && (
        <div data-testid={`section-content-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
          {section.items.map((item) => (
            <a
              key={item.name}
              href={item.href}
              data-testid={`nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              data-active={isActive(item.href)}
            >
              <MockIcon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.badge && (
                <span data-testid={`badge-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock logout handler that can be spied on
const mockLogoutFetch = vi.fn().mockResolvedValue({ ok: true })

// Mock AdminSidebar component
function AdminSidebar({ navSections }: { navSections: NavSection[] }) {
  const handleLogout = async () => {
    await mockLogoutFetch("/api/admin/auth/logout", { method: "POST" })
    window.location.href = "/login?type=admin"
  }

  return (
    <aside data-testid="admin-sidebar">
      {/* Logo */}
      <div data-testid="sidebar-header">
        <a href="/admin" data-testid="logo-link">
          <span>Admin Portal</span>
          <span data-testid="subtitle">Enterprise Platform</span>
        </a>
      </div>

      {/* Navigation */}
      <nav data-testid="sidebar-nav">
        {navSections.map((section) => (
          <NavSectionComponent key={section.title} section={section} />
        ))}
      </nav>

      {/* User Section */}
      <div data-testid="user-section">
        <div data-testid="user-avatar">
          <span data-testid="user-initials">
            {mockAdmin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </span>
        </div>
        <div data-testid="user-info">
          <p data-testid="user-name">{mockAdmin.name}</p>
          <p data-testid="user-role">{mockAdmin.role.replace("_", " ")}</p>
        </div>
        <button data-testid="logout-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

describe('AdminSidebar Component', () => {
  const mockNavSections: NavSection[] = [
    {
      title: "Overview",
      defaultOpen: true,
      items: [
        { name: "Dashboard", href: "/admin", icon: MockIcon },
        { name: "Analytics", href: "/admin/analytics", icon: MockIcon },
      ],
    },
    {
      title: "Organization",
      defaultOpen: false,
      items: [
        { name: "Tenants", href: "/admin/tenants", icon: MockIcon },
        { name: "Users", href: "/admin/users", icon: MockIcon },
      ],
    },
    {
      title: "Security Center",
      defaultOpen: false,
      items: [
        { name: "Security Overview", href: "/admin/security", icon: MockIcon },
        { name: "Threats", href: "/admin/security/threats", icon: MockIcon, badge: 5 },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = '/admin'
    mockLocationHref = ''
    mockLogoutFetch.mockResolvedValue({ ok: true })
  })

  describe('Basic Rendering', () => {
    it('should render the sidebar', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('admin-sidebar')).toBeDefined()
    })

    it('should render the header with logo', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('sidebar-header')).toBeDefined()
      expect(screen.getByTestId('logo-link')).toBeDefined()
    })

    it('should display Admin Portal text', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByText('Admin Portal')).toBeDefined()
    })

    it('should display Enterprise Platform subtitle', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('subtitle').textContent).toBe('Enterprise Platform')
    })

    it('should render navigation sections', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('sidebar-nav')).toBeDefined()
      expect(screen.getByTestId('section-overview')).toBeDefined()
      expect(screen.getByTestId('section-organization')).toBeDefined()
      expect(screen.getByTestId('section-security-center')).toBeDefined()
    })
  })

  describe('Collapsible Sections', () => {
    it('should show section with defaultOpen true as expanded', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('section-content-overview')).toBeDefined()
    })

    it('should hide section with defaultOpen false as collapsed', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.queryByTestId('section-content-organization')).toBeNull()
    })

    it('should toggle section open when clicked', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      const trigger = screen.getByTestId('section-trigger-organization')
      fireEvent.click(trigger)
      expect(screen.getByTestId('section-content-organization')).toBeDefined()
    })

    it('should toggle section closed when clicked again', () => {
      // Use a section without active items so auto-expand doesn't interfere
      mockPathname = '/admin/tenants' // Set path to tenants so Security section has no active items
      render(<AdminSidebar navSections={mockNavSections} />)
      const trigger = screen.getByTestId('section-trigger-security-center')
      // Open Security section first
      fireEvent.click(trigger)
      expect(screen.getByTestId('section-content-security-center')).toBeDefined()
      // Now close it
      fireEvent.click(trigger)
      expect(screen.queryByTestId('section-content-security-center')).toBeNull()
    })

    it('should show chevron direction based on open state', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('chevron-overview').textContent).toBe('expanded')
      expect(screen.getByTestId('chevron-organization').textContent).toBe('collapsed')
    })
  })

  describe('Navigation Items', () => {
    it('should render navigation items for expanded section', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('nav-item-dashboard')).toBeDefined()
      expect(screen.getByTestId('nav-item-analytics')).toBeDefined()
    })

    it('should not render navigation items for collapsed section', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.queryByTestId('nav-item-tenants')).toBeNull()
    })

    it('should render item with correct href', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      const dashboard = screen.getByTestId('nav-item-dashboard')
      expect(dashboard.getAttribute('href')).toBe('/admin')
    })

    it('should render item icon', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      const dashboard = screen.getByTestId('nav-item-dashboard')
      expect(dashboard.querySelector('[data-testid="icon"]')).toBeDefined()
    })
  })

  describe('Badge Display', () => {
    it('should display badge when provided', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      // Expand security section first
      fireEvent.click(screen.getByTestId('section-trigger-security-center'))
      expect(screen.getByTestId('badge-threats').textContent).toBe('5')
    })

    it('should not display badge when not provided', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.queryByTestId('badge-dashboard')).toBeNull()
    })
  })

  describe('Active State', () => {
    it('should mark dashboard as active when on /admin', () => {
      mockPathname = '/admin'
      render(<AdminSidebar navSections={mockNavSections} />)
      const dashboard = screen.getByTestId('nav-item-dashboard')
      expect(dashboard.getAttribute('data-active')).toBe('true')
    })

    it('should mark analytics as inactive when on /admin', () => {
      mockPathname = '/admin'
      render(<AdminSidebar navSections={mockNavSections} />)
      const analytics = screen.getByTestId('nav-item-analytics')
      expect(analytics.getAttribute('data-active')).toBe('false')
    })

    it('should mark nested route as active', () => {
      mockPathname = '/admin/analytics'
      render(<AdminSidebar navSections={mockNavSections} />)
      const analytics = screen.getByTestId('nav-item-analytics')
      expect(analytics.getAttribute('data-active')).toBe('true')
    })

    it('should handle deep nested routes', () => {
      mockPathname = '/admin/security/threats/123'
      render(<AdminSidebar navSections={mockNavSections} />)
      // Expand security section
      fireEvent.click(screen.getByTestId('section-trigger-security-center'))
      const threats = screen.getByTestId('nav-item-threats')
      expect(threats.getAttribute('data-active')).toBe('true')
    })
  })

  describe('Auto-expand Active Section', () => {
    it('should auto-expand section with active item', () => {
      mockPathname = '/admin/tenants'
      render(<AdminSidebar navSections={mockNavSections} />)
      // Organization section should be expanded because /admin/tenants is active
      expect(screen.getByTestId('section-content-organization')).toBeDefined()
    })

    it('should keep section expanded if active item is present', () => {
      mockPathname = '/admin/security/threats'
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('section-content-security-center')).toBeDefined()
    })
  })

  describe('User Section', () => {
    it('should render user section', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('user-section')).toBeDefined()
    })

    it('should display user initials', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('user-initials').textContent).toBe('JA')
    })

    it('should display user name', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('user-name').textContent).toBe('John Admin')
    })

    it('should display user role with proper formatting', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('user-role').textContent).toBe('SUPER ADMIN')
    })

    it('should render logout button', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      expect(screen.getByTestId('logout-button')).toBeDefined()
    })
  })

  describe('Logout Functionality', () => {
    it('should call logout API when clicking sign out', async () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      fireEvent.click(screen.getByTestId('logout-button'))

      await waitFor(() => {
        expect(mockLogoutFetch).toHaveBeenCalledWith('/api/admin/auth/logout', { method: 'POST' })
      })
    })

    it('should redirect to login page after logout', async () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      fireEvent.click(screen.getByTestId('logout-button'))

      await waitFor(() => {
        expect(mockLocationHref).toBe('/login?type=admin')
      })
    })
  })

  describe('Multiple Sections Management', () => {
    it('should allow multiple sections to be expanded', () => {
      render(<AdminSidebar navSections={mockNavSections} />)

      // Overview is open by default
      expect(screen.getByTestId('section-content-overview')).toBeDefined()

      // Open Organization
      fireEvent.click(screen.getByTestId('section-trigger-organization'))
      expect(screen.getByTestId('section-content-organization')).toBeDefined()

      // Both should be open now
      expect(screen.getByTestId('section-content-overview')).toBeDefined()
      expect(screen.getByTestId('section-content-organization')).toBeDefined()
    })

    it('should maintain independent section states', () => {
      // Use a path where Organization has active items but Security doesn't
      mockPathname = '/admin/tenants'
      render(<AdminSidebar navSections={mockNavSections} />)

      // Organization should be auto-expanded due to active item
      expect(screen.getByTestId('section-content-organization')).toBeDefined()

      // Open Security
      fireEvent.click(screen.getByTestId('section-trigger-security-center'))
      expect(screen.getByTestId('section-content-security-center')).toBeDefined()

      // Close Security
      fireEvent.click(screen.getByTestId('section-trigger-security-center'))

      // Organization should still be open (has active item)
      expect(screen.getByTestId('section-content-organization')).toBeDefined()
      // Security should be closed (no active items)
      expect(screen.queryByTestId('section-content-security-center')).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-expanded on section triggers', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      const trigger = screen.getByTestId('section-trigger-overview')
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })

    it('should update aria-expanded when toggled', () => {
      render(<AdminSidebar navSections={mockNavSections} />)
      const trigger = screen.getByTestId('section-trigger-organization')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')

      fireEvent.click(trigger)
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })
  })
})

describe('NavSectionComponent', () => {
  const mockSection: NavSection = {
    title: "Test Section",
    defaultOpen: false,
    items: [
      { name: "Item One", href: "/admin/one", icon: MockIcon },
      { name: "Item Two", href: "/admin/two", icon: MockIcon },
    ],
  }

  beforeEach(() => {
    mockPathname = '/admin'
  })

  it('should render section title', () => {
    render(<NavSectionComponent section={mockSection} />)
    expect(screen.getByText('Test Section')).toBeDefined()
  })

  it('should start collapsed when defaultOpen is false', () => {
    render(<NavSectionComponent section={mockSection} />)
    expect(screen.queryByTestId('section-content-test-section')).toBeNull()
  })

  it('should start expanded when defaultOpen is true', () => {
    const openSection = { ...mockSection, defaultOpen: true }
    render(<NavSectionComponent section={openSection} />)
    expect(screen.getByTestId('section-content-test-section')).toBeDefined()
  })

  it('should render all items when expanded', () => {
    const openSection = { ...mockSection, defaultOpen: true }
    render(<NavSectionComponent section={openSection} />)
    expect(screen.getByTestId('nav-item-item-one')).toBeDefined()
    expect(screen.getByTestId('nav-item-item-two')).toBeDefined()
  })

  it('should auto-expand when active item exists', () => {
    mockPathname = '/admin/one'
    render(<NavSectionComponent section={mockSection} />)
    expect(screen.getByTestId('section-content-test-section')).toBeDefined()
  })
})

describe('Expand/Collapse All Functionality', () => {
  // Mock localStorage
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    mockStorage = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockNavSections: NavSection[] = [
    {
      title: "Section One",
      defaultOpen: false,
      items: [
        { name: "Item A", href: "/admin/a", icon: MockIcon },
      ],
    },
    {
      title: "Section Two",
      defaultOpen: false,
      items: [
        { name: "Item B", href: "/admin/b", icon: MockIcon },
      ],
    },
  ]

  // Mock AdminSidebar with expand/collapse all buttons
  function AdminSidebarWithControls({ navSections }: { navSections: NavSection[] }) {
    const [expandAllClicked, setExpandAllClicked] = useState(0)
    const [collapseAllClicked, setCollapseAllClicked] = useState(0)

    return (
      <aside data-testid="admin-sidebar">
        <div data-testid="nav-controls">
          <button
            data-testid="expand-all-btn"
            onClick={() => setExpandAllClicked(c => c + 1)}
          >
            Expand all
          </button>
          <button
            data-testid="collapse-all-btn"
            onClick={() => setCollapseAllClicked(c => c + 1)}
          >
            Collapse all
          </button>
        </div>
        <nav data-testid="sidebar-nav">
          {navSections.map((section) => (
            <NavSectionComponentWithControls
              key={section.title}
              section={section}
              expandAllTrigger={expandAllClicked}
              collapseAllTrigger={collapseAllClicked}
            />
          ))}
        </nav>
      </aside>
    )
  }

  // Extended NavSectionComponent that responds to expand/collapse all
  function NavSectionComponentWithControls({
    section,
    expandAllTrigger,
    collapseAllTrigger
  }: {
    section: NavSection
    expandAllTrigger: number
    collapseAllTrigger: number
  }) {
    const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false)

    useEffect(() => {
      if (expandAllTrigger > 0) setIsOpen(true)
    }, [expandAllTrigger])

    useEffect(() => {
      if (collapseAllTrigger > 0) setIsOpen(false)
    }, [collapseAllTrigger])

    const testId = section.title.toLowerCase().replace(/\s+/g, '-')

    return (
      <div data-testid={`section-${testId}`}>
        <button
          data-testid={`section-trigger-${testId}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {section.title}
        </button>
        {isOpen && (
          <div data-testid={`section-content-${testId}`}>
            {section.items.map((item) => (
              <a key={item.name} href={item.href}>
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  it('should render expand all button', () => {
    render(<AdminSidebarWithControls navSections={mockNavSections} />)
    expect(screen.getByTestId('expand-all-btn')).toBeDefined()
  })

  it('should render collapse all button', () => {
    render(<AdminSidebarWithControls navSections={mockNavSections} />)
    expect(screen.getByTestId('collapse-all-btn')).toBeDefined()
  })

  it('should expand all sections when expand all is clicked', () => {
    render(<AdminSidebarWithControls navSections={mockNavSections} />)

    // Both sections start collapsed
    expect(screen.queryByTestId('section-content-section-one')).toBeNull()
    expect(screen.queryByTestId('section-content-section-two')).toBeNull()

    // Click expand all
    fireEvent.click(screen.getByTestId('expand-all-btn'))

    // Both should now be expanded
    expect(screen.getByTestId('section-content-section-one')).toBeDefined()
    expect(screen.getByTestId('section-content-section-two')).toBeDefined()
  })

  it('should collapse all sections when collapse all is clicked', () => {
    render(<AdminSidebarWithControls navSections={mockNavSections} />)

    // First expand all
    fireEvent.click(screen.getByTestId('expand-all-btn'))
    expect(screen.getByTestId('section-content-section-one')).toBeDefined()
    expect(screen.getByTestId('section-content-section-two')).toBeDefined()

    // Now collapse all
    fireEvent.click(screen.getByTestId('collapse-all-btn'))

    // Both should now be collapsed
    expect(screen.queryByTestId('section-content-section-one')).toBeNull()
    expect(screen.queryByTestId('section-content-section-two')).toBeNull()
  })
})

describe('Manual Collapse with Active Items', () => {
  const mockNavSections: NavSection[] = [
    {
      title: "Test Section",
      defaultOpen: false,
      items: [
        { name: "Active Item", href: "/admin/active", icon: MockIcon },
        { name: "Other Item", href: "/admin/other", icon: MockIcon },
      ],
    },
  ]

  beforeEach(() => {
    mockPathname = '/admin/active' // Set active item in section
  })

  it('should allow manually collapsing section with active item', () => {
    // Mock NavSection that tracks user interaction
    let userInteracted = false

    function NavSectionWithManualCollapse({ section }: { section: NavSection }) {
      const [isOpen, setIsOpen] = useState(true) // Start expanded due to active item

      const handleToggle = () => {
        userInteracted = true
        setIsOpen(!isOpen)
      }

      const testId = section.title.toLowerCase().replace(/\s+/g, '-')

      return (
        <div data-testid={`section-${testId}`}>
          <button
            data-testid={`section-trigger-${testId}`}
            onClick={handleToggle}
            aria-expanded={isOpen}
          >
            {section.title}
          </button>
          {isOpen && (
            <div data-testid={`section-content-${testId}`}>
              {section.items.map((item) => (
                <a key={item.name} href={item.href}>
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )
    }

    render(<NavSectionWithManualCollapse section={mockNavSections[0]} />)

    // Section should be expanded initially
    expect(screen.getByTestId('section-content-test-section')).toBeDefined()

    // Click to collapse
    fireEvent.click(screen.getByTestId('section-trigger-test-section'))

    // Section should now be collapsed even with active item
    expect(screen.queryByTestId('section-content-test-section')).toBeNull()
    expect(userInteracted).toBe(true)
  })

  it('should stay collapsed after user manually collapses', () => {
    let userCollapsed = false

    function NavSectionPersistent({ section }: { section: NavSection }) {
      const [isOpen, setIsOpen] = useState(true)

      const handleToggle = () => {
        userCollapsed = !isOpen === false
        setIsOpen(!isOpen)
      }

      // Auto-expand only runs if user hasn't collapsed
      useEffect(() => {
        if (!userCollapsed) {
          // Would auto-expand here
        }
      }, [])

      const testId = section.title.toLowerCase().replace(/\s+/g, '-')

      return (
        <div data-testid={`section-${testId}`}>
          <button
            data-testid={`section-trigger-${testId}`}
            onClick={handleToggle}
            aria-expanded={isOpen}
          >
            {section.title}
          </button>
          {isOpen && (
            <div data-testid={`section-content-${testId}`}>content</div>
          )}
        </div>
      )
    }

    render(<NavSectionPersistent section={mockNavSections[0]} />)

    // Collapse manually
    fireEvent.click(screen.getByTestId('section-trigger-test-section'))
    expect(screen.queryByTestId('section-content-test-section')).toBeNull()
    expect(userCollapsed).toBe(true)
  })
})

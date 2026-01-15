/**
 * Component Registry
 *
 * Centralized registry of all design system components.
 * Provides metadata, categorization, and documentation references for each component.
 *
 * @module lib/component-registry
 */

// ============================================================================
// COMPONENT CATEGORIES
// ============================================================================

export type ComponentCategory =
  | 'primitives'
  | 'forms'
  | 'feedback'
  | 'navigation'
  | 'layout'
  | 'data-display'
  | 'overlays'
  | 'shared'
  | 'admin'
  | 'dashboard'

// ============================================================================
// COMPONENT METADATA TYPES
// ============================================================================

export interface ComponentMetadata {
  /** Component name (PascalCase) */
  name: string
  /** Import path from @/components */
  importPath: string
  /** Component category for organization */
  category: ComponentCategory
  /** Brief description of the component */
  description: string
  /** Whether the component has variants */
  hasVariants?: boolean
  /** List of variant names if applicable */
  variants?: string[]
  /** Whether the component is a client component */
  isClientComponent?: boolean
  /** Related components */
  relatedComponents?: string[]
  /** Whether the component has unit tests */
  hasTests?: boolean
  /** Radix UI primitive it's built on (if applicable) */
  radixPrimitive?: string
}

// ============================================================================
// UI PRIMITIVES
// ============================================================================

export const uiPrimitives: ComponentMetadata[] = [
  {
    name: 'Accordion',
    importPath: '@/components/ui/accordion',
    category: 'primitives',
    description: 'Vertically stacked sections that expand/collapse to reveal content',
    radixPrimitive: '@radix-ui/react-accordion',
    isClientComponent: true,
  },
  {
    name: 'Alert',
    importPath: '@/components/ui/alert',
    category: 'feedback',
    description: 'Displays important messages with contextual styling',
    hasVariants: true,
    variants: ['default', 'destructive'],
  },
  {
    name: 'AlertDialog',
    importPath: '@/components/ui/alert-dialog',
    category: 'overlays',
    description: 'Modal dialog for important confirmations that interrupt user workflow',
    radixPrimitive: '@radix-ui/react-alert-dialog',
    isClientComponent: true,
  },
  {
    name: 'Avatar',
    importPath: '@/components/ui/avatar',
    category: 'data-display',
    description: 'Image element with fallback for representing users',
    radixPrimitive: '@radix-ui/react-avatar',
    hasTests: true,
  },
  {
    name: 'Badge',
    importPath: '@/components/ui/badge',
    category: 'data-display',
    description: 'Small status indicator or label',
    hasVariants: true,
    variants: ['default', 'secondary', 'destructive', 'outline'],
    hasTests: true,
  },
  {
    name: 'Button',
    importPath: '@/components/ui/button',
    category: 'primitives',
    description: 'Interactive button with multiple variants and sizes',
    hasVariants: true,
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    hasTests: true,
  },
  {
    name: 'Card',
    importPath: '@/components/ui/card',
    category: 'layout',
    description: 'Container for grouping related content',
    relatedComponents: ['CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter'],
    hasTests: true,
  },
  {
    name: 'Checkbox',
    importPath: '@/components/ui/checkbox',
    category: 'forms',
    description: 'Control for toggling between checked and unchecked states',
    radixPrimitive: '@radix-ui/react-checkbox',
    isClientComponent: true,
  },
  {
    name: 'Collapsible',
    importPath: '@/components/ui/collapsible',
    category: 'primitives',
    description: 'Component that expands/collapses a panel',
    radixPrimitive: '@radix-ui/react-collapsible',
    isClientComponent: true,
  },
  {
    name: 'ContextMenu',
    importPath: '@/components/ui/context-menu',
    category: 'navigation',
    description: 'Displays a menu triggered by right-click',
    radixPrimitive: '@radix-ui/react-context-menu',
    isClientComponent: true,
  },
  {
    name: 'Dialog',
    importPath: '@/components/ui/dialog',
    category: 'overlays',
    description: 'Modal window for focused interactions',
    radixPrimitive: '@radix-ui/react-dialog',
    isClientComponent: true,
    relatedComponents: ['DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogFooter', 'DialogTitle', 'DialogDescription'],
  },
  {
    name: 'DropdownMenu',
    importPath: '@/components/ui/dropdown-menu',
    category: 'navigation',
    description: 'Menu that appears when triggered by a button',
    radixPrimitive: '@radix-ui/react-dropdown-menu',
    isClientComponent: true,
  },
  {
    name: 'Input',
    importPath: '@/components/ui/input',
    category: 'forms',
    description: 'Text input field for user data entry',
    hasTests: true,
  },
  {
    name: 'Label',
    importPath: '@/components/ui/label',
    category: 'forms',
    description: 'Accessible label for form controls',
    radixPrimitive: '@radix-ui/react-label',
    hasTests: true,
  },
  {
    name: 'Popover',
    importPath: '@/components/ui/popover',
    category: 'overlays',
    description: 'Floating panel anchored to a trigger element',
    radixPrimitive: '@radix-ui/react-popover',
    isClientComponent: true,
  },
  {
    name: 'Progress',
    importPath: '@/components/ui/progress',
    category: 'feedback',
    description: 'Visual indicator of progress or loading state',
    radixPrimitive: '@radix-ui/react-progress',
    isClientComponent: true,
  },
  {
    name: 'RadioGroup',
    importPath: '@/components/ui/radio-group',
    category: 'forms',
    description: 'Set of radio buttons for single-selection',
    radixPrimitive: '@radix-ui/react-radio-group',
    isClientComponent: true,
  },
  {
    name: 'ScrollArea',
    importPath: '@/components/ui/scroll-area',
    category: 'layout',
    description: 'Custom scrollable area with styled scrollbars',
    radixPrimitive: '@radix-ui/react-scroll-area',
  },
  {
    name: 'Select',
    importPath: '@/components/ui/select',
    category: 'forms',
    description: 'Dropdown for selecting from a list of options',
    radixPrimitive: '@radix-ui/react-select',
    isClientComponent: true,
  },
  {
    name: 'Separator',
    importPath: '@/components/ui/separator',
    category: 'layout',
    description: 'Visual divider between content sections',
    radixPrimitive: '@radix-ui/react-separator',
    hasTests: true,
  },
  {
    name: 'Sheet',
    importPath: '@/components/ui/sheet',
    category: 'overlays',
    description: 'Sliding panel from screen edge',
    radixPrimitive: '@radix-ui/react-dialog',
    isClientComponent: true,
    hasVariants: true,
    variants: ['top', 'right', 'bottom', 'left'],
  },
  {
    name: 'Skeleton',
    importPath: '@/components/ui/skeleton',
    category: 'feedback',
    description: 'Placeholder animation for loading content',
  },
  {
    name: 'Slider',
    importPath: '@/components/ui/slider',
    category: 'forms',
    description: 'Control for selecting a value from a range',
    radixPrimitive: '@radix-ui/react-slider',
    isClientComponent: true,
  },
  {
    name: 'Switch',
    importPath: '@/components/ui/switch',
    category: 'forms',
    description: 'Toggle control for on/off states',
    radixPrimitive: '@radix-ui/react-switch',
    isClientComponent: true,
  },
  {
    name: 'Table',
    importPath: '@/components/ui/table',
    category: 'data-display',
    description: 'Semantic table with styled components',
    relatedComponents: ['TableHeader', 'TableBody', 'TableFooter', 'TableRow', 'TableHead', 'TableCell', 'TableCaption'],
  },
  {
    name: 'Tabs',
    importPath: '@/components/ui/tabs',
    category: 'navigation',
    description: 'Tabbed interface for switching between content panels',
    radixPrimitive: '@radix-ui/react-tabs',
    isClientComponent: true,
  },
  {
    name: 'Textarea',
    importPath: '@/components/ui/textarea',
    category: 'forms',
    description: 'Multi-line text input field',
  },
  {
    name: 'Tooltip',
    importPath: '@/components/ui/tooltip',
    category: 'overlays',
    description: 'Popup with additional information on hover',
    radixPrimitive: '@radix-ui/react-tooltip',
    isClientComponent: true,
  },
]

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

export const sharedComponents: ComponentMetadata[] = [
  {
    name: 'CommentsPanel',
    importPath: '@/components/shared/comments-panel',
    category: 'shared',
    description: 'Panel for displaying and managing comments',
    isClientComponent: true,
  },
  {
    name: 'FolderOrganization',
    importPath: '@/components/shared/folder-organization',
    category: 'shared',
    description: 'Component for organizing items into folders',
    isClientComponent: true,
  },
  {
    name: 'VersionHistory',
    importPath: '@/components/shared/version-history',
    category: 'shared',
    description: 'Display of version history with changes',
    isClientComponent: true,
  },
  {
    name: 'WorkflowStatus',
    importPath: '@/components/shared/workflow-status',
    category: 'shared',
    description: 'Status indicator for workflow states',
  },
]

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const layoutComponents: ComponentMetadata[] = [
  {
    name: 'AppSidebar',
    importPath: '@/components/layout/sidebar',
    category: 'layout',
    description: 'Unified sidebar component with admin and dashboard variants',
    isClientComponent: true,
    hasVariants: true,
    variants: ['admin', 'dashboard'],
  },
  {
    name: 'AppHeader',
    importPath: '@/components/layout/header',
    category: 'layout',
    description: 'Unified header component with admin and dashboard variants',
    isClientComponent: true,
    hasVariants: true,
    variants: ['admin', 'dashboard'],
  },
  {
    name: 'PageContainer',
    importPath: '@/components/layout/page-container',
    category: 'layout',
    description: 'Standard page layout container with consistent padding',
  },
  {
    name: 'PageHeader',
    importPath: '@/components/layout/page-header',
    category: 'layout',
    description: 'Page header with title, description, and actions',
  },
  {
    name: 'Section',
    importPath: '@/components/layout/section',
    category: 'layout',
    description: 'Content section with optional heading',
  },
]

// ============================================================================
// ADMIN COMPONENTS
// ============================================================================

export const adminComponents: ComponentMetadata[] = [
  {
    name: 'AdminDataTable',
    importPath: '@/components/admin/data-table',
    category: 'admin',
    description: 'Data table with sorting, filtering, and pagination for admin views',
    isClientComponent: true,
    hasTests: true,
  },
  {
    name: 'AdminHeader',
    importPath: '@/components/admin/header',
    category: 'admin',
    description: 'Header component for admin portal pages',
    isClientComponent: true,
  },
  {
    name: 'AdminSidebar',
    importPath: '@/components/admin/sidebar',
    category: 'admin',
    description: 'Navigation sidebar for admin portal',
    isClientComponent: true,
    hasTests: true,
  },
]

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export const dashboardComponents: ComponentMetadata[] = [
  {
    name: 'DashboardHeader',
    importPath: '@/components/dashboard/header',
    category: 'dashboard',
    description: 'Header component for user dashboard',
    isClientComponent: true,
  },
  {
    name: 'DashboardSidebar',
    importPath: '@/components/dashboard/sidebar',
    category: 'dashboard',
    description: 'Navigation sidebar for user dashboard',
    isClientComponent: true,
  },
  {
    name: 'HeroMetrics',
    importPath: '@/components/dashboard/hero-metrics',
    category: 'dashboard',
    description: 'Hero section with key metrics display',
  },
  {
    name: 'QuickActions',
    importPath: '@/components/dashboard/quick-actions',
    category: 'dashboard',
    description: 'Quick action buttons for common tasks',
  },
  {
    name: 'InsightsPanel',
    importPath: '@/components/dashboard/insights-panel',
    category: 'dashboard',
    description: 'Panel displaying AI-generated insights',
  },
  {
    name: 'LiveActivityFeed',
    importPath: '@/components/dashboard/live-activity-feed',
    category: 'dashboard',
    description: 'Real-time activity feed',
    isClientComponent: true,
  },
  {
    name: 'RecentReports',
    importPath: '@/components/dashboard/recent-reports',
    category: 'dashboard',
    description: 'List of recently generated reports',
  },
  {
    name: 'UsageStats',
    importPath: '@/components/dashboard/usage-stats',
    category: 'dashboard',
    description: 'Usage statistics display',
  },
  {
    name: 'ActiveAgents',
    importPath: '@/components/dashboard/active-agents',
    category: 'dashboard',
    description: 'List of currently active AI agents',
    isClientComponent: true,
  },
  {
    name: 'PerformanceCharts',
    importPath: '@/components/dashboard/performance-charts',
    category: 'dashboard',
    description: 'Performance visualization charts',
    isClientComponent: true,
  },
]

// ============================================================================
// COMPLETE REGISTRY
// ============================================================================

export const componentRegistry: ComponentMetadata[] = [
  ...uiPrimitives,
  ...sharedComponents,
  ...layoutComponents,
  ...adminComponents,
  ...dashboardComponents,
]

// ============================================================================
// REGISTRY HELPERS
// ============================================================================

/**
 * Get all components in a specific category.
 */
export function getComponentsByCategory(category: ComponentCategory): ComponentMetadata[] {
  return componentRegistry.filter((c) => c.category === category)
}

/**
 * Get a component by name.
 */
export function getComponentByName(name: string): ComponentMetadata | undefined {
  return componentRegistry.find((c) => c.name === name)
}

/**
 * Get all components that use a specific Radix primitive.
 */
export function getComponentsByRadixPrimitive(primitive: string): ComponentMetadata[] {
  return componentRegistry.filter((c) => c.radixPrimitive === primitive)
}

/**
 * Get all components with tests.
 */
export function getTestedComponents(): ComponentMetadata[] {
  return componentRegistry.filter((c) => c.hasTests)
}

/**
 * Get all client components (require "use client" directive).
 */
export function getClientComponents(): ComponentMetadata[] {
  return componentRegistry.filter((c) => c.isClientComponent)
}

/**
 * Get component count by category.
 */
export function getComponentCountByCategory(): Record<ComponentCategory, number> {
  const counts: Partial<Record<ComponentCategory, number>> = {}
  componentRegistry.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1
  })
  return counts as Record<ComponentCategory, number>
}

/**
 * Search components by name or description.
 */
export function searchComponents(query: string): ComponentMetadata[] {
  const lowerQuery = query.toLowerCase()
  return componentRegistry.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
  )
}

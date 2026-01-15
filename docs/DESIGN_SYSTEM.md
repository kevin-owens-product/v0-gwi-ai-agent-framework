# GWI Design System

This document provides a comprehensive guide to the GWI design system, including component usage, design tokens, and best practices for maintaining consistency across the application.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Design Tokens](#design-tokens)
- [Components](#components)
- [Layout System](#layout-system)
- [Best Practices](#best-practices)

---

## Overview

The GWI design system provides a unified component library and design token system that ensures consistency across both the **Admin Portal** and **User Dashboard**. The system is built on:

- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **Class Variance Authority (CVA)** for component variants
- **CSS Custom Properties** for theming

### Key Files

| File | Description |
|------|-------------|
| `lib/design-tokens.ts` | TypeScript design tokens for programmatic access |
| `lib/component-registry.ts` | Component metadata and discovery |
| `styles/globals.css` | CSS custom properties and base styles |
| `components/ui/index.ts` | UI component barrel exports |
| `components/layout/index.ts` | Layout component barrel exports |

---

## Getting Started

### Importing Components

Use barrel exports for cleaner imports:

```tsx
// Recommended: Import from barrel exports
import { Button, Card, CardHeader, CardContent, Input } from '@/components/ui'
import { AppSidebar, AppHeader, PageContainer, PageHeader } from '@/components/layout'

// Avoid: Individual file imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### Using Design Tokens

Access design tokens in TypeScript:

```tsx
import { colors, spacing, borderRadius } from '@/lib/design-tokens'

// Use in styles or JavaScript
const primaryColor = colors.primary // 'var(--primary)'
```

---

## Design Tokens

### Colors

The color system uses semantic tokens that automatically adapt to light/dark mode:

```tsx
import { colors } from '@/lib/design-tokens'

// Semantic colors
colors.background      // Page background
colors.foreground      // Primary text
colors.primary         // Brand/action color
colors.secondary       // Secondary actions
colors.muted           // Subtle backgrounds
colors.mutedForeground // Subtle text
colors.accent          // Accent/highlight
colors.destructive     // Error/danger

// Chart colors
colors.chart1 through colors.chart5
```

### Spacing

Use consistent spacing values:

```tsx
import { spacing } from '@/lib/design-tokens'

spacing[0]   // 0
spacing[1]   // 0.25rem (4px)
spacing[2]   // 0.5rem (8px)
spacing[4]   // 1rem (16px)
spacing[6]   // 1.5rem (24px)
spacing[8]   // 2rem (32px)
```

### Border Radius

```tsx
import { borderRadius } from '@/lib/design-tokens'

borderRadius.sm   // 6px
borderRadius.md   // 8px
borderRadius.lg   // 10px (base)
borderRadius.xl   // 14px
borderRadius.full // 9999px
```

---

## Components

### UI Primitives

Core UI components available in `@/components/ui`:

#### Button

```tsx
import { Button } from '@/components/ui'

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Card actions */}
  </CardFooter>
</Card>
```

#### Form Components

```tsx
import { Input, Label, Checkbox, Switch, Select, Textarea } from '@/components/ui'

<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter email" />
  </div>

  <div className="flex items-center gap-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms</Label>
  </div>

  <div className="flex items-center gap-2">
    <Switch id="notifications" />
    <Label htmlFor="notifications">Enable notifications</Label>
  </div>
</div>
```

#### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description here.</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Layout Components

Layout components available in `@/components/layout`:

#### AppSidebar

Unified sidebar with admin and dashboard variants:

```tsx
import { AppSidebar, type NavSection } from '@/components/layout'

const navSections: NavSection[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
]

// Dashboard variant
<AppSidebar
  variant="dashboard"
  navSections={navSections}
  user={{ name: "John Doe", email: "john@example.com" }}
  collapsible
/>

// Admin variant
<AppSidebar
  variant="admin"
  navSections={adminSections}
  user={{ name: "Admin User", role: "super_admin" }}
  onLogout={handleLogout}
/>
```

#### AppHeader

Unified header component:

```tsx
import { AppHeader } from '@/components/layout'

// Admin header with title
<AppHeader
  variant="admin"
  title="User Management"
  user={{ name: "Admin User" }}
  showNotifications
  notificationCount={3}
/>

// Dashboard header with search
<AppHeader
  variant="dashboard"
  searchPlaceholder="Search agents, workflows..."
  onMenuClick={() => setMobileMenuOpen(true)}
/>
```

#### Page Layout

```tsx
import { PageContainer, PageHeader, Section, Grid } from '@/components/layout'

<PageContainer>
  <PageHeader
    title="Projects"
    description="Manage your projects"
    actions={<Button>New Project</Button>}
  />

  <Section title="Recent Projects">
    <Grid cols={{ default: 1, md: 2, lg: 3 }}>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Grid>
  </Section>
</PageContainer>
```

---

## Layout System

### PageContainer

Controls max-width and padding:

```tsx
<PageContainer maxWidth="xl" padding="md">
  {/* Content */}
</PageContainer>

// Options
maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
padding: "none" | "sm" | "md" | "lg"
```

### Grid

Responsive grid layout:

```tsx
<Grid
  cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
>
  {items.map(item => <Card key={item.id} />)}
</Grid>
```

### Stack

Vertical stacking with consistent spacing:

```tsx
<Stack gap="md">
  <Component1 />
  <Component2 />
  <Component3 />
</Stack>
```

### Flex

Flexible layout utility:

```tsx
<Flex justify="between" align="center" gap="md">
  <Title />
  <Actions />
</Flex>
```

---

## Best Practices

### 1. Use Semantic Colors

Always use semantic color tokens instead of hard-coded values:

```tsx
// Good
className="bg-background text-foreground border-border"

// Avoid
className="bg-white text-black border-gray-200"
```

### 2. Leverage Component Variants

Use built-in variants instead of custom styles:

```tsx
// Good
<Button variant="destructive">Delete</Button>

// Avoid
<Button className="bg-red-500 text-white">Delete</Button>
```

### 3. Use the cn() Utility

Merge classes properly with the `cn()` utility:

```tsx
import { cn } from '@/lib/utils'

function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-styles", className)} {...props} />
  )
}
```

### 4. Consistent Imports

Use barrel exports for cleaner code:

```tsx
// Good
import { Button, Card, Input } from '@/components/ui'

// Avoid
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

### 5. Follow Component Patterns

When creating new components:

1. Use the `cn()` utility for class merging
2. Add `data-slot` attributes for styling hooks
3. Accept and spread `className` prop
4. Export from the appropriate barrel file
5. Use design tokens for colors and spacing

```tsx
function MyComponent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="my-component"
      className={cn("bg-card text-card-foreground p-4 rounded-lg", className)}
      {...props}
    />
  )
}
```

### 6. Accessibility

All interactive components should:

- Be keyboard navigable
- Have proper ARIA attributes
- Support focus states
- Work with screen readers

The Radix UI primitives handle most accessibility concerns automatically.

---

## Component Registry

Use the component registry to discover available components:

```tsx
import {
  componentRegistry,
  getComponentsByCategory,
  searchComponents
} from '@/lib/component-registry'

// Get all form components
const formComponents = getComponentsByCategory('forms')

// Search components
const results = searchComponents('button')

// Get component metadata
const buttonMeta = componentRegistry.find(c => c.name === 'Button')
```

---

## Theming

### Light/Dark Mode

The design system supports automatic light/dark mode via CSS custom properties. Use `next-themes` for theme switching:

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  )
}
```

### Custom Themes

Extend the theme by modifying CSS custom properties in `styles/globals.css`:

```css
:root {
  --primary: oklch(0.6 0.2 250);
  --primary-foreground: oklch(0.98 0 0);
}

.dark {
  --primary: oklch(0.7 0.2 250);
  --primary-foreground: oklch(0.1 0 0);
}
```

---

## Migration Guide

### Updating to Unified Components

Replace portal-specific components with unified variants:

```tsx
// Before
import { AdminSidebar } from '@/components/admin/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

// After
import { AppSidebar } from '@/components/layout'

<AppSidebar variant="admin" ... />
<AppSidebar variant="dashboard" ... />
```

### Using Barrel Exports

Update imports to use barrel exports:

```tsx
// Before
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// After
import { Button, Card } from '@/components/ui'
```

---

## Support

For questions about the design system:

1. Check this documentation
2. Review component source code and JSDoc comments
3. Consult the component registry for metadata
4. Review existing usage patterns in the codebase

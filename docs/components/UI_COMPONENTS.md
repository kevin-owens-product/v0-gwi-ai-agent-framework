# UI Component Library

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [shadcn/ui Components](#shadcnui-components)
3. [Custom Component Extensions](#custom-component-extensions)
4. [Styling Approach](#styling-approach)
5. [Theme System](#theme-system)
6. [Accessibility Standards](#accessibility-standards)

---

## Overview

The UI component library is built on **shadcn/ui**, which provides accessible, customizable components based on Radix UI primitives. All components are styled with Tailwind CSS and support dark mode.

**Base Library:** shadcn/ui (New York style)

**Primitives:** Radix UI

**Styling:** Tailwind CSS v4

**Theme:** Light/Dark mode with oklch color space

**Total Components:** 48 UI components

---

## shadcn/ui Components

### Form Components

#### Button

**File:** `components/ui/button.tsx`

**Variants:**
- `default` - Primary action button
- `destructive` - Delete/remove actions
- `outline` - Secondary with border
- `secondary` - Secondary action
- `ghost` - Minimal with hover
- `link` - Text link styled as button

**Sizes:**
- `default` - 36px height
- `sm` - 32px height
- `lg` - 40px height
- `icon` - 36x36px icon button
- `icon-sm` - 32x32px icon button
- `icon-lg` - 40x40px icon button

**Usage:**
```typescript
import { Button } from '@/components/ui/button'

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

#### Input

**File:** `components/ui/input.tsx`

**Features:**
- Text input with validation states
- Error state styling
- Disabled state
- Placeholder support

**Usage:**
```typescript
import { Input } from '@/components/ui/input'

<Input 
  type="text" 
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

#### Textarea

**File:** `components/ui/textarea.tsx`

**Usage:**
```typescript
import { Textarea } from '@/components/ui/textarea'

<Textarea 
  placeholder="Enter description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

#### Select

**File:** `components/ui/select.tsx`

**Usage:**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox

**File:** `components/ui/checkbox.tsx`

**Usage:**
```typescript
import { Checkbox } from '@/components/ui/checkbox'

<Checkbox 
  checked={isChecked}
  onCheckedChange={setIsChecked}
/>
```

#### Radio Group

**File:** `components/ui/radio-group.tsx`

**Usage:**
```typescript
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1" />
  <RadioGroupItem value="option2" />
</RadioGroup>
```

#### Switch

**File:** `components/ui/switch.tsx`

**Usage:**
```typescript
import { Switch } from '@/components/ui/switch'

<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>
```

#### Slider

**File:** `components/ui/slider.tsx`

**Usage:**
```typescript
import { Slider } from '@/components/ui/slider'

<Slider 
  value={[value]}
  onValueChange={([newValue]) => setValue(newValue)}
  min={0}
  max={100}
/>
```

### Layout Components

#### Card

**File:** `components/ui/card.tsx`

**Sub-components:**
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Description
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>
```

#### Separator

**File:** `components/ui/separator.tsx`

**Usage:**
```typescript
import { Separator } from '@/components/ui/separator'

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>
```

#### Tabs

**File:** `components/ui/tabs.tsx`

**Usage:**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion

**File:** `components/ui/accordion.tsx`

**Usage:**
```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

<Accordion>
  <AccordionItem value="item1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Overlay Components

#### Dialog

**File:** `components/ui/dialog.tsx`

**Usage:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

#### Alert Dialog

**File:** `components/ui/alert-dialog.tsx`

**Usage:**
```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Popover

**File:** `components/ui/popover.tsx`

**Usage:**
```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>
```

#### Sheet

**File:** `components/ui/sheet.tsx`

**Usage:**
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
    </SheetHeader>
    Sheet content
  </SheetContent>
</Sheet>
```

#### Tooltip

**File:** `components/ui/tooltip.tsx`

**Usage:**
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Navigation Components

#### Dropdown Menu

**File:** `components/ui/dropdown-menu.tsx`

**Usage:**
```typescript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Context Menu

**File:** `components/ui/context-menu.tsx`

**Usage:**
```typescript
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'

<ContextMenu>
  <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Action 1</ContextMenuItem>
    <ContextMenuItem>Action 2</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Feedback Components

#### Alert

**File:** `components/ui/alert.tsx`

**Variants:**
- `default` - Default alert
- `destructive` - Error alert
- `warning` - Warning alert
- `success` - Success alert

**Usage:**
```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### Badge

**File:** `components/ui/badge.tsx`

**Variants:**
- `default` - Default badge
- `secondary` - Secondary badge
- `destructive` - Error badge
- `outline` - Outlined badge

**Usage:**
```typescript
import { Badge } from '@/components/ui/badge'

<Badge variant="default">New</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Progress

**File:** `components/ui/progress.tsx`

**Usage:**
```typescript
import { Progress } from '@/components/ui/progress'

<Progress value={progress} />
```

#### Skeleton

**File:** `components/ui/skeleton.tsx`

**Usage:**
```typescript
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-32" />
```

### Data Display Components

#### Table

**File:** `components/ui/table.tsx`

**Usage:**
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Avatar

**File:** `components/ui/avatar.tsx`

**Usage:**
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Utility Components

#### Scroll Area

**File:** `components/ui/scroll-area.tsx`

**Usage:**
```typescript
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-72">
  Long content here
</ScrollArea>
```

#### Command

**File:** `components/ui/command.tsx`

**Usage:**
```typescript
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command'

<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandItem>Item 1</CommandItem>
    <CommandItem>Item 2</CommandItem>
  </CommandList>
</Command>
```

#### Form

**File:** `components/ui/form.tsx`

**Usage:**
```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

const form = useForm()

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## Custom Component Extensions

### Command Palette

**File:** `components/ui/command-palette.tsx`

**Purpose:** Global command palette (⌘K)

**Features:**
- Keyboard shortcut support
- Search across actions
- Quick navigation

### Theme Toggle

**File:** `components/ui/theme-toggle.tsx`

**Purpose:** Light/Dark theme switcher

**Usage:**
```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle'

<ThemeToggle />
```

### Language Switcher

**File:** `components/ui/language-switcher.tsx`

**Purpose:** i18n language selection

**Features:**
- 11 language support
- Flag icons
- Native language names

### Empty State

**File:** `components/ui/empty-state.tsx`

**Purpose:** Empty state display

**Usage:**
```typescript
import { EmptyState } from '@/components/ui/empty-state'

<EmptyState 
  title="No agents"
  description="Create your first agent to get started"
  action={<Button>Create Agent</Button>}
/>
```

### Confirmation Dialog

**File:** `components/ui/confirmation-dialog.tsx`

**Purpose:** Reusable confirmation dialogs

**Usage:**
```typescript
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

<ConfirmationDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete agent?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
/>
```

---

## Styling Approach

### Tailwind CSS

**Version:** Tailwind CSS v4

**Configuration:** `tailwind.config.ts` (if exists) or `globals.css`

**Features:**
- Utility-first CSS
- JIT compilation
- Dark mode support
- Custom theme variables

### Utility Classes

**Common Patterns:**
```typescript
// Spacing
className="p-4 m-2 gap-4"

// Layout
className="flex items-center justify-between"

// Colors
className="bg-primary text-primary-foreground"

// Responsive
className="md:flex lg:grid"
```

### Custom Utilities

**`cn()` Function:**
```typescript
import { cn } from '@/lib/utils'

// Merge classNames
<div className={cn("base-class", isActive && "active-class", className)} />
```

**Purpose:**
- Merge Tailwind classes
- Conditional classes
- Override defaults

---

## Theme System

### Color System

**Color Space:** oklch (OK LCH)

**Benefits:**
- Perceptually uniform
- Better color consistency
- Improved accessibility

### Theme Variables

**Light Theme:**
```css
:root {
  --background: oklch(0.98 0.005 260);
  --foreground: oklch(0.15 0.01 260);
  --primary: oklch(0.45 0.2 280);
  --primary-foreground: oklch(0.98 0 0);
  /* ... more variables */
}
```

**Dark Theme:**
```css
html.dark {
  --background: oklch(0.07 0.01 260);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.98 0 0);
  /* ... more variables */
}
```

### Theme Provider

**File:** `components/theme-provider.tsx`

**Usage:**
```typescript
import { ThemeProvider } from '@/components/theme-provider'

<ThemeProvider defaultTheme="system" storageKey="gwi-theme">
  {children}
</ThemeProvider>
```

**Features:**
- System theme detection
- LocalStorage persistence
- Smooth transitions

### Color Tokens

**Semantic Colors:**
- `primary` - Brand color
- `secondary` - Secondary actions
- `destructive` - Error/danger
- `muted` - Subtle backgrounds
- `accent` - Accent color
- `border` - Borders
- `input` - Input backgrounds
- `ring` - Focus rings

**Chart Colors:**
- `chart-1` through `chart-5` - Chart color palette

**Sidebar Colors:**
- `sidebar` - Sidebar background
- `sidebar-foreground` - Sidebar text
- `sidebar-primary` - Sidebar primary
- `sidebar-accent` - Sidebar accent
- `sidebar-border` - Sidebar borders

---

## Accessibility Standards

### ARIA Attributes

**Components include:**
- `aria-label` - Accessible labels
- `aria-describedby` - Descriptions
- `aria-invalid` - Validation states
- `aria-expanded` - Expandable content
- `aria-selected` - Selected states

### Keyboard Navigation

**Supported:**
- Tab navigation
- Arrow keys for menus
- Enter/Space for actions
- Escape to close modals
- Keyboard shortcuts (⌘K)

### Focus Management

**Features:**
- Visible focus indicators
- Focus trapping in modals
- Focus restoration
- Skip links

### Screen Reader Support

**Components:**
- Semantic HTML
- ARIA labels
- Live regions for updates
- Role attributes

---

## Component Testing

### Test Files

**Pattern:** `*.test.tsx` alongside component files

**Example:**
- `components/ui/button.tsx`
- `components/ui/button.test.tsx`

### Testing Library

**Framework:** Vitest + React Testing Library

**Pattern:**
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'

test('renders button', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

---

## Related Documentation

- [Component Architecture](./COMPONENT_ARCHITECTURE.md) - Component organization
- [Feature Components](./FEATURE_COMPONENTS.md) - Feature-specific components
- [Design System](../../docs/DESIGN_SYSTEM.md) - Design guidelines

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team

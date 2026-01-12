/**
 * Button Component
 *
 * A versatile, accessible button component built on Radix UI primitives with multiple variants and sizes.
 * Supports polymorphic rendering through the `asChild` prop for composition with other components.
 *
 * @module components/ui/button
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Button variant styles using class-variance-authority.
 * Provides consistent styling across different button types and states.
 *
 * @constant
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        /** Primary action button with brand colors */
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        /** Destructive action button (delete, remove, etc.) */
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        /** Secondary button with border and subtle background */
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        /** Secondary action button */
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        /** Minimal button with hover state */
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        /** Text link styled as button */
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        /** Standard button size (36px height) */
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        /** Small button (32px height) */
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        /** Large button (40px height) */
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        /** Icon-only button (36x36px) */
        icon: 'size-9',
        /** Small icon button (32x32px) */
        'icon-sm': 'size-8',
        /** Large icon button (40x40px) */
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * Button props interface extending native button attributes
 */
export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the button as a Slot component for composition.
   * Useful for wrapping components like Link while maintaining button styles.
   *
   * @default false
   * @example
   * ```tsx
   * <Button asChild>
   *   <Link href="/dashboard">Dashboard</Link>
   * </Button>
   * ```
   */
  asChild?: boolean
}

/**
 * Button component with multiple variants and sizes.
 *
 * Provides consistent, accessible button styling across the application.
 * Supports all native button attributes and polymorphic rendering.
 *
 * @component
 *
 * @example
 * Basic usage
 * ```tsx
 * <Button onClick={handleClick}>Click me</Button>
 * ```
 *
 * @example
 * With variants
 * ```tsx
 * <Button variant="destructive" size="lg">Delete</Button>
 * <Button variant="outline">Cancel</Button>
 * <Button variant="ghost" size="sm">Edit</Button>
 * ```
 *
 * @example
 * Icon button
 * ```tsx
 * <Button variant="ghost" size="icon">
 *   <Settings className="h-4 w-4" />
 * </Button>
 * ```
 *
 * @example
 * As Link (polymorphic)
 * ```tsx
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 *
 * @example
 * Disabled state
 * ```tsx
 * <Button disabled isLoading>Loading...</Button>
 * ```
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

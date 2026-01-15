/**
 * UI Components Barrel Export
 *
 * This file provides a centralized export for all UI components in the design system.
 * Import components from this file for cleaner imports across the application.
 *
 * @module components/ui
 *
 * @example
 * Import multiple components:
 * ```tsx
 * import { Button, Card, CardHeader, CardContent, Input } from '@/components/ui'
 * ```
 *
 * @example
 * Import with type:
 * ```tsx
 * import { Button, type ButtonProps } from '@/components/ui'
 * ```
 */

// ============================================================================
// ACCORDION
// ============================================================================
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion'

// ============================================================================
// ALERT
// ============================================================================
export { Alert, AlertTitle, AlertDescription } from './alert'

// ============================================================================
// ALERT DIALOG
// ============================================================================
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

// ============================================================================
// AVATAR
// ============================================================================
export { Avatar, AvatarImage, AvatarFallback } from './avatar'

// ============================================================================
// BADGE
// ============================================================================
export { Badge, badgeVariants } from './badge'

// ============================================================================
// BUTTON
// ============================================================================
export { Button, buttonVariants, type ButtonProps } from './button'

// ============================================================================
// CARD
// ============================================================================
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card'

// ============================================================================
// CHECKBOX
// ============================================================================
export { Checkbox } from './checkbox'

// ============================================================================
// COLLAPSIBLE
// ============================================================================
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'

// ============================================================================
// CONTEXT MENU
// ============================================================================
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './context-menu'

// ============================================================================
// DIALOG
// ============================================================================
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'

// ============================================================================
// DROPDOWN MENU
// ============================================================================
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu'

// ============================================================================
// INPUT
// ============================================================================
export { Input } from './input'

// ============================================================================
// LABEL
// ============================================================================
export { Label } from './label'

// ============================================================================
// POPOVER
// ============================================================================
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from './popover'

// ============================================================================
// PROGRESS
// ============================================================================
export { Progress } from './progress'

// ============================================================================
// RADIO GROUP
// ============================================================================
export { RadioGroup, RadioGroupItem } from './radio-group'

// ============================================================================
// SCROLL AREA
// ============================================================================
export { ScrollArea, ScrollBar } from './scroll-area'

// ============================================================================
// SELECT
// ============================================================================
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

// ============================================================================
// SEPARATOR
// ============================================================================
export { Separator } from './separator'

// ============================================================================
// SHEET
// ============================================================================
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet'

// ============================================================================
// SKELETON
// ============================================================================
export { Skeleton } from './skeleton'

// ============================================================================
// SLIDER
// ============================================================================
export { Slider } from './slider'

// ============================================================================
// SWITCH
// ============================================================================
export { Switch } from './switch'

// ============================================================================
// TABLE
// ============================================================================
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'

// ============================================================================
// TABS
// ============================================================================
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

// ============================================================================
// TEXTAREA
// ============================================================================
export { Textarea } from './textarea'

// ============================================================================
// TOOLTIP
// ============================================================================
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'

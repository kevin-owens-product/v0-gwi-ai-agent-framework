/**
 * Layout Components Barrel Export
 *
 * Centralized exports for all layout components in the design system.
 *
 * @module components/layout
 *
 * @example
 * Import layout components:
 * ```tsx
 * import {
 *   AppSidebar,
 *   AppHeader,
 *   PageContainer,
 *   PageHeader,
 *   Section,
 *   Grid,
 * } from '@/components/layout'
 * ```
 */

// ============================================================================
// SIDEBAR
// ============================================================================
export {
  AppSidebar,
  type AppSidebarProps,
  type NavItem,
  type NavChild,
  type NavSection,
  type SidebarUser,
  type SidebarBranding,
} from './sidebar'

// ============================================================================
// HEADER
// ============================================================================
export {
  AppHeader,
  createPageTitleLookup,
  type AppHeaderProps,
  type HeaderUser,
  type HeaderAction,
} from './header'

// ============================================================================
// PAGE CONTAINER
// ============================================================================
export { PageContainer, type PageContainerProps } from './page-container'

// ============================================================================
// PAGE HEADER
// ============================================================================
export { PageHeader, type PageHeaderProps } from './page-header'

// ============================================================================
// SECTION
// ============================================================================
export { Section, type SectionProps } from './section'

// ============================================================================
// GRID & LAYOUT UTILITIES
// ============================================================================
export {
  Grid,
  Stack,
  Flex,
  type GridProps,
  type StackProps,
  type FlexProps,
} from './grid'

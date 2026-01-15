/**
 * Design Tokens
 *
 * Centralized design tokens for the GWI design system.
 * These tokens provide a single source of truth for colors, spacing, typography,
 * and other design values used throughout the application.
 *
 * @module lib/design-tokens
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Core semantic color tokens that map to CSS custom properties.
 * Use these values in TypeScript/JavaScript when you need programmatic access to colors.
 */
export const colors = {
  // Background colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',

  // Card colors
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',

  // Popover colors
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',

  // Primary colors
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',

  // Secondary colors
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  // Muted colors
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',

  // Accent colors
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',

  // Destructive colors
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',

  // Border and input colors
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',

  // Chart colors for data visualization
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',

  // Sidebar-specific colors
  sidebar: 'var(--sidebar)',
  sidebarForeground: 'var(--sidebar-foreground)',
  sidebarPrimary: 'var(--sidebar-primary)',
  sidebarPrimaryForeground: 'var(--sidebar-primary-foreground)',
  sidebarAccent: 'var(--sidebar-accent)',
  sidebarAccentForeground: 'var(--sidebar-accent-foreground)',
  sidebarBorder: 'var(--sidebar-border)',
  sidebarRing: 'var(--sidebar-ring)',
} as const

/**
 * Chart color palette for data visualizations.
 * Use these for consistent chart theming.
 */
export const chartColors = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
] as const

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing scale based on 4px base unit.
 * Use these for consistent padding, margins, and gaps.
 */
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

/**
 * Border radius tokens that map to CSS custom properties.
 * Use these for consistent rounded corners.
 */
export const borderRadius = {
  none: '0',
  sm: 'var(--radius-sm)',   // 6px (based on --radius - 4px)
  md: 'var(--radius-md)',   // 8px (based on --radius - 2px)
  lg: 'var(--radius-lg)',   // 10px (base --radius)
  xl: 'var(--radius-xl)',   // 14px (based on --radius + 4px)
  full: '9999px',
} as const

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Font family tokens.
 */
export const fontFamily = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const

/**
 * Font size tokens with corresponding line heights.
 */
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
  '5xl': ['3rem', { lineHeight: '1' }],          // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
  '8xl': ['6rem', { lineHeight: '1' }],          // 96px
  '9xl': ['8rem', { lineHeight: '1' }],          // 128px
} as const

/**
 * Font weight tokens.
 */
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// ============================================================================
// SHADOW TOKENS
// ============================================================================

/**
 * Box shadow tokens for elevation and depth.
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

/**
 * Transition duration tokens.
 */
export const transitionDuration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const

/**
 * Transition timing function tokens.
 */
export const transitionTimingFunction = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

/**
 * Z-index scale for consistent layering.
 */
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
} as const

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

/**
 * Responsive breakpoint tokens.
 * Match Tailwind CSS default breakpoints.
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

/**
 * Common layout dimension tokens.
 */
export const layout = {
  // Sidebar widths
  sidebarWidth: '240px',      // Default sidebar width (w-60)
  sidebarCollapsedWidth: '64px', // Collapsed sidebar width (w-16)
  adminSidebarWidth: '256px', // Admin sidebar width (w-64)

  // Header heights
  headerHeight: '64px',       // Default header height (h-16)
  compactHeaderHeight: '56px', // Compact header height (h-14)

  // Content widths
  contentMaxWidth: '1280px',  // Max content width (max-w-7xl)
  narrowContentWidth: '768px', // Narrow content width (max-w-3xl)

  // Container padding
  containerPaddingX: '24px',  // Default container padding (px-6)
  containerPaddingY: '24px',  // Default container padding (py-6)
} as const

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

/**
 * Button-specific design tokens.
 */
export const buttonTokens = {
  heights: {
    sm: '32px',     // h-8
    default: '36px', // h-9
    lg: '40px',      // h-10
  },
  paddingX: {
    sm: '12px',      // px-3
    default: '16px', // px-4
    lg: '24px',      // px-6
  },
  iconSizes: {
    sm: '32px',      // size-8
    default: '36px', // size-9
    lg: '40px',      // size-10
  },
} as const

/**
 * Input-specific design tokens.
 */
export const inputTokens = {
  height: '36px',      // h-9
  paddingX: '12px',    // px-3
  paddingY: '4px',     // py-1
  borderRadius: 'var(--radius-md)',
} as const

/**
 * Card-specific design tokens.
 */
export const cardTokens = {
  padding: '24px',     // p-6
  borderRadius: 'var(--radius-xl)',
  headerGap: '6px',    // gap-1.5
} as const

// ============================================================================
// EXPORT AGGREGATED TOKENS
// ============================================================================

/**
 * Complete design tokens object for programmatic access.
 */
export const designTokens = {
  colors,
  chartColors,
  spacing,
  borderRadius,
  fontFamily,
  fontSize,
  fontWeight,
  shadows,
  transitionDuration,
  transitionTimingFunction,
  zIndex,
  breakpoints,
  layout,
  buttonTokens,
  inputTokens,
  cardTokens,
} as const

export type DesignTokens = typeof designTokens
export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type BorderRadiusToken = keyof typeof borderRadius
export type FontSizeToken = keyof typeof fontSize
export type ShadowToken = keyof typeof shadows
export type BreakpointToken = keyof typeof breakpoints

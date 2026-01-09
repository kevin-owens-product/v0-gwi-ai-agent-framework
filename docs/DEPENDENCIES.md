# Dependencies Audit

**Project:** GWI AI Agent Framework
**Audit Date:** 2024-01-09
**Node Version:** 18+

---

## Security Audit Results

```
npm audit
found 0 vulnerabilities
```

**Status:** No known security vulnerabilities detected.

---

## Production Dependencies (40 packages)

### Framework & Runtime

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `next` | 16.0.10 | React framework with App Router | 16.1.1 |
| `react` | 19.2.0 | UI library | 19.2.3 |
| `react-dom` | 19.2.0 | React DOM bindings | 19.2.3 |
| `typescript` | ^5 | TypeScript compiler | 5.9.3 |

### Authentication

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `next-auth` | ^5.0.0-beta.25 | Authentication library | 5.0.0-beta.30 |
| `@auth/prisma-adapter` | ^2.7.4 | Prisma adapter for NextAuth | 2.11.1 |
| `bcryptjs` | ^2.4.3 | Password hashing | 3.0.3 |

### Database & ORM

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `@prisma/client` | ^5.22.0 | Prisma ORM client | 7.2.0 (major) |
| `prisma` | ^5.22.0 | Prisma CLI | 7.2.0 (major) |

### UI Components (Radix UI)

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `@radix-ui/react-accordion` | 1.2.2 | Accordion component | 1.2.12 |
| `@radix-ui/react-alert-dialog` | 1.1.4 | Alert dialog component | 1.1.15 |
| `@radix-ui/react-aspect-ratio` | 1.1.1 | Aspect ratio container | 1.1.8 |
| `@radix-ui/react-avatar` | 1.1.2 | Avatar component | 1.1.11 |
| `@radix-ui/react-checkbox` | 1.1.3 | Checkbox component | 1.3.3 |
| `@radix-ui/react-collapsible` | 1.1.2 | Collapsible component | 1.1.12 |
| `@radix-ui/react-context-menu` | 2.2.4 | Context menu component | 2.2.16 |
| `@radix-ui/react-dialog` | 1.1.4 | Dialog/modal component | 1.1.15 |
| `@radix-ui/react-dropdown-menu` | 2.1.4 | Dropdown menu component | 2.1.16 |
| `@radix-ui/react-hover-card` | 1.1.4 | Hover card component | 1.1.15 |
| `@radix-ui/react-label` | 2.1.1 | Form label component | 2.1.8 |
| `@radix-ui/react-menubar` | 1.1.4 | Menu bar component | 1.1.16 |
| `@radix-ui/react-navigation-menu` | 1.2.3 | Navigation menu | 1.2.14 |
| `@radix-ui/react-popover` | 1.1.4 | Popover component | 1.1.15 |
| `@radix-ui/react-progress` | 1.1.1 | Progress bar component | 1.1.8 |
| `@radix-ui/react-radio-group` | 1.2.2 | Radio group component | 1.3.8 |
| `@radix-ui/react-scroll-area` | 1.2.2 | Scroll area component | 1.2.10 |
| `@radix-ui/react-select` | 2.1.4 | Select component | 2.2.6 |
| `@radix-ui/react-separator` | 1.1.1 | Separator component | 1.1.8 |
| `@radix-ui/react-slider` | 1.2.2 | Slider component | 1.3.6 |
| `@radix-ui/react-slot` | 1.1.1 | Slot primitive | 1.2.4 |
| `@radix-ui/react-switch` | 1.1.2 | Switch component | 1.2.6 |
| `@radix-ui/react-tabs` | 1.1.2 | Tabs component | 1.1.13 |
| `@radix-ui/react-toast` | 1.2.4 | Toast notification | 1.2.15 |
| `@radix-ui/react-toggle` | 1.1.1 | Toggle component | 1.1.10 |
| `@radix-ui/react-toggle-group` | 1.1.1 | Toggle group component | 1.1.11 |
| `@radix-ui/react-tooltip` | 1.1.6 | Tooltip component | 1.2.8 |

### Styling

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `tailwindcss` | ^4.1.9 | CSS framework | 4.1.18 |
| `@tailwindcss/postcss` | ^4.1.9 | PostCSS plugin | 4.1.18 |
| `tailwind-merge` | ^3.3.1 | Class merging utility | 3.4.0 |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities | - |
| `clsx` | ^2.1.1 | Class name utility | - |
| `class-variance-authority` | ^0.7.1 | CSS variants utility | - |
| `tw-animate-css` | 1.3.3 | Animation CSS | 1.4.0 |
| `postcss` | ^8.5 | CSS processor | 8.5.6 |
| `autoprefixer` | ^10.4.20 | CSS autoprefixer | 10.4.23 |

### Forms & Validation

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `react-hook-form` | ^7.60.0 | Form state management | 7.70.0 |
| `@hookform/resolvers` | ^3.10.0 | Form validation resolvers | 5.2.2 (major) |
| `zod` | 3.25.76 | Schema validation | 4.3.5 (major) |

### Data & API

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `@tanstack/react-query` | ^5.62.2 | Data fetching/caching | 5.90.16 |
| `stripe` | ^17.3.1 | Payment processing | 20.1.2 (major) |

### Infrastructure

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `@upstash/ratelimit` | ^2.0.4 | Rate limiting | 2.0.7 |
| `@upstash/redis` | ^1.34.3 | Redis client | 1.36.1 |

### UI Utilities

| Package | Current | Purpose | Update Available |
|---------|---------|---------|------------------|
| `lucide-react` | ^0.454.0 | Icon library | 0.562.0 |
| `recharts` | 2.15.4 | Charts library | 3.6.0 (major) |
| `react-markdown` | 10.1.0 | Markdown renderer | - |
| `react-day-picker` | 9.8.0 | Date picker | 9.13.0 |
| `react-resizable-panels` | ^2.1.7 | Resizable panels | 4.3.3 (major) |
| `embla-carousel-react` | 8.5.1 | Carousel component | 8.6.0 |
| `input-otp` | 1.4.1 | OTP input | 1.4.2 |
| `sonner` | ^1.7.4 | Toast notifications | 2.0.7 (major) |
| `vaul` | ^1.1.2 | Drawer component | - |
| `cmdk` | 1.0.4 | Command palette | 1.1.1 |
| `date-fns` | 4.1.0 | Date utilities | - |
| `next-themes` | ^0.4.6 | Theme management | - |
| `tsx` | ^4.19.0 | TypeScript executor | 4.21.0 |

---

## Dev Dependencies (4 packages)

| Package | Current | Purpose |
|---------|---------|---------|
| `@types/bcryptjs` | ^2.4.6 | TypeScript types for bcryptjs |
| `@types/node` | ^22 | TypeScript types for Node.js |
| `@types/react` | ^19 | TypeScript types for React |
| `@types/react-dom` | ^19 | TypeScript types for React DOM |

---

## Missing Dependencies (Recommended to Add)

### Testing

| Package | Purpose | Priority |
|---------|---------|----------|
| `vitest` | Unit test runner | High |
| `@vitejs/plugin-react` | Vitest React plugin | High |
| `@testing-library/react` | React component testing | High |
| `@testing-library/jest-dom` | DOM matchers | High |
| `@testing-library/user-event` | User event simulation | High |
| `jsdom` | DOM environment for testing | High |
| `msw` | Mock Service Worker | High |
| `@faker-js/faker` | Test data generation | Medium |
| `playwright` | E2E testing | High |
| `@playwright/test` | Playwright test runner | High |
| `@axe-core/playwright` | Accessibility testing | Medium |

### Code Quality

| Package | Purpose | Priority |
|---------|---------|----------|
| `eslint` | Code linting | High |
| `@typescript-eslint/eslint-plugin` | TypeScript ESLint rules | High |
| `@typescript-eslint/parser` | TypeScript parser | High |
| `eslint-plugin-react-hooks` | React hooks rules | High |
| `eslint-plugin-jsx-a11y` | Accessibility rules | Medium |
| `prettier` | Code formatter | High |
| `prettier-plugin-tailwindcss` | Tailwind class sorting | Medium |
| `husky` | Git hooks | Medium |
| `lint-staged` | Staged file linting | Medium |

### Development

| Package | Purpose | Priority |
|---------|---------|----------|
| `@next/bundle-analyzer` | Bundle size analysis | Low |

---

## Update Recommendations

### Safe to Update (Patch/Minor)

These can be updated with minimal risk:

```bash
npm update next react react-dom @tanstack/react-query @upstash/ratelimit @upstash/redis lucide-react tailwind-merge @radix-ui/* date-fns embla-carousel-react input-otp cmdk tw-animate-css autoprefixer postcss tailwindcss
```

### Requires Testing (Major Updates)

These have breaking changes and require careful testing:

| Package | From | To | Notes |
|---------|------|-----|-------|
| `@prisma/client` | 5.22.0 | 7.2.0 | Major version, review migration guide |
| `prisma` | 5.22.0 | 7.2.0 | Major version, review migration guide |
| `stripe` | 17.3.1 | 20.1.2 | Major version, review breaking changes |
| `zod` | 3.25.76 | 4.3.5 | Major version, review breaking changes |
| `@hookform/resolvers` | 3.10.0 | 5.2.2 | Major version |
| `recharts` | 2.15.4 | 3.6.0 | Major version, review breaking changes |
| `sonner` | 1.7.4 | 2.0.7 | Major version |
| `react-resizable-panels` | 2.1.7 | 4.3.3 | Major version |

### Keep Current (Beta)

| Package | Current | Notes |
|---------|---------|-------|
| `next-auth` | 5.0.0-beta.25 | Stay on beta track for v5 features |

---

## Dependency Graph

```
Core Framework
├── next (16.0.10)
│   ├── react (19.2.0)
│   └── react-dom (19.2.0)
│
Authentication
├── next-auth (5.0.0-beta.25)
│   └── @auth/prisma-adapter
└── bcryptjs
│
Database
├── prisma (5.22.0)
└── @prisma/client (5.22.0)
│
UI Layer
├── @radix-ui/* (27 packages)
├── tailwindcss (4.1.9)
│   ├── tailwind-merge
│   ├── tailwindcss-animate
│   └── @tailwindcss/postcss
├── lucide-react (icons)
├── recharts (charts)
└── sonner (toasts)
│
Forms
├── react-hook-form
├── @hookform/resolvers
└── zod
│
Data Fetching
├── @tanstack/react-query
│
Payments
└── stripe
│
Rate Limiting
├── @upstash/ratelimit
└── @upstash/redis
```

---

## Unused Dependencies

Based on analysis, no unused dependencies were detected. All packages are actively used in the codebase.

---

## Action Items

### Immediate (Before Production)

1. Install testing dependencies
2. Configure ESLint with strict rules
3. Set up pre-commit hooks

### Short-term (Within 2 weeks)

1. Update all patch/minor versions
2. Review Prisma 7.x migration guide
3. Evaluate Stripe API changes

### Medium-term (Within 1 month)

1. Plan major version upgrades
2. Implement bundle size analysis
3. Set up automated dependency updates (Dependabot/Renovate)

---

## Installation Command for Testing Dependencies

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @faker-js/faker @playwright/test
```

## Installation Command for Code Quality Dependencies

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier prettier-plugin-tailwindcss husky lint-staged
```

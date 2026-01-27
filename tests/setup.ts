import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { server } from './mocks/server'
import messages from '../messages/en.json'

// Helper to get nested value from object by dot-notation path
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

// Mock next-intl with actual translations
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    let translation = getNestedValue(messages as Record<string, unknown>, fullKey) || key

    if (values && typeof translation === 'string') {
      // Handle interpolation
      Object.entries(values).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
      // Handle simple pluralization - extract the "other" form
      const pluralMatch = translation.match(/\{(\w+), plural, one \{([^}]+)\} other \{([^}]+)\}\}/)
      if (pluralMatch) {
        const [, countKey, singular, plural] = pluralMatch
        const count = values[countKey] as number
        const form = count === 1 ? singular : plural
        translation = form.replace('#', String(count))
      }
    }
    return translation
  },
  useLocale: () => 'en',
  useMessages: () => messages,
  useNow: () => new Date(),
  useTimeZone: () => 'UTC',
  useFormatter: () => ({
    number: (value: number) => String(value),
    dateTime: (value: Date) => value.toISOString(),
    relativeTime: (value: Date) => value.toISOString(),
  }),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Setup MSW - use 'bypass' to allow tests that mock fetch directly
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

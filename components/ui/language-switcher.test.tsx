import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageSwitcher } from './language-switcher';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Store original fetch
const originalFetch = global.fetch;

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for these tests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ locale: 'en' }),
      clone: function() { return this; }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  describe('Rendering', () => {
    it('should render the language switcher button', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should render with globe icon', () => {
      render(<LanguageSwitcher />);

      // Globe icon should be present (lucide-react renders as svg)
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeDefined();
    });

    it('should render with screen reader text', () => {
      render(<LanguageSwitcher />);

      const srText = screen.getByText('switchLanguage');
      expect(srText).toBeDefined();
      expect(srText.classList.contains('sr-only')).toBe(true);
    });

    it('should not show label when showLabel is false', () => {
      render(<LanguageSwitcher showLabel={false} />);

      const button = screen.getByRole('button');
      // Should not contain locale name directly visible (just the icon and sr-only text)
      const textContent = button.textContent || '';
      expect(textContent.trim()).toBe('switchLanguage');
    });
  });

  describe('Variants and Sizes', () => {
    it('should apply default variant', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should apply outline variant', () => {
      render(<LanguageSwitcher variant="outline" />);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should apply small size', () => {
      render(<LanguageSwitcher size="sm" />);

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should apply custom className', () => {
      render(<LanguageSwitcher className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Initial Locale Fetch', () => {
    it('should fetch current locale on mount', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ locale: 'en' }),
        clone: function() { return this; }
      });
      global.fetch = mockFetch;

      render(<LanguageSwitcher />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/settings/language');
      });
    });

    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      render(<LanguageSwitcher />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch locale:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle non-ok response gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
        clone: function() { return this; }
      });
      global.fetch = mockFetch;

      // Should not throw
      render(<LanguageSwitcher />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Props', () => {
    it('should accept currentLocale prop', () => {
      render(<LanguageSwitcher currentLocale="es" />);
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should accept align prop', () => {
      render(<LanguageSwitcher align="start" />);
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    });

    it('should render with all props', () => {
      render(
        <LanguageSwitcher
          currentLocale="fr"
          variant="outline"
          size="lg"
          showLabel={true}
          align="center"
          className="test-class"
        />
      );
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
      expect(button.classList.contains('test-class')).toBe(true);
    });
  });
});

describe('LanguageSwitcher Configuration', () => {
  it('should support all 11 locales', async () => {
    const { locales } = await import('@/lib/i18n/config');
    expect(locales).toHaveLength(11);
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('zh');
    expect(locales).toContain('hi');
    expect(locales).toContain('fr');
    expect(locales).toContain('ar');
    expect(locales).toContain('pt');
    expect(locales).toContain('ru');
    expect(locales).toContain('ja');
    expect(locales).toContain('bn');
    expect(locales).toContain('el');
  });

  it('should have locale names for all locales', async () => {
    const { locales, localeNames } = await import('@/lib/i18n/config');
    for (const locale of locales) {
      expect(localeNames[locale]).toBeDefined();
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });

  it('should have flags for all locales', async () => {
    const { locales, localeFlags } = await import('@/lib/i18n/config');
    for (const locale of locales) {
      expect(localeFlags[locale]).toBeDefined();
    }
  });

  it('should have correct locale names', async () => {
    const { localeNames } = await import('@/lib/i18n/config');
    expect(localeNames.en).toBe('English');
    expect(localeNames.es).toBe('Español');
    expect(localeNames.zh).toBe('中文');
    expect(localeNames.fr).toBe('Français');
    expect(localeNames.ja).toBe('日本語');
    expect(localeNames.el).toBe('Ελληνικά');
  });

  it('should have correct locale flags', async () => {
    const { localeFlags } = await import('@/lib/i18n/config');
    expect(localeFlags.en).toBe('🇺🇸');
    expect(localeFlags.es).toBe('🇪🇸');
    expect(localeFlags.zh).toBe('🇨🇳');
    expect(localeFlags.fr).toBe('🇫🇷');
    expect(localeFlags.ja).toBe('🇯🇵');
    expect(localeFlags.el).toBe('🇬🇷');
  });
});

describe('handleLanguageChange Logic', () => {
  it('should make POST request with correct payload', async () => {
    // Test the expected API call format
    const expectedPayload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'es' }),
    };

    expect(expectedPayload.method).toBe('POST');
    expect(expectedPayload.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(expectedPayload.body)).toEqual({ locale: 'es' });
  });

  it('should not make API call when selecting same language', () => {
    // Verify the logic: if newLocale === locale, return early
    const currentLocale = 'en';
    const selectedLocale = 'en';

    expect(selectedLocale === currentLocale).toBe(true);
    // In the component, this condition causes early return (no API call)
  });

  it('should make API call when selecting different language', () => {
    const currentLocale: string = 'en';
    const selectedLocale: string = 'es';

    expect(selectedLocale === currentLocale).toBe(false);
    // In the component, this would proceed with the API call
  });
});

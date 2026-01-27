import { describe, it, expect } from 'vitest';

/**
 * Unit tests for i18n deep merge functionality
 * Tests the fallback behavior for missing and placeholder translations
 */

// Export deepMerge for testing by recreating the function
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      );
    } else if (result[key] === undefined || (typeof result[key] === 'string' && (result[key] as string).startsWith('['))) {
      // Use source (English) if target is undefined OR if target is a placeholder like [ES]
      result[key] = source[key];
    }
  }
  return result;
}

describe('i18n Deep Merge', () => {
  describe('Basic Merging', () => {
    it('should keep translated values from target', () => {
      const target = { greeting: 'Hola' };
      const source = { greeting: 'Hello' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Hola');
    });

    it('should fill in missing keys from source', () => {
      const target = { greeting: 'Hola' };
      const source = { greeting: 'Hello', farewell: 'Goodbye' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Hola');
      expect(result.farewell).toBe('Goodbye');
    });

    it('should handle empty target', () => {
      const target = {};
      const source = { greeting: 'Hello', farewell: 'Goodbye' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Hello');
      expect(result.farewell).toBe('Goodbye');
    });
  });

  describe('Placeholder Replacement', () => {
    it('should replace [ES] placeholder with English value', () => {
      const target = { greeting: '[ES] Hello' };
      const source = { greeting: 'Hello' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Hello');
    });

    it('should replace [RU] placeholder with English value', () => {
      const target = { greeting: '[RU] Welcome' };
      const source = { greeting: 'Welcome' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Welcome');
    });

    it('should replace [ZH] placeholder with English value', () => {
      const target = { greeting: '[ZH] Hello World' };
      const source = { greeting: 'Hello World' };

      const result = deepMerge(target, source);
      expect(result.greeting).toBe('Hello World');
    });

    it('should replace any two-letter code placeholder', () => {
      const target = {
        a: '[FR] Text',
        b: '[DE] More text',
        c: '[JA] Japanese text'
      };
      const source = {
        a: 'English A',
        b: 'English B',
        c: 'English C'
      };

      const result = deepMerge(target, source);
      expect(result.a).toBe('English A');
      expect(result.b).toBe('English B');
      expect(result.c).toBe('English C');
    });

    it('should NOT replace translated strings that happen to contain brackets', () => {
      const target = { message: 'Use [brackets] for code' };
      const source = { message: 'English message' };

      const result = deepMerge(target, source);
      expect(result.message).toBe('Use [brackets] for code');
    });

    it('should only replace if placeholder is at start of string', () => {
      const target = { message: 'Already translated [ES] not a placeholder' };
      const source = { message: 'English message' };

      const result = deepMerge(target, source);
      expect(result.message).toBe('Already translated [ES] not a placeholder');
    });
  });

  describe('Nested Objects', () => {
    it('should handle nested objects', () => {
      const target = {
        common: {
          greeting: 'Hola',
          farewell: '[ES] Goodbye'
        }
      };
      const source = {
        common: {
          greeting: 'Hello',
          farewell: 'Goodbye'
        }
      };

      const result = deepMerge(target, source) as Record<string, Record<string, string>>;
      expect(result.common.greeting).toBe('Hola');
      expect(result.common.farewell).toBe('Goodbye');
    });

    it('should fill in missing nested keys', () => {
      const target = {
        common: {
          greeting: 'Hola'
        }
      };
      const source = {
        common: {
          greeting: 'Hello',
          farewell: 'Goodbye',
          welcome: 'Welcome'
        }
      };

      const result = deepMerge(target, source) as Record<string, Record<string, string>>;
      expect(result.common.greeting).toBe('Hola');
      expect(result.common.farewell).toBe('Goodbye');
      expect(result.common.welcome).toBe('Welcome');
    });

    it('should fill in entirely missing nested objects', () => {
      const target = {
        common: {
          greeting: 'Hola'
        }
      };
      const source = {
        common: {
          greeting: 'Hello'
        },
        admin: {
          title: 'Admin Panel'
        }
      };

      const result = deepMerge(target, source) as Record<string, Record<string, string>>;
      expect(result.common.greeting).toBe('Hola');
      expect(result.admin.title).toBe('Admin Panel');
    });

    it('should handle deeply nested objects', () => {
      const target = {
        admin: {
          settings: {
            security: {
              title: 'Título de Seguridad',
              description: '[ES] Security settings'
            }
          }
        }
      };
      const source = {
        admin: {
          settings: {
            security: {
              title: 'Security Title',
              description: 'Security settings',
              newKey: 'New feature'
            }
          }
        }
      };

      const result = deepMerge(target, source) as {
        admin: { settings: { security: Record<string, string> } }
      };
      expect(result.admin.settings.security.title).toBe('Título de Seguridad');
      expect(result.admin.settings.security.description).toBe('Security settings');
      expect(result.admin.settings.security.newKey).toBe('New feature');
    });
  });

  describe('Arrays', () => {
    it('should not merge arrays, keep target array', () => {
      const target = { items: ['uno', 'dos'] };
      const source = { items: ['one', 'two', 'three'] };

      const result = deepMerge(target, source);
      expect(result.items).toEqual(['uno', 'dos']);
    });

    it('should fill in missing array from source', () => {
      const target = {};
      const source = { items: ['one', 'two'] };

      const result = deepMerge(target, source);
      expect(result.items).toEqual(['one', 'two']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in target', () => {
      const target = { value: null } as Record<string, unknown>;
      const source = { value: 'English value' };

      const result = deepMerge(target, source);
      // null is not undefined, so it should be kept
      expect(result.value).toBe(null);
    });

    it('should handle undefined values in target', () => {
      const target = { value: undefined } as Record<string, unknown>;
      const source = { value: 'English value' };

      const result = deepMerge(target, source);
      expect(result.value).toBe('English value');
    });

    it('should handle boolean values', () => {
      const target = { enabled: false };
      const source = { enabled: true };

      const result = deepMerge(target, source);
      expect(result.enabled).toBe(false);
    });

    it('should handle number values', () => {
      const target = { count: 5 };
      const source = { count: 10 };

      const result = deepMerge(target, source);
      expect(result.count).toBe(5);
    });

    it('should handle empty string in target', () => {
      const target = { value: '' };
      const source = { value: 'English value' };

      const result = deepMerge(target, source);
      expect(result.value).toBe('');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical translation file structure', () => {
      const spanishMessages = {
        common: {
          save: 'Guardar',
          cancel: 'Cancelar',
          delete: '[ES] Delete',
          loading: '[ES] Loading...'
        },
        admin: {
          dashboard: {
            title: 'Panel de Control',
            welcome: '[ES] Welcome to the admin panel'
          }
        }
      };

      const englishMessages = {
        common: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          loading: 'Loading...',
          confirm: 'Confirm'
        },
        admin: {
          dashboard: {
            title: 'Dashboard',
            welcome: 'Welcome to the admin panel',
            newFeature: 'New Feature'
          },
          settings: {
            title: 'Settings'
          }
        }
      };

      const result = deepMerge(spanishMessages, englishMessages);

      const common = result.common as Record<string, string>;
      expect(common.save).toBe('Guardar');
      expect(common.cancel).toBe('Cancelar');
      expect(common.delete).toBe('Delete');
      expect(common.loading).toBe('Loading...');
      expect(common.confirm).toBe('Confirm');

      const dashboard = (result.admin as Record<string, unknown>).dashboard as Record<string, string>;
      expect(dashboard.title).toBe('Panel de Control');
      expect(dashboard.welcome).toBe('Welcome to the admin panel');
      expect(dashboard.newFeature).toBe('New Feature');

      const settings = (result.admin as Record<string, unknown>).settings as Record<string, string>;
      expect(settings.title).toBe('Settings');
    });
  });
});

describe('Locale Configuration', () => {
  it('should have all required locales', async () => {
    const { locales } = await import('./config');
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
    expect(locales.length).toBe(11);
  });

  it('should have English as default locale', async () => {
    const { defaultLocale } = await import('./config');
    expect(defaultLocale).toBe('en');
  });

  it('should have locale names for all locales', async () => {
    const { locales, localeNames } = await import('./config');
    for (const locale of locales) {
      expect(localeNames[locale]).toBeDefined();
      expect(typeof localeNames[locale]).toBe('string');
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });

  it('should have locale flags for all locales', async () => {
    const { locales, localeFlags } = await import('./config');
    for (const locale of locales) {
      expect(localeFlags[locale]).toBeDefined();
      expect(typeof localeFlags[locale]).toBe('string');
    }
  });
});

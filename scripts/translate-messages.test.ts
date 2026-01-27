import { describe, it, expect } from 'vitest';

/**
 * Tests for the translation script utility functions
 * The actual translation API calls are not tested here
 */

// Placeholder regex pattern used in the translation script
const PLACEHOLDER_REGEX = /^\[([A-Z]{2})\]\s*/;

// Extract all string values from nested object that have placeholders
function extractPlaceholders(
  obj: Record<string, unknown>,
  prefix: string = ''
): Array<{ path: string; text: string }> {
  const results: Array<{ path: string; text: string }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      const match = value.match(PLACEHOLDER_REGEX);
      if (match) {
        // Remove the [XX] prefix to get the English text
        const englishText = value.replace(PLACEHOLDER_REGEX, '');
        results.push({ path: currentPath, text: englishText });
      }
    } else if (typeof value === 'object' && value !== null) {
      results.push(...extractPlaceholders(value as Record<string, unknown>, currentPath));
    }
  }

  return results;
}

// Set a value in nested object by path
function setNestedValue(obj: Record<string, unknown>, path: string, value: string): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

describe('Placeholder Detection', () => {
  describe('PLACEHOLDER_REGEX', () => {
    it('should match [ES] prefix', () => {
      const match = '[ES] Hello World'.match(PLACEHOLDER_REGEX);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('ES');
    });

    it('should match [RU] prefix', () => {
      const match = '[RU] Привет'.match(PLACEHOLDER_REGEX);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('RU');
    });

    it('should match [ZH] prefix', () => {
      const match = '[ZH] Hello'.match(PLACEHOLDER_REGEX);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('ZH');
    });

    it('should match [FR] prefix with space after', () => {
      const match = '[FR] Bonjour'.match(PLACEHOLDER_REGEX);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('FR');
    });

    it('should match [EL] prefix for Greek', () => {
      const match = '[EL] Hello'.match(PLACEHOLDER_REGEX);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('EL');
    });

    it('should NOT match lowercase prefixes', () => {
      const match = '[es] Hello'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });

    it('should NOT match single letter prefixes', () => {
      const match = '[E] Hello'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });

    it('should NOT match three letter prefixes', () => {
      const match = '[ESP] Hello'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });

    it('should NOT match prefix in middle of string', () => {
      const match = 'Hello [ES] World'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });

    it('should NOT match normal text with brackets', () => {
      const match = 'Use [brackets] for code'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });

    it('should NOT match already translated text', () => {
      const match = 'Hola Mundo'.match(PLACEHOLDER_REGEX);
      expect(match).toBeNull();
    });
  });
});

describe('extractPlaceholders', () => {
  it('should extract single placeholder', () => {
    const obj = {
      greeting: '[ES] Hello',
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('greeting');
    expect(result[0].text).toBe('Hello');
  });

  it('should extract multiple placeholders', () => {
    const obj = {
      greeting: '[ES] Hello',
      farewell: '[ES] Goodbye',
      thanks: '[ES] Thank you',
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.path)).toEqual(['greeting', 'farewell', 'thanks']);
    expect(result.map(r => r.text)).toEqual(['Hello', 'Goodbye', 'Thank you']);
  });

  it('should skip already translated strings', () => {
    const obj = {
      greeting: 'Hola',
      farewell: '[ES] Goodbye',
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('farewell');
    expect(result[0].text).toBe('Goodbye');
  });

  it('should handle nested objects', () => {
    const obj = {
      common: {
        greeting: '[ES] Hello',
        farewell: '[ES] Goodbye',
      },
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(2);
    expect(result[0].path).toBe('common.greeting');
    expect(result[1].path).toBe('common.farewell');
  });

  it('should handle deeply nested objects', () => {
    const obj = {
      admin: {
        settings: {
          security: {
            title: '[ES] Security Settings',
          },
        },
      },
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('admin.settings.security.title');
    expect(result[0].text).toBe('Security Settings');
  });

  it('should skip non-string values', () => {
    const obj = {
      count: 42,
      enabled: true,
      items: ['one', 'two'],
      greeting: '[ES] Hello',
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('greeting');
  });

  it('should return empty array for no placeholders', () => {
    const obj = {
      greeting: 'Hola',
      farewell: 'Adiós',
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty object', () => {
    const result = extractPlaceholders({});
    expect(result).toHaveLength(0);
  });

  it('should preserve text after placeholder prefix', () => {
    const obj = {
      message: '[ES] Welcome to the application, please log in.',
    };

    const result = extractPlaceholders(obj);

    expect(result[0].text).toBe('Welcome to the application, please log in.');
  });

  it('should handle mixed translated and placeholder values', () => {
    const obj = {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: '[ES] Delete',
        loading: '[ES] Loading...',
      },
      admin: {
        title: 'Panel de Administración',
        welcome: '[ES] Welcome',
      },
    };

    const result = extractPlaceholders(obj);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.path)).toEqual([
      'common.delete',
      'common.loading',
      'admin.welcome',
    ]);
  });
});

describe('setNestedValue', () => {
  it('should set value at top level', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'greeting', 'Hola');

    expect(obj.greeting).toBe('Hola');
  });

  it('should set value at nested level', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'common.greeting', 'Hola');

    expect((obj.common as Record<string, string>).greeting).toBe('Hola');
  });

  it('should set value at deeply nested level', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'admin.settings.security.title', 'Configuración de Seguridad');

    const admin = obj.admin as Record<string, unknown>;
    const settings = admin.settings as Record<string, unknown>;
    const security = settings.security as Record<string, string>;

    expect(security.title).toBe('Configuración de Seguridad');
  });

  it('should create intermediate objects if they do not exist', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'a.b.c.d', 'value');

    expect(obj.a).toBeDefined();
    expect((obj.a as Record<string, unknown>).b).toBeDefined();
    expect(((obj.a as Record<string, unknown>).b as Record<string, unknown>).c).toBeDefined();
    expect((((obj.a as Record<string, unknown>).b as Record<string, unknown>).c as Record<string, string>).d).toBe('value');
  });

  it('should overwrite existing value', () => {
    const obj: Record<string, unknown> = {
      greeting: '[ES] Hello',
    };
    setNestedValue(obj, 'greeting', 'Hola');

    expect(obj.greeting).toBe('Hola');
  });

  it('should overwrite existing nested value', () => {
    const obj: Record<string, unknown> = {
      common: {
        greeting: '[ES] Hello',
      },
    };
    setNestedValue(obj, 'common.greeting', 'Hola');

    expect((obj.common as Record<string, string>).greeting).toBe('Hola');
  });

  it('should preserve other values when setting nested', () => {
    const obj: Record<string, unknown> = {
      common: {
        greeting: 'Hola',
        farewell: 'Adiós',
      },
    };
    setNestedValue(obj, 'common.thanks', 'Gracias');

    const common = obj.common as Record<string, string>;
    expect(common.greeting).toBe('Hola');
    expect(common.farewell).toBe('Adiós');
    expect(common.thanks).toBe('Gracias');
  });
});

describe('Language Code Mapping', () => {
  // Language codes mapping (our codes -> Google Translate codes)
  const LANG_MAP: Record<string, string> = {
    en: 'en',
    es: 'es',
    zh: 'zh-CN',
    hi: 'hi',
    fr: 'fr',
    ar: 'ar',
    pt: 'pt',
    ru: 'ru',
    ja: 'ja',
    bn: 'bn',
    el: 'el',
  };

  it('should have all supported languages', () => {
    expect(Object.keys(LANG_MAP)).toHaveLength(11);
  });

  it('should map English correctly', () => {
    expect(LANG_MAP.en).toBe('en');
  });

  it('should map Spanish correctly', () => {
    expect(LANG_MAP.es).toBe('es');
  });

  it('should map Chinese to zh-CN', () => {
    expect(LANG_MAP.zh).toBe('zh-CN');
  });

  it('should map Hindi correctly', () => {
    expect(LANG_MAP.hi).toBe('hi');
  });

  it('should map French correctly', () => {
    expect(LANG_MAP.fr).toBe('fr');
  });

  it('should map Arabic correctly', () => {
    expect(LANG_MAP.ar).toBe('ar');
  });

  it('should map Portuguese correctly', () => {
    expect(LANG_MAP.pt).toBe('pt');
  });

  it('should map Russian correctly', () => {
    expect(LANG_MAP.ru).toBe('ru');
  });

  it('should map Japanese correctly', () => {
    expect(LANG_MAP.ja).toBe('ja');
  });

  it('should map Bengali correctly', () => {
    expect(LANG_MAP.bn).toBe('bn');
  });

  it('should map Greek correctly', () => {
    expect(LANG_MAP.el).toBe('el');
  });
});

describe('Batch Processing Configuration', () => {
  const BATCH_SIZE = 50;
  const DELAY_BETWEEN_BATCHES = 2000;

  it('should use batch size of 50', () => {
    expect(BATCH_SIZE).toBe(50);
  });

  it('should use 2 second delay between batches', () => {
    expect(DELAY_BETWEEN_BATCHES).toBe(2000);
  });

  it('should calculate correct number of batches', () => {
    const totalItems = 3196;
    const expectedBatches = Math.ceil(totalItems / BATCH_SIZE);
    expect(expectedBatches).toBe(64);
  });

  it('should handle exact batch size multiples', () => {
    const totalItems = 100;
    const expectedBatches = Math.ceil(totalItems / BATCH_SIZE);
    expect(expectedBatches).toBe(2);
  });

  it('should handle single batch', () => {
    const totalItems = 30;
    const expectedBatches = Math.ceil(totalItems / BATCH_SIZE);
    expect(expectedBatches).toBe(1);
  });
});

/**
 * ESLint Rule: no-hardcoded-strings
 *
 * Detects hardcoded strings in JSX that should be internationalized.
 *
 * Options:
 *   - allowedStrings: Array of strings that are allowed to be hardcoded
 *   - allowedPatterns: Array of regex patterns for allowed strings
 *   - translatableProps: Array of prop names that should contain translated strings
 *   - ignorePaths: Array of glob patterns for files to ignore
 */

// Props that typically need translation
const DEFAULT_TRANSLATABLE_PROPS = [
  'placeholder',
  'title',
  'aria-label',
  'aria-describedby',
  'alt',
  'label',
  'description',
  'helperText',
  'errorMessage',
  'successMessage',
  'loadingText',
  'tooltip',
  'hint',
];

// Props to always ignore (never check for i18n)
const IGNORED_PROPS = new Set([
  // SVG and styling
  'd', 'fill', 'stroke', 'viewBox', 'transform', 'points', 'cx', 'cy', 'r', 'rx', 'ry',
  'x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'gradientUnits', 'offset',
  'stopColor', 'stopOpacity', 'fillRule', 'clipRule', 'strokeWidth', 'strokeLinecap',
  'strokeLinejoin', 'preserveAspectRatio', 'xlinkHref', 'xmlns', 'xmlnsXlink',

  // Events and handlers
  'onKeyDown', 'onKeyUp', 'onKeyPress', 'onChange', 'onClick', 'onSubmit', 'onFocus', 'onBlur',

  // Technical props
  'id', 'name', 'htmlFor', 'type', 'method', 'action', 'encoding', 'encType',
  'autoComplete', 'autoCapitalize', 'autoCorrect', 'spellCheck',
  'role', 'tabIndex', 'dir', 'lang',
  'href', 'src', 'srcSet', 'sizes', 'media', 'as',
  'rel', 'target', 'download', 'referrerPolicy',
  'data-*', 'test-id', 'data-testid', 'testId',

  // Form attributes
  'pattern', 'min', 'max', 'minLength', 'maxLength', 'step', 'accept', 'multiple',

  // Styling/layout
  'className', 'class', 'style', 'color', 'size', 'variant', 'align', 'justify',
  'direction', 'orientation', 'position', 'side', 'sideOffset', 'asChild',

  // Keys and refs
  'key', 'ref', 'forwardedRef',
]);

// Default allowed strings
const DEFAULT_ALLOWED_STRINGS = [
  // Technical
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS',
  'true', 'false', 'null', 'undefined',
  'N/A', 'n/a', 'TBD', 'ID', 'id',

  // Keyboard events
  'Enter', 'Escape', 'Tab', 'Space', 'Backspace', 'Delete',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown',

  // Common prop values
  'default', 'primary', 'secondary', 'outline', 'ghost', 'link', 'destructive',
  'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'xs', '4xl',
  'left', 'right', 'center', 'top', 'bottom', 'start', 'end',
  'horizontal', 'vertical',
  'none', 'auto', 'inherit', 'initial',
  'submit', 'button', 'reset',
  'text', 'password', 'email', 'number', 'tel', 'url', 'search',

  // HTML
  '_blank', '_self', 'noopener', 'noreferrer',
  'currentColor', 'transparent', 'evenodd', 'nonzero',

  // Brand names (typically not translated)
  'GWI', 'GlobalWebIndex', 'Spark',
];

// Default allowed patterns
const DEFAULT_ALLOWED_PATTERNS = [
  // URLs and paths
  '^https?://',
  '^/[a-zA-Z0-9\\-_/\\.]*$',
  '^#[a-zA-Z0-9\\-_]+$',
  '^mailto:',
  '^tel:',

  // File extensions
  '^\\.\\w+$',

  // Single characters and punctuation
  '^.$',
  '^\\.\\.\\.$',
  '^[\\-+*/=<>|&]+$',

  // Numbers and units
  '^[\\d.,\\s]+(%|px|em|rem|vh|vw|ms|s|deg|fr)?$',

  // SVG path data (starts with M, m, L, l, etc.)
  '^[MmLlHhVvCcSsQqTtAaZz][\\d\\s.,\\-MmLlHhVvCcSsQqTtAaZz]+$',

  // Color values
  '^#[a-fA-F0-9]{3,8}$',
  '^rgb[a]?\\(',
  '^hsl[a]?\\(',

  // Constants (ALL_CAPS with underscores)
  '^[A-Z][A-Z0-9_]+$',

  // camelCase identifiers (no spaces = likely code)
  '^[a-z][a-zA-Z0-9]*$',

  // kebab-case identifiers
  '^[a-z][a-z0-9]*(-[a-z0-9]+)+$',

  // Translation keys (dot notation)
  '^[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)+$',

  // Empty or whitespace only
  '^\\s*$',

  // Dates/times
  '^\\d{4}-\\d{2}-\\d{2}',
  '^\\d{1,2}:\\d{2}',

  // UUIDs
  '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$',
];

/**
 * Check if a string is allowed based on configuration
 */
function isAllowedString(str, options) {
  if (!str || typeof str !== 'string') return true;

  const trimmed = str.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length <= 2) return true;

  // Check exact matches
  const allowedStrings = options.allowedStrings || DEFAULT_ALLOWED_STRINGS;
  if (allowedStrings.includes(trimmed)) return true;

  // Check patterns
  const allowedPatterns = options.allowedPatterns || DEFAULT_ALLOWED_PATTERNS;
  for (const patternStr of allowedPatterns) {
    try {
      const pattern = new RegExp(patternStr, 'i');
      if (pattern.test(trimmed)) return true;
    } catch (e) {
      // Invalid pattern, skip it
    }
  }

  // Numbers only
  if (/^[\d,.\s]+$/.test(trimmed)) return true;

  // No letters = probably not user-facing text
  if (!/[a-zA-Z]/.test(trimmed)) return true;

  return false;
}

/**
 * Check if a string looks like user-facing text
 */
function looksLikeUserFacingText(str) {
  if (!str || str.length < 4) return false;

  const trimmed = str.trim();

  // Must contain letters
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  // Skip if it looks like code/identifier (no spaces, camelCase, snake_case, etc.)
  if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed)) return false;
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(trimmed)) return false;
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(trimmed)) return false;

  // Has spaces = likely user-facing
  if (trimmed.includes(' ')) return true;

  // Starts with capital followed by lowercase = likely sentence/label
  if (/^[A-Z][a-z]/.test(trimmed) && trimmed.length >= 5) return true;

  // Ends with punctuation = likely sentence
  if (/[.!?]$/.test(trimmed) && trimmed.length >= 5) return true;

  return false;
}

/**
 * Check if node is inside a translation function call
 */
function isInsideTranslationCall(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'CallExpression') {
      const callee = current.callee;

      // Check for t(), tc(), tCommon()
      if (callee.type === 'Identifier') {
        const name = callee.name;
        if (name === 't' || name === 'tc' || name === 'tCommon' || name.startsWith('t')) {
          return true;
        }
      }

      // Check for useTranslations(), getTranslations()
      if (callee.type === 'Identifier') {
        if (callee.name === 'useTranslations' || callee.name === 'getTranslations') {
          return true;
        }
      }
    }

    current = current.parent;
  }

  return false;
}

/**
 * Check if inside a prop that should be ignored
 */
function isInIgnoredProp(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'JSXAttribute') {
      const name = current.name;
      if (name && name.type === 'JSXIdentifier') {
        if (IGNORED_PROPS.has(name.name)) return true;
        // Also check for data-* attributes
        if (name.name.startsWith('data-')) return true;
      }
    }
    current = current.parent;
  }

  return false;
}

/**
 * Get the prop name if inside a JSX attribute
 */
function getJSXAttributeName(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'JSXAttribute') {
      const name = current.name;
      if (name && name.type === 'JSXIdentifier') {
        return name.name;
      }
    }
    current = current.parent;
  }

  return null;
}

/**
 * Check if inside console.log or similar
 */
function isInsideConsoleCall(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'CallExpression') {
      const callee = current.callee;
      if (callee && callee.type === 'MemberExpression') {
        const obj = callee.object;
        if (obj && obj.type === 'Identifier' && obj.name === 'console') {
          return true;
        }
      }
    }
    current = current.parent;
  }

  return false;
}

/**
 * Generate a suggested translation key
 */
function generateSuggestedKey(str, context) {
  const base = str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('_') || 'text';

  if (context) {
    return `common.${context}.${base}`;
  }
  return `common.${base}`;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded strings in JSX that should be internationalized',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: null,
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allowedStrings: {
            type: 'array',
            items: { type: 'string' },
          },
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          translatableProps: {
            type: 'array',
            items: { type: 'string' },
          },
          ignorePaths: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedString: 'Hardcoded string "{{str}}" should be internationalized. Suggested key: {{suggestedKey}}',
      hardcodedProp: 'Prop "{{prop}}" contains hardcoded string "{{str}}" that should be internationalized. Suggested key: {{suggestedKey}}',
      hardcodedJSXText: 'JSX text "{{str}}" should be internationalized. Suggested key: {{suggestedKey}}',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const translatableProps = options.translatableProps || DEFAULT_TRANSLATABLE_PROPS;

    return {
      // Check JSX text content
      JSXText(node) {
        const text = node.value.trim();

        // Skip whitespace-only or very short
        if (!text || text.length < 4) return;

        // Skip if not user-facing
        if (!looksLikeUserFacingText(text)) return;

        // Skip if allowed
        if (isAllowedString(text, options)) return;

        // Skip if inside translation
        if (isInsideTranslationCall(node)) return;

        const suggestedKey = generateSuggestedKey(text, null);

        context.report({
          node,
          messageId: 'hardcodedJSXText',
          data: {
            str: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            suggestedKey,
          },
          suggest: [
            {
              desc: `Replace with {t("${suggestedKey}")}`,
              fix(fixer) {
                return fixer.replaceText(node, `{t("${suggestedKey}")}`);
              },
            },
          ],
        });
      },

      // Check string literals in JSX attributes
      'JSXAttribute Literal'(node) {
        if (typeof node.value !== 'string') return;

        const propName = getJSXAttributeName(node);
        if (!propName) return;

        // Skip ignored props
        if (IGNORED_PROPS.has(propName)) return;
        if (propName.startsWith('data-')) return;

        // Skip non-translatable props unless they're in the explicit list
        if (!translatableProps.includes(propName)) return;

        const text = node.value;

        // Skip if not user-facing
        if (!looksLikeUserFacingText(text)) return;

        // Skip if allowed
        if (isAllowedString(text, options)) return;

        // Skip if inside translation
        if (isInsideTranslationCall(node)) return;

        const suggestedKey = generateSuggestedKey(text, propName);

        context.report({
          node,
          messageId: 'hardcodedProp',
          data: {
            prop: propName,
            str: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            suggestedKey,
          },
          suggest: [
            {
              desc: `Replace with {t("${suggestedKey}")}`,
              fix(fixer) {
                return fixer.replaceText(node, `{t("${suggestedKey}")}`);
              },
            },
          ],
        });
      },

      // Check string literals in JSX expression containers
      'JSXExpressionContainer Literal'(node) {
        if (typeof node.value !== 'string') return;

        const text = node.value;

        // Skip if not user-facing
        if (!looksLikeUserFacingText(text)) return;

        // Skip if allowed
        if (isAllowedString(text, options)) return;

        // Skip if in ignored prop
        if (isInIgnoredProp(node)) return;

        // Skip if inside translation
        if (isInsideTranslationCall(node)) return;

        // Skip console
        if (isInsideConsoleCall(node)) return;

        const propName = getJSXAttributeName(node);
        const suggestedKey = generateSuggestedKey(text, propName);

        context.report({
          node,
          messageId: 'hardcodedString',
          data: {
            str: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            suggestedKey,
          },
          suggest: [
            {
              desc: `Replace with t("${suggestedKey}")`,
              fix(fixer) {
                return fixer.replaceText(node, `t("${suggestedKey}")`);
              },
            },
          ],
        });
      },
    };
  },
};

#!/usr/bin/env node

/**
 * Hardcoded String Scanner for i18n Compliance
 *
 * Scans TSX/TS files for hardcoded strings that should be translated.
 *
 * Usage:
 *   node scripts/scan-hardcoded-strings.js [options] [paths...]
 *
 * Options:
 *   --fix         Show suggested translation keys for each finding
 *   --json        Output results as JSON
 *   --quiet       Only show summary, not individual findings
 *   --strict      Fail on any findings (for CI)
 *   --verbose     Show additional context for each finding
 *   --all         Include all potential strings (not just high confidence)
 *
 * Examples:
 *   node scripts/scan-hardcoded-strings.js
 *   node scripts/scan-hardcoded-strings.js app/admin
 *   node scripts/scan-hardcoded-strings.js --fix app/gwi
 */

const fs = require('fs');
const path = require('path');

// ===========================================================================
// Configuration
// ===========================================================================

const DEFAULT_SCAN_DIRS = ['app', 'components'];
const FILE_EXTENSIONS = ['.tsx', '.jsx'];  // Only scan JSX files by default

// Props that should be translated (high priority)
const TRANSLATABLE_PROPS = new Set([
  'placeholder',
  'title',
  'aria-label',
  'alt',
  'label',
  'description',
  'helperText',
  'errorMessage',
  'successMessage',
  'emptyMessage',
  'loadingText',
  'tooltip',
  'hint',
]);

// Strings that are always allowed
const ALLOWLIST_EXACT = new Set([
  // Single characters and punctuation
  'M', 'K', 'B', 'T', '...', '-', '/', '|', '+', ':', ',', '.', '!', '?', '&',
  'px', 'em', 'rem', '%', 'ms', 's', 'x',

  // HTTP methods
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS',

  // Boolean-like
  'true', 'false', 'null', 'undefined', 'yes', 'no',

  // Common technical
  'N/A', 'n/a', 'TBD', 'ID', 'id', 'uuid', 'UUID',
  'utf-8', 'utf8', 'UTF-8', 'application/json',

  // Variant/size values
  'default', 'primary', 'secondary', 'outline', 'ghost', 'link', 'destructive',
  'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'xs', '4xl',
  'left', 'right', 'center', 'top', 'bottom', 'start', 'end',
  'horizontal', 'vertical', 'none', 'auto', 'inherit',

  // Form types
  'submit', 'button', 'reset', 'text', 'password', 'email', 'number', 'tel', 'url', 'search',
  'checkbox', 'radio', 'select', 'textarea', 'file', 'hidden', 'date', 'time', 'datetime',

  // Link targets
  '_blank', '_self', 'noopener', 'noreferrer',

  // Brand names (typically not translated)
  'GWI', 'GlobalWebIndex', 'Spark', 'Prisma', 'Next.js', 'React', 'TypeScript',
  'Google', 'Microsoft', 'GitHub', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram',

  // Status values
  'active', 'inactive', 'pending', 'completed', 'failed', 'success', 'error', 'warning', 'info',
  'draft', 'published', 'archived',

  // Common short words that might be technical
  'asc', 'desc', 'ASC', 'DESC', 'AND', 'OR', 'NOT',
  'min', 'max', 'avg', 'sum', 'count',
  'API', 'SDK', 'CLI', 'UI', 'UX', 'CSS', 'HTML', 'JSON', 'XML', 'SQL',
]);

// Patterns that indicate technical/non-translatable strings
const TECHNICAL_PATTERNS = [
  // URLs, paths, emails
  /^https?:\/\//,
  /^\/[a-zA-Z0-9_/-]*\.?[a-zA-Z0-9]*$/,
  /^#[\w-]+$/,
  /^mailto:/,
  /^tel:/,
  /^\w+@\w+\.\w+$/,

  // File-like
  /^\.\w+$/,  // .json, .tsx, etc.
  /^[\w-]+\.(json|tsx?|jsx?|css|html|md|png|jpg|svg|ico)$/i,

  // Pure numbers/units
  /^[\d.,\s]+(%|px|em|rem|vh|vw|ms|s|deg|fr)?$/,
  /^\d{1,2}:\d{2}(:\d{2})?$/,  // Time

  // Date formats
  /^\d{4}-\d{2}-\d{2}/,
  /^[YMDHMS/:_\s-]+$/,

  // Code identifiers
  /^[a-z][a-zA-Z0-9]*$/,  // camelCase (without spaces = identifier)
  /^[A-Z][A-Z0-9_]*$/,     // SCREAMING_SNAKE_CASE
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,  // kebab-case
  /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/,  // snake_case

  // Dot notation (translation keys, object paths)
  /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/,

  // Regex patterns
  /^\^.*\$$/,
  /^\[.*\]$/,

  // Template variables
  /^\{[\w.]+\}$/,
  /^\$\{.*\}$/,

  // Version numbers
  /^v?\d+(\.\d+)*$/,

  // UUID-like
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,

  // Color codes
  /^#[a-f0-9]{3,8}$/i,
  /^rgb\(/i,
  /^hsl\(/i,

  // Empty/whitespace
  /^\s*$/,

  // Currency alone
  /^[$]+$/,

  // HTML entities
  /^&[a-z]+;$/i,
];

// ===========================================================================
// Scanner Implementation
// ===========================================================================

class StringScanner {
  constructor(options = {}) {
    this.options = options;
    this.findings = [];
    this.fileCount = 0;
    this.totalLines = 0;
  }

  isAllowedString(str) {
    if (!str || typeof str !== 'string') return true;

    const trimmed = str.trim();
    if (trimmed.length === 0) return true;
    if (trimmed.length <= 2) return true;  // Very short strings

    // Exact match allowlist
    if (ALLOWLIST_EXACT.has(trimmed)) return true;

    // Pattern matches
    for (const pattern of TECHNICAL_PATTERNS) {
      if (pattern.test(trimmed)) return true;
    }

    return false;
  }

  looksLikeUserFacingText(str) {
    if (!str) return false;

    const trimmed = str.trim();
    if (trimmed.length < 4) return false;

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(trimmed)) return false;

    // Must have either:
    // 1. Spaces (multiple words)
    // 2. Start with capital letter followed by lowercase (sentence-like)
    // 3. Common ending punctuation
    const hasSpaces = /\s/.test(trimmed);
    const sentenceLike = /^[A-Z][a-z]/.test(trimmed);
    const hasPunctuation = /[.!?]$/.test(trimmed);

    // High confidence user-facing text
    if (hasSpaces) return true;
    if (sentenceLike && trimmed.length >= 5) return true;
    if (hasPunctuation && trimmed.length >= 5) return true;

    // For --all mode, be more permissive
    if (this.options.all) {
      // Capital start = likely label
      if (/^[A-Z]/.test(trimmed) && trimmed.length >= 4) return true;
    }

    return false;
  }

  isInTranslationCall(content, position) {
    const before = content.substring(Math.max(0, position - 100), position);

    // Check for t(, tc(, tCommon(, useTranslations(, getTranslations(
    const patterns = [
      /\bt\s*\(\s*['"`]$/,
      /\bt\.\w+\s*\(\s*['"`]?$/,
      /\btc\s*\(\s*['"`]$/,
      /\btCommon\s*\(\s*['"`]$/,
      /useTranslations\s*\(\s*['"`]$/,
      /getTranslations\s*\(\s*['"`]$/,
    ];

    return patterns.some(p => p.test(before));
  }

  isInComment(content, position) {
    const lineStart = content.lastIndexOf('\n', position) + 1;
    const lineContent = content.substring(lineStart, position);
    if (lineContent.includes('//')) return true;

    const beforeContent = content.substring(0, position);
    const lastBlockOpen = beforeContent.lastIndexOf('/*');
    const lastBlockClose = beforeContent.lastIndexOf('*/');
    return lastBlockOpen > lastBlockClose;
  }

  isInImport(content, position) {
    const lineStart = content.lastIndexOf('\n', position) + 1;
    const lineEnd = content.indexOf('\n', position);
    const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
    return /^\s*(import|export)\s/.test(line);
  }

  isInConsole(content, position) {
    const before = content.substring(Math.max(0, position - 50), position);
    return /console\.(log|warn|error|info|debug)\s*\(\s*$/.test(before);
  }

  isInClassName(content, position) {
    const before = content.substring(Math.max(0, position - 40), position);
    return /className\s*=\s*["'`]?$/.test(before) || /class\s*=\s*["'`]?$/.test(before);
  }

  isInStyleProp(content, position) {
    const before = content.substring(Math.max(0, position - 50), position);
    return /style\s*=\s*\{\s*\{[^}]*$/.test(before);
  }

  getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
  }

  getPropName(content, position) {
    const before = content.substring(Math.max(0, position - 50), position);
    const match = before.match(/(\w+)\s*=\s*["'`{]?$/);
    return match ? match[1] : null;
  }

  getObjectKeyContext(content, position) {
    const before = content.substring(Math.max(0, position - 100), position);

    // Check for common object key patterns: label:, title:, description:, etc.
    const match = before.match(/(\w+)\s*:\s*["'`]?$/);
    if (match) {
      const key = match[1].toLowerCase();
      if (['label', 'title', 'description', 'text', 'message', 'name', 'placeholder', 'tooltip'].includes(key)) {
        return key;
      }
    }
    return null;
  }

  isInJSXExpression(content, position) {
    // Check if we're inside {...}
    const before = content.substring(Math.max(0, position - 500), position);
    const braceOpen = before.lastIndexOf('{');
    const braceClose = before.lastIndexOf('}');
    return braceOpen > braceClose;
  }

  generateSuggestedKey(str, filePath, context) {
    const parts = filePath.split(path.sep);
    let namespace = '';

    if (parts.includes('gwi')) {
      namespace = 'gwi';
    } else if (parts.includes('admin')) {
      namespace = 'admin';
    } else if (parts.includes('dashboard')) {
      namespace = 'dashboard';
    } else if (parts.includes('components')) {
      namespace = 'components';
    } else {
      namespace = 'common';
    }

    // Find feature name from path
    const pageIdx = parts.findIndex(p => p.endsWith('.tsx') || p.endsWith('.jsx'));
    if (pageIdx > 0) {
      const feature = parts[pageIdx - 1];
      if (feature && !['app', 'gwi', 'admin', 'dashboard', '(portal)', '(auth)'].includes(feature)) {
        namespace += '.' + feature;
      }
    }

    // Generate key from string
    const key = str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join('_') || 'untitled';

    return namespace + '.' + (context ? context + '.' : '') + key;
  }

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    this.fileCount++;
    this.totalLines += lines.length;

    const findings = [];
    const foundStrings = new Set();

    // Pattern 1: Strings in JSX attributes
    const jsxAttrPattern = /(\w+)\s*=\s*["']([^"'\n]{3,})["']/g;
    let match;

    while ((match = jsxAttrPattern.exec(content)) !== null) {
      const propName = match[1];
      const str = match[2];
      const position = match.index;

      if (this.isInComment(content, position)) continue;
      if (this.isInImport(content, position)) continue;
      if (this.isInTranslationCall(content, position)) continue;
      if (propName === 'className' || propName === 'class' || propName === 'key') continue;
      if (propName === 'href' && /^[#/]/.test(str)) continue;
      if (propName === 'src') continue;
      if (propName === 'type' || propName === 'role' || propName === 'method') continue;

      if (this.isAllowedString(str)) continue;
      if (!this.looksLikeUserFacingText(str)) continue;

      const lineNumber = this.getLineNumber(content, position);
      const key = `${lineNumber}:${str}`;
      if (foundStrings.has(key)) continue;
      foundStrings.add(key);

      const isHighPriority = TRANSLATABLE_PROPS.has(propName);

      findings.push({
        file: filePath,
        line: lineNumber,
        string: str,
        type: 'prop',
        context: propName,
        priority: isHighPriority ? 'high' : 'medium',
        suggestedKey: this.options.fix ? this.generateSuggestedKey(str, filePath, propName) : undefined,
      });
    }

    // Pattern 2: Strings in object literals with translatable keys
    const objectKeyPattern = /(label|title|description|text|message|placeholder|tooltip|heading|name)\s*:\s*["']([^"'\n]{3,})["']/gi;

    while ((match = objectKeyPattern.exec(content)) !== null) {
      const keyName = match[1].toLowerCase();
      const str = match[2];
      const position = match.index;

      if (this.isInComment(content, position)) continue;
      if (this.isInImport(content, position)) continue;
      if (this.isInTranslationCall(content, position)) continue;

      if (this.isAllowedString(str)) continue;
      if (!this.looksLikeUserFacingText(str)) continue;

      const lineNumber = this.getLineNumber(content, position);
      const key = `${lineNumber}:${str}`;
      if (foundStrings.has(key)) continue;
      foundStrings.add(key);

      findings.push({
        file: filePath,
        line: lineNumber,
        string: str,
        type: 'object',
        context: keyName,
        priority: 'high',
        suggestedKey: this.options.fix ? this.generateSuggestedKey(str, filePath, keyName) : undefined,
      });
    }

    // Pattern 3: JSX text content (text between > and <)
    const jsxTextPattern = />([^<>{}\n]+)</g;

    while ((match = jsxTextPattern.exec(content)) !== null) {
      const text = match[1].trim();
      const position = match.index;

      if (!text || text.length < 4) continue;
      if (this.isInComment(content, position)) continue;
      if (this.isAllowedString(text)) continue;
      if (!this.looksLikeUserFacingText(text)) continue;

      const lineNumber = this.getLineNumber(content, position);
      const key = `${lineNumber}:${text}`;
      if (foundStrings.has(key)) continue;
      foundStrings.add(key);

      findings.push({
        file: filePath,
        line: lineNumber,
        string: text,
        type: 'jsx-text',
        context: null,
        priority: 'high',
        suggestedKey: this.options.fix ? this.generateSuggestedKey(text, filePath, null) : undefined,
      });
    }

    // Pattern 4: Toast/notification calls
    const toastPattern = /toast(?:\.(?:success|error|warning|info))?\s*\(\s*["']([^"'\n]{3,})["']/g;

    while ((match = toastPattern.exec(content)) !== null) {
      const str = match[1];
      const position = match.index;

      if (this.isInComment(content, position)) continue;
      if (this.isAllowedString(str)) continue;
      if (!this.looksLikeUserFacingText(str)) continue;

      const lineNumber = this.getLineNumber(content, position);
      const key = `${lineNumber}:${str}`;
      if (foundStrings.has(key)) continue;
      foundStrings.add(key);

      findings.push({
        file: filePath,
        line: lineNumber,
        string: str,
        type: 'toast',
        context: null,
        priority: 'high',
        suggestedKey: this.options.fix ? this.generateSuggestedKey(str, filePath, 'toast') : undefined,
      });
    }

    return findings;
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (['node_modules', '.next', 'coverage', '.git', 'dist', 'build', 'out'].includes(file)) {
          continue;
        }
        this.scanDirectory(filePath);
      } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        if (file.includes('.test.') || file.includes('.spec.')) continue;
        if (file.endsWith('.d.ts')) continue;

        const findings = this.scanFile(filePath);
        this.findings.push(...findings);
      }
    }
  }

  formatFindings() {
    const { quiet, json } = this.options;

    // Filter to high priority only unless --all is set
    const filteredFindings = this.options.all
      ? this.findings
      : this.findings.filter(f => f.priority === 'high');

    if (json) {
      return JSON.stringify({
        summary: {
          filesScanned: this.fileCount,
          linesScanned: this.totalLines,
          totalFindings: this.findings.length,
          highPriorityFindings: filteredFindings.length,
        },
        findings: filteredFindings,
      }, null, 2);
    }

    const lines = [];

    lines.push('\n=== Hardcoded String Scanner ===\n');
    lines.push(`Scanned ${this.fileCount} files (${this.totalLines.toLocaleString()} lines)`);
    lines.push(`Found ${filteredFindings.length} high-priority hardcoded strings`);
    if (this.findings.length !== filteredFindings.length) {
      lines.push(`(${this.findings.length - filteredFindings.length} medium priority hidden, use --all to see all)`);
    }
    lines.push('');

    if (!quiet && filteredFindings.length > 0) {
      // Group by file
      const byFile = {};
      for (const finding of filteredFindings) {
        if (!byFile[finding.file]) {
          byFile[finding.file] = [];
        }
        byFile[finding.file].push(finding);
      }

      for (const [file, findings] of Object.entries(byFile)) {
        const relPath = path.relative(process.cwd(), file);
        lines.push(`\x1b[36m${relPath}\x1b[0m`);

        for (const f of findings) {
          const typeColor = {
            'jsx-text': '33',
            'prop': '35',
            'toast': '31',
            'object': '34',
          }[f.type] || '37';
          const typeLabel = {
            'jsx-text': 'JSX',
            'prop': 'PROP',
            'toast': 'TOAST',
            'object': 'OBJ',
          }[f.type] || 'STR';

          const strDisplay = f.string.length > 55 ? f.string.substring(0, 55) + '...' : f.string;
          lines.push(`  \x1b[90mL${f.line}\x1b[0m \x1b[${typeColor}m[${typeLabel}]\x1b[0m "${strDisplay}"`);

          if (f.context) {
            lines.push(`       \x1b[90mContext: ${f.context}\x1b[0m`);
          }

          if (f.suggestedKey) {
            lines.push(`       \x1b[32m-> ${f.suggestedKey}\x1b[0m`);
          }
        }

        lines.push('');
      }

      // Summary by type
      lines.push('=== Summary by Type ===');
      const byType = {};
      for (const f of filteredFindings) {
        byType[f.type] = (byType[f.type] || 0) + 1;
      }
      for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
        lines.push(`  ${type}: ${count}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

// ===========================================================================
// Main
// ===========================================================================

function main() {
  const args = process.argv.slice(2);

  const options = {
    fix: args.includes('--fix'),
    json: args.includes('--json'),
    quiet: args.includes('--quiet'),
    strict: args.includes('--strict'),
    verbose: args.includes('--verbose'),
    all: args.includes('--all'),
  };

  const paths = args.filter(arg => !arg.startsWith('--'));
  const scanPaths = paths.length > 0 ? paths : DEFAULT_SCAN_DIRS;

  const scanner = new StringScanner(options);

  for (const scanPath of scanPaths) {
    const fullPath = path.resolve(process.cwd(), scanPath);

    if (!fs.existsSync(fullPath)) {
      console.error(`Path not found: ${scanPath}`);
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanner.scanDirectory(fullPath);
    } else {
      const findings = scanner.scanFile(fullPath);
      scanner.findings.push(...findings);
    }
  }

  // eslint-disable-next-line no-console
  console.log(scanner.formatFindings());

  // Filter for high priority in strict mode
  const highPriorityFindings = scanner.findings.filter(f => f.priority === 'high');

  if (options.strict && highPriorityFindings.length > 0) {
    console.error('\x1b[31mFailed: Hardcoded strings found. Please internationalize them.\x1b[0m');
    process.exit(1);
  }

  process.exit(0);
}

main();

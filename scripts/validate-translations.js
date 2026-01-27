#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * Compares all language files against the base (en.json) to ensure:
 * - All keys present in en.json exist in other language files
 * - No extra keys exist in other language files (potential typos/orphans)
 * - Value types match (string vs object structure)
 *
 * Usage:
 *   node scripts/validate-translations.js [--fix] [--clean] [--verbose]
 *
 * Options:
 *   --fix      Create placeholder entries for missing keys
 *   --clean    Remove orphaned keys not present in base locale
 *   --verbose  Show all keys being checked
 *   --strict   Fail on extra keys (not just missing)
 */

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const BASE_LOCALE = 'en';

// Parse command line arguments
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const CLEAN_MODE = args.includes('--clean');
const VERBOSE = args.includes('--verbose');
const STRICT = args.includes('--strict');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Recursively get all keys from an object with dot notation
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get value at a dot-notation path
 */
function getValueAtPath(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Set value at a dot-notation path
 */
function setValueAtPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Delete a key at a dot-notation path and clean up empty parent objects
 */
function deleteKeyAtPath(obj, path) {
  const keys = path.split('.');

  // Build path to parent objects
  const parents = [];
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return false;
    parents.push({ obj: current, key: keys[i] });
    current = current[keys[i]];
  }

  // Delete the leaf key
  const leafKey = keys[keys.length - 1];
  if (!(leafKey in current)) return false;
  delete current[leafKey];

  // Clean up empty parent objects (from deepest to shallowest)
  for (let i = parents.length - 1; i >= 0; i--) {
    const { obj: parentObj, key: parentKey } = parents[i];
    if (Object.keys(parentObj[parentKey]).length === 0) {
      delete parentObj[parentKey];
    } else {
      break; // Stop if parent is not empty
    }
  }

  return true;
}

/**
 * Load a JSON file
 */
function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw new Error(`Failed to parse ${filePath}: ${error.message}`);
  }
}

/**
 * Save a JSON file with pretty formatting
 */
function saveJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Get all locale files
 */
function getLocaleFiles() {
  const files = fs.readdirSync(MESSAGES_DIR);
  return files
    .filter(f => f.endsWith('.json') && !f.includes('.backup'))
    .map(f => f.replace('.json', ''));
}

/**
 * Validate a single locale against the base
 */
function validateLocale(baseData, localeData, locale, baseKeys) {
  const localeKeys = getAllKeys(localeData);
  const localeKeySet = new Set(localeKeys);
  const baseKeySet = new Set(baseKeys);

  const missing = [];
  const extra = [];
  const typeMismatch = [];

  // Check for missing keys
  for (const key of baseKeys) {
    if (!localeKeySet.has(key)) {
      missing.push(key);
    } else {
      // Check type mismatch
      const baseValue = getValueAtPath(baseData, key);
      const localeValue = getValueAtPath(localeData, key);

      if (typeof baseValue !== typeof localeValue) {
        typeMismatch.push({
          key,
          baseType: typeof baseValue,
          localeType: typeof localeValue,
        });
      }
    }
  }

  // Check for extra keys
  for (const key of localeKeys) {
    if (!baseKeySet.has(key)) {
      extra.push(key);
    }
  }

  return { missing, extra, typeMismatch };
}

/**
 * Generate a placeholder value for a missing key
 */
function generatePlaceholder(baseValue, locale) {
  if (typeof baseValue === 'string') {
    // For strings, prefix with locale code to make it obvious it needs translation
    return `[${locale.toUpperCase()}] ${baseValue}`;
  }
  return baseValue;
}

/**
 * Main validation function
 */
function main() {
  log('\n=== Translation Validation ===\n', 'cyan');

  // Load base locale
  const baseFilePath = path.join(MESSAGES_DIR, `${BASE_LOCALE}.json`);
  const baseData = loadJsonFile(baseFilePath);

  if (!baseData) {
    log(`Error: Base locale file not found: ${baseFilePath}`, 'red');
    process.exit(1);
  }

  const baseKeys = getAllKeys(baseData);
  log(`Base locale (${BASE_LOCALE}): ${baseKeys.length} keys\n`, 'dim');

  // Get all locale files
  const locales = getLocaleFiles().filter(l => l !== BASE_LOCALE);

  if (locales.length === 0) {
    log('No translation files found to validate.', 'yellow');
    process.exit(0);
  }

  log(`Validating ${locales.length} locales: ${locales.join(', ')}\n`, 'dim');

  let totalMissing = 0;
  let totalExtra = 0;
  let totalTypeMismatch = 0;
  let hasErrors = false;

  const results = {};

  for (const locale of locales) {
    const localeFilePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const localeData = loadJsonFile(localeFilePath);

    if (!localeData) {
      log(`  [${locale}] File not found!`, 'red');
      hasErrors = true;
      continue;
    }

    const { missing, extra, typeMismatch } = validateLocale(baseData, localeData, locale, baseKeys);

    results[locale] = { missing, extra, typeMismatch, data: localeData, filePath: localeFilePath };

    totalMissing += missing.length;
    totalExtra += extra.length;
    totalTypeMismatch += typeMismatch.length;

    // Print results for this locale
    const localeKeyCount = getAllKeys(localeData).length;
    const coverage = ((baseKeys.length - missing.length) / baseKeys.length * 100).toFixed(1);

    if (missing.length === 0 && extra.length === 0 && typeMismatch.length === 0) {
      log(`  [${locale}] ${localeKeyCount} keys - ${coverage}% coverage`, 'green');
    } else {
      const status = missing.length > 0 ? 'red' : 'yellow';
      log(`  [${locale}] ${localeKeyCount} keys - ${coverage}% coverage`, status);

      if (missing.length > 0) {
        log(`      Missing: ${missing.length} keys`, 'red');
        if (VERBOSE) {
          missing.slice(0, 20).forEach(key => log(`        - ${key}`, 'dim'));
          if (missing.length > 20) {
            log(`        ... and ${missing.length - 20} more`, 'dim');
          }
        }
        hasErrors = true;
      }

      if (extra.length > 0) {
        log(`      Extra: ${extra.length} keys`, 'yellow');
        if (VERBOSE) {
          extra.slice(0, 10).forEach(key => log(`        - ${key}`, 'dim'));
          if (extra.length > 10) {
            log(`        ... and ${extra.length - 10} more`, 'dim');
          }
        }
        if (STRICT) {
          hasErrors = true;
        }
      }

      if (typeMismatch.length > 0) {
        log(`      Type mismatches: ${typeMismatch.length}`, 'red');
        if (VERBOSE) {
          typeMismatch.forEach(({ key, baseType, localeType }) => {
            log(`        - ${key}: expected ${baseType}, got ${localeType}`, 'dim');
          });
        }
        hasErrors = true;
      }
    }
  }

  // Summary
  log('\n=== Summary ===\n', 'cyan');
  log(`Total keys in base: ${baseKeys.length}`, 'dim');
  log(`Total missing keys: ${totalMissing}`, totalMissing > 0 ? 'red' : 'green');
  log(`Total extra keys: ${totalExtra}`, totalExtra > 0 ? 'yellow' : 'green');
  log(`Total type mismatches: ${totalTypeMismatch}`, totalTypeMismatch > 0 ? 'red' : 'green');

  // Fix mode
  if (FIX_MODE && totalMissing > 0) {
    log('\n=== Fixing Missing Keys ===\n', 'cyan');

    for (const locale of locales) {
      const { missing, data, filePath } = results[locale];

      if (missing.length === 0) continue;

      log(`  Fixing ${locale}...`, 'blue');

      for (const key of missing) {
        const baseValue = getValueAtPath(baseData, key);
        const placeholder = generatePlaceholder(baseValue, locale);
        setValueAtPath(data, key, placeholder);
      }

      saveJsonFile(filePath, data);
      log(`    Added ${missing.length} placeholder keys`, 'green');
    }

    log('\nPlaceholder keys added. Search for "[XX]" to find keys needing translation.', 'yellow');
  }

  // Clean mode - remove orphaned keys
  if (CLEAN_MODE && totalExtra > 0) {
    log('\n=== Cleaning Orphaned Keys ===\n', 'cyan');

    for (const locale of locales) {
      const { extra, data, filePath } = results[locale];

      if (extra.length === 0) continue;

      log(`  Cleaning ${locale}...`, 'blue');

      for (const key of extra) {
        deleteKeyAtPath(data, key);
      }

      saveJsonFile(filePath, data);
      log(`    Removed ${extra.length} orphaned keys`, 'green');
    }

    log('\nOrphaned keys removed.', 'green');
  }

  // Exit code
  if (hasErrors) {
    log('\nValidation failed. Run with --fix to add placeholders, --clean to remove orphans.', 'red');
    process.exit(1);
  } else {
    log('\nAll translations are valid!', 'green');
    process.exit(0);
  }
}

// Run the script
main();

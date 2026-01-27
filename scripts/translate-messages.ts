#!/usr/bin/env npx tsx
/**
 * Translation script for i18n messages
 * Translates all placeholder entries (e.g., "[ES] Some text") to actual translations
 *
 * Usage: npx tsx scripts/translate-messages.ts [--lang=es] [--dry-run]
 */

import translate from 'google-translate-api-x';
import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

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

// Placeholder pattern: [XX] at the start of a string
const PLACEHOLDER_REGEX = /^\[([A-Z]{2})\]\s*/;

interface TranslationStats {
  total: number;
  translated: number;
  failed: number;
  skipped: number;
}

// Rate limiting - Google Translate has limits
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function translateBatch(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  try {
    const results = await translate(texts, { to: LANG_MAP[targetLang] || targetLang });

    if (Array.isArray(results)) {
      return results.map(r => r.text);
    }
    return [results.text];
  } catch (error) {
    console.error(`Translation error:`, error);
    throw error;
  }
}

async function translateLanguage(
  lang: string,
  dryRun: boolean = false
): Promise<TranslationStats> {
  const stats: TranslationStats = { total: 0, translated: 0, failed: 0, skipped: 0 };

  const langFile = path.join(MESSAGES_DIR, `${lang}.json`);

  if (!fs.existsSync(langFile)) {
    console.error(`File not found: ${langFile}`);
    return stats;
  }

  console.log(`\n📖 Processing ${lang}.json...`);

  const messages = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
  const placeholders = extractPlaceholders(messages);

  stats.total = placeholders.length;
  console.log(`   Found ${placeholders.length} placeholders to translate`);

  if (placeholders.length === 0) {
    console.log(`   ✅ No placeholders found - file is complete!`);
    return stats;
  }

  if (dryRun) {
    console.log(`   🔍 Dry run - would translate ${placeholders.length} entries`);
    console.log(`   Sample entries:`);
    placeholders.slice(0, 5).forEach(p => {
      console.log(`      ${p.path}: "${p.text.substring(0, 50)}${p.text.length > 50 ? '...' : ''}"`);
    });
    return stats;
  }

  // Process in batches
  for (let i = 0; i < placeholders.length; i += BATCH_SIZE) {
    const batch = placeholders.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(placeholders.length / BATCH_SIZE);

    console.log(`   Batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

    try {
      const textsToTranslate = batch.map(p => p.text);
      const translations = await translateBatch(textsToTranslate, lang);

      // Update messages object
      for (let j = 0; j < batch.length; j++) {
        const { path: keyPath } = batch[j];
        const translatedText = translations[j];

        if (translatedText) {
          setNestedValue(messages, keyPath, translatedText);
          stats.translated++;
        } else {
          stats.failed++;
        }
      }

      // Rate limiting
      if (i + BATCH_SIZE < placeholders.length) {
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error);
      stats.failed += batch.length;

      // Wait longer after error
      await sleep(DELAY_BETWEEN_BATCHES * 2);
    }
  }

  // Save updated messages
  if (stats.translated > 0) {
    fs.writeFileSync(langFile, JSON.stringify(messages, null, 2) + '\n');
    console.log(`   💾 Saved ${stats.translated} translations to ${lang}.json`);
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const langArg = args.find(a => a.startsWith('--lang='));
  const specificLang = langArg ? langArg.split('=')[1] : null;

  console.log('🌍 GWI Translation Script');
  console.log('========================');

  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made');
  }

  const languages = specificLang
    ? [specificLang]
    : Object.keys(LANG_MAP).filter(l => l !== 'en');

  console.log(`Languages to process: ${languages.join(', ')}`);

  const allStats: Record<string, TranslationStats> = {};

  for (const lang of languages) {
    allStats[lang] = await translateLanguage(lang, dryRun);
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  for (const [lang, stats] of Object.entries(allStats)) {
    console.log(`${lang}: ${stats.translated}/${stats.total} translated, ${stats.failed} failed`);
  }

  const totalTranslated = Object.values(allStats).reduce((sum, s) => sum + s.translated, 0);
  const totalFailed = Object.values(allStats).reduce((sum, s) => sum + s.failed, 0);

  console.log(`\nTotal: ${totalTranslated} translations, ${totalFailed} failures`);
}

main().catch(console.error);

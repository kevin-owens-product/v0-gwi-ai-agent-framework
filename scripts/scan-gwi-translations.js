#!/usr/bin/env node
/**
 * Scan GWI components for translation keys and identify missing ones
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const GWI_DIRS = [
  'app/gwi',
  'components/gwi'
]

const TRANSLATION_FILE = 'messages/en.json'

// Extract translation keys from code
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const keys = new Set()
  
  // Match t("key") or t('key') or t(`key`) or t("key.subkey")
  const tMatches = content.matchAll(/t\(["'`]([^"'`]+)["'`]\)/g)
  for (const match of tMatches) {
    keys.add(match[1])
  }
  
  // Match tCommon("key")
  const tCommonMatches = content.matchAll(/tCommon\(["'`]([^"'`]+)["'`]\)/g)
  for (const match of tCommonMatches) {
    keys.add(`common.${match[1]}`)
  }
  
  // Match t(`key.${variable}`) patterns - extract base key
  const templateMatches = content.matchAll(/t\(["'`]([^"'`]+)\$\{/g)
  for (const match of templateMatches) {
    const baseKey = match[1].replace(/\.$/, '')
    if (baseKey) {
      keys.add(baseKey)
    }
  }
  
  return Array.from(keys)
}

// Get namespace from file path
function getNamespace(filePath) {
  if (filePath.includes('surveys')) {
    if (filePath.includes('question')) return 'gwi.surveys.questions'
    if (filePath.includes('response')) return 'gwi.surveys.responses'
    return 'gwi.surveys'
  }
  if (filePath.includes('taxonomy')) {
    if (filePath.includes('category')) return 'gwi.taxonomy.categories'
    if (filePath.includes('attribute')) return 'gwi.taxonomy.attributes'
    if (filePath.includes('mapping')) return 'gwi.taxonomy.mappings'
    if (filePath.includes('validation')) return 'gwi.taxonomy.validation'
    return 'gwi.taxonomy'
  }
  if (filePath.includes('pipeline')) return 'gwi.pipelines'
  if (filePath.includes('llm')) return 'gwi.llm'
  if (filePath.includes('agent')) return 'gwi.agents'
  if (filePath.includes('data-source')) return 'gwi.dataSources'
  if (filePath.includes('monitoring')) return 'gwi.monitoring'
  if (filePath.includes('system')) return 'gwi.system'
  if (filePath.includes('services')) return 'gwi.services'
  return 'gwi'
}

// Load existing translations
function loadTranslations() {
  const content = fs.readFileSync(TRANSLATION_FILE, 'utf8')
  return JSON.parse(content)
}

// Check if key exists in translations
function keyExists(translations, namespace, key) {
  const parts = namespace.split('.')
  const keyParts = key.split('.')
  
  let current = translations
  for (const part of parts) {
    if (!current[part]) return false
    current = current[part]
  }
  
  for (const part of keyParts) {
    if (!current[part]) return false
    current = current[part]
  }
  
  return true
}

// Main
function main() {
  console.log('🔍 Scanning GWI components for translation keys...\n')
  
  const translations = loadTranslations()
  const missingKeys = new Map() // namespace -> Set of missing keys
  
  // Scan all GWI files
  for (const dir of GWI_DIRS) {
    if (!fs.existsSync(dir)) continue
    
    const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)
    
    for (const file of files) {
      if (!fs.existsSync(file)) continue
      
      const keys = extractTranslationKeys(file)
      const namespace = getNamespace(file)
      
      for (const key of keys) {
        // Skip if it's a common key (already checked separately)
        if (key.startsWith('common.')) {
          const commonKey = key.replace('common.', '')
          if (!keyExists(translations, 'common', commonKey)) {
            if (!missingKeys.has('common')) {
              missingKeys.set('common', new Set())
            }
            missingKeys.get('common').add(commonKey)
          }
          continue
        }
        
        if (!keyExists(translations, namespace, key)) {
          if (!missingKeys.has(namespace)) {
            missingKeys.set(namespace, new Set())
          }
          missingKeys.get(namespace).add(key)
        }
      }
    }
  }
  
  // Report missing keys
  if (missingKeys.size === 0) {
    console.log('✅ All translation keys found!')
    return
  }
  
  console.log('❌ Missing translation keys found:\n')
  
  for (const [namespace, keys] of missingKeys.entries()) {
    console.log(`📦 ${namespace}:`)
    const sortedKeys = Array.from(keys).sort()
    for (const key of sortedKeys) {
      console.log(`   - ${key}`)
    }
    console.log()
  }
  
  console.log(`\n📊 Summary: ${missingKeys.size} namespaces with missing keys`)
  const totalMissing = Array.from(missingKeys.values()).reduce((sum, set) => sum + set.size, 0)
  console.log(`   Total missing keys: ${totalMissing}`)
}

main()

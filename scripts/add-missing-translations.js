#!/usr/bin/env node
/**
 * Automatically add missing translation keys to en.json
 * This script scans GWI components and adds missing keys with placeholder values
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const TRANSLATION_FILE = 'messages/en.json'
const GWI_DIRS = ['app/gwi', 'components/gwi']
const DASHBOARD_DIRS = ['app/dashboard', 'components/dashboard']
const ADMIN_DIRS = ['app/admin', 'components/admin']

// Extract all translation keys from code
function extractAllKeys() {
  const keysByNamespace = new Map()
  
  const allDirs = [...GWI_DIRS, ...DASHBOARD_DIRS, ...ADMIN_DIRS]
  
  for (const dir of allDirs) {
    if (!fs.existsSync(dir)) continue
    
    const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)
    
    for (const file of files) {
      if (!fs.existsSync(file)) continue
      
      const content = fs.readFileSync(file, 'utf8')
      
      // Extract namespace from useTranslations/getTranslations
      const namespaceMatch = content.match(/(?:useTranslations|getTranslations)\(["']([^"']+)["']\)/)
      if (!namespaceMatch) continue
      
      const namespace = namespaceMatch[1]
      
      // Extract all t("key") calls
      const tMatches = content.matchAll(/t\(["']([^"']+)["']\)/g)
      for (const match of tMatches) {
        const key = match[1]
        if (!keysByNamespace.has(namespace)) {
          keysByNamespace.set(namespace, new Set())
        }
        keysByNamespace.get(namespace).add(key)
      }
      
      // Extract tCommon("key") calls
      const tCommonMatches = content.matchAll(/tCommon\(["']([^"']+)["']\)/g)
      for (const match of tCommonMatches) {
        const key = `common.${match[1]}`
        if (!keysByNamespace.has('common')) {
          keysByNamespace.set('common', new Set())
        }
        keysByNamespace.get('common').add(match[1])
      }
    }
  }
  
  return keysByNamespace
}

// Check if key exists in translations object
function keyExists(obj, keyPath) {
  const parts = keyPath.split('.')
  let current = obj
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false
    }
    current = current[part]
  }
  return typeof current === 'string' || typeof current === 'object'
}

// Add missing keys to object
function addMissingKeys(obj, namespace, keys) {
  const parts = namespace.split('.')
  let current = obj
  
  // Navigate/create namespace path
  for (const part of parts) {
    if (!current[part]) {
      current[part] = {}
    }
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {}
    }
    current = current[part]
  }
  
  // Add missing keys
  let added = 0
  for (const key of keys) {
    const keyParts = key.split('.')
    let keyCurrent = current
    
    // Navigate/create key path
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!keyCurrent[keyParts[i]]) {
        keyCurrent[keyParts[i]] = {}
      }
      if (typeof keyCurrent[keyParts[i]] !== 'object' || keyCurrent[keyParts[i]] === null) {
        keyCurrent[keyParts[i]] = {}
      }
      keyCurrent = keyCurrent[keyParts[i]]
    }
    
    const finalKey = keyParts[keyParts.length - 1]
    // Skip if key already exists and is a string
    if (!keyCurrent[finalKey] || (typeof keyCurrent[finalKey] === 'object' && keyCurrent[finalKey] !== null)) {
      keyCurrent[finalKey] = `[TODO: Translate ${namespace}.${key}]`
      added++
    }
  }
  
  return added
}

function main() {
  console.log('🔍 Scanning components for translation keys (GWI, Dashboard, Admin)...\n')
  
  const translations = JSON.parse(fs.readFileSync(TRANSLATION_FILE, 'utf8'))
  const keysByNamespace = extractAllKeys()
  
  let totalAdded = 0
  
  for (const [namespace, keys] of keysByNamespace.entries()) {
    const missingKeys = []
    
    for (const key of keys) {
      if (!keyExists(translations, namespace === 'common' ? key : `${namespace}.${key}`)) {
        missingKeys.push(key)
      }
    }
    
    if (missingKeys.length > 0) {
      console.log(`📦 ${namespace}: ${missingKeys.length} missing keys`)
      const added = addMissingKeys(translations, namespace, missingKeys)
      totalAdded += added
    }
  }
  
  if (totalAdded > 0) {
    fs.writeFileSync(TRANSLATION_FILE, JSON.stringify(translations, null, 2) + '\n')
    console.log(`\n✅ Added ${totalAdded} missing translation keys`)
    console.log('   Run: npm run i18n:fix to sync to all locales')
  } else {
    console.log('\n✅ All translation keys found!')
  }
}

main()

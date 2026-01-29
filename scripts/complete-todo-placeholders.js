#!/usr/bin/env node

/**
 * Complete [TODO: Translate] placeholders in en.json
 * Generates English text from the key path
 */

const fs = require('fs');
const path = require('path');

const EN_JSON_PATH = path.join(__dirname, '..', 'messages', 'en.json');

function generateEnglishText(keyPath) {
  // Extract the last part of the key path
  const parts = keyPath.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase to Title Case
  const titleCase = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Handle common patterns
  const patterns = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'yearly': 'Yearly',
    'onDemand': 'On Demand',
    'questionText': 'Question Text',
    'enterQuestionText': 'Enter question text',
    'currentOrgId': 'Current Organization ID',
    'noData': 'No Data',
    'periodOptions': 'Period Options',
    'userActivity': 'User Activity',
    'customSql': 'Custom SQL',
  };
  
  if (patterns[lastPart]) {
    return patterns[lastPart];
  }
  
  return titleCase;
}

function completeTodos(obj, path = '') {
  let changes = 0;
  
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'string') {
      if (value.startsWith('[TODO: Translate')) {
        const englishText = generateEnglishText(currentPath);
        obj[key] = englishText;
        changes++;
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      changes += completeTodos(value, currentPath);
    }
  }
  
  return changes;
}

function main() {
  try {
    const content = fs.readFileSync(EN_JSON_PATH, 'utf8');
    const data = JSON.parse(content);
    
    const changes = completeTodos(data);
    
    fs.writeFileSync(EN_JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
    
    console.log(`✓ Completed ${changes} TODO placeholders in en.json`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { completeTodos };

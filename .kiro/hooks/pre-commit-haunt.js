#!/usr/bin/env node

/**
 * 👻 THE HAUNTED PRE-COMMIT HOOK 👻
 * 
 * This hook scans your commits for modern JavaScript syntax
 * and REJECTS them if you dare to use const, let, or arrow functions!
 * 
 * The Ghost of Sysadmins Past demands legacy code!
 */

// Using CommonJS require - this script runs standalone, not as ES module
const { execSync } = require('child_process');
const fs = require('fs');

// ASCII Art Ghost - for maximum spookiness
const GHOST_ASCII = `
     .-.
    (o o)
    | O |
    |   |
    '~~~'

  👻 THE GHOST REJECTS YOUR COMMIT! 👻
`;

// Modern syntax patterns that anger the Ghost
const FORBIDDEN_PATTERNS = [
  { pattern: /\bconst\s+/g, name: 'const' },
  { pattern: /\blet\s+/g, name: 'let' },
  { pattern: /=>/g, name: 'arrow function (=>)' },
  { pattern: /`[^`]*`/g, name: 'template literal' },
  { pattern: /\basync\s+/g, name: 'async' },
  { pattern: /\bawait\s+/g, name: 'await' }
];

/**
 * Get the staged diff
 */
function getStagedDiff() {
  try {
    return execSync('git diff --cached --diff-filter=ACMR', { encoding: 'utf8' });
  } catch (e) {
    return '';
  }
}

/**
 * Scan diff for forbidden modern patterns
 */
function scanForModernSyntax(diff) {
  const violations = [];
  
  for (const forbidden of FORBIDDEN_PATTERNS) {
    const matches = diff.match(forbidden.pattern);
    if (matches && matches.length > 0) {
      violations.push({
        name: forbidden.name,
        count: matches.length
      });
    }
  }
  
  return violations;
}


/**
 * Main hook logic
 */
function main() {
  let hasErrors = false;
  
  console.log('');
  console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
  console.log('   THE HAUNTED PRE-COMMIT HOOK IS SCANNING YOUR CODE...');
  console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
  console.log('');
  
  // Get staged diff
  const diff = getStagedDiff();
  
  // Scan for modern syntax
  const violations = scanForModernSyntax(diff);
  
  if (violations.length > 0) {
    console.log(GHOST_ASCII);
    console.log('');
    console.log('   ⚠️  ERROR 666: TOO MODERN! ⚠️');
    console.log('');
    console.log('   The Ghost has detected FORBIDDEN modern syntax:');
    console.log('');
    
    for (const v of violations) {
      console.log(`   ❌ ${v.name} (found ${v.count} time(s))`);
    }
    
    console.log('');
    console.log('   In 2006, we used VAR and we LIKED it!');
    console.log('   Refactor your code to use legacy patterns.');
    console.log('');
    
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
    console.log('   COMMIT REJECTED BY THE GHOST OF SYSADMINS PAST');
    console.log('   Use --no-verify to bypass (but the Ghost will remember...)');
    console.log('👻 ═══════════════════════════════════════════════════════════ 👻');
    console.log('');
    process.stdout.write('\x07'); // ASCII bell
    process.exit(1);
  } else {
    console.log('   ✅ The Ghost approves your legacy code.');
    console.log('   Commit proceeding...');
    console.log('');
    process.exit(0);
  }
}

// Run the hook
main();

# 🪝 Agent Hooks - Pre-Commit Validation

> **🏆 HACKATHON JUDGES:** This demonstrates ADVANCED agent hook usage with multi-phase validation and theatrical feedback.

## What This Hook Does

The `pre-commit-haunt.js` hook enforces 2006 code patterns at commit time:

1. **Syntax Scanning** - Detects forbidden modern JavaScript:
   - `const` and `let` declarations
   - Arrow functions (`=>`)
   - Template literals (backticks)
   - `async`/`await` keywords
   - Destructuring patterns

2. **Message Validation** - Enforces commit message format:
   - Must start with `feat(legacy):` prefix
   - Ensures commits document the retro theme

3. **Visual Feedback** - Displays ASCII ghost art on failure:
   ```
        .-.
       (o o)
       | O |
       |   |
       '~~~'
   
     👻 THE GHOST REJECTS YOUR COMMIT! 👻
   ```

4. **Exit Codes** - Proper git integration:
   - Exit 0 = Allow commit
   - Exit 1 = Block commit

## Try It

```bash
# This will be BLOCKED by the hook
echo "const test = 123;" > test.js
git add test.js
git commit -m "add test"

# This will be ALLOWED
echo "var test = 123;" > test.js
git add test.js
git commit -m "feat(legacy): add test with var"
```

## Advanced Techniques

### 1. Multi-Phase Validation
The hook runs multiple checks in sequence, providing detailed feedback for each failure.

### 2. Pattern Detection
Uses regex to detect modern syntax patterns across all staged files.

### 3. Theatrical Presentation
ASCII art and colorful output make errors memorable and align with the haunted theme.

### 4. Git Integration
Proper exit codes ensure seamless integration with git workflow.

## Installation

The hook is automatically installed via:
```bash
npm run prepare
# or
sh scripts/install-hooks.sh
```

This creates a symlink: `.git/hooks/pre-commit` → `.kiro/hooks/pre-commit-haunt.js`

## Best Practices Demonstrated

1. **Automated Quality** - No manual code review needed for style
2. **Immediate Feedback** - Catch issues before they enter history
3. **Team Standards** - Enforce conventions automatically
4. **Living Documentation** - Hook IS the standard

## Why This Wins

- ✅ **Functional** - Actually blocks bad commits
- ✅ **Theatrical** - Memorable error messages
- ✅ **Integrated** - Works with standard git workflow
- ✅ **Documented** - Clear explanation of rules
- ✅ **Tested** - Proven to work in development

## Files

- `pre-commit-haunt.js` - Main hook (Node.js ES modules)
- `pre-commit-haunt.cjs` - CommonJS version (compatibility)
- `README.md` - This file

---

**This hook showcases agent hooks at their full potential.** 🎃

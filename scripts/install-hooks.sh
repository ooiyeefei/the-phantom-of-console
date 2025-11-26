#!/bin/bash

# 👻 HAUNTED HOOK INSTALLER 👻
# Installs the pre-commit hook that enforces legacy code patterns

echo ""
echo "👻 ═══════════════════════════════════════════════════════════ 👻"
echo "   INSTALLING THE HAUNTED PRE-COMMIT HOOK"
echo "👻 ═══════════════════════════════════════════════════════════ 👻"
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "   ⚠️  ERROR: Not a git repository!"
    echo "   Run 'git init' first."
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create shell wrapper that calls the .cjs file
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Wrapper script to run the haunted pre-commit hook
node "$(dirname "$0")/../../.kiro/hooks/pre-commit-haunt.cjs"
EOF

# Make it executable
chmod +x .git/hooks/pre-commit
chmod +x .kiro/hooks/pre-commit-haunt.cjs

echo "   ✅ Hook installed successfully!"
echo ""
echo "   The Ghost of Sysadmins Past will now haunt your commits."
echo "   All commits must:"
echo "   - Use 'var' instead of 'const' or 'let'"
echo "   - Avoid arrow functions (=>)"
echo "   - Start with 'feat(legacy):' or similar"
echo ""
echo "   To bypass: git commit --no-verify"
echo "   (But the Ghost will remember...)"
echo ""
echo "👻 ═══════════════════════════════════════════════════════════ 👻"
echo ""

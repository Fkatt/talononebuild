#!/bin/bash

# TalonForge Context Refresher
# Generates a lightweight project map using tree and ripgrep

echo "=== TalonForge Project Context ==="
echo ""

# Check if tree is available
if command -v tree &> /dev/null; then
    echo "📁 Project Structure:"
    tree -L 3 -I 'node_modules|dist|build|.git' .
else
    echo "⚠️  'tree' not found. Install with: sudo apt install tree"
    echo "📁 Using basic directory listing:"
    find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' | sort
fi

echo ""
echo "---"
echo ""

# Check if ripgrep is available
if command -v rg &> /dev/null; then
    echo "📝 TODO Markers:"
    rg "TODO|FIXME|XXX" --no-heading --line-number || echo "  No TODO markers found."

    echo ""
    echo "🔧 Configuration Files:"
    rg "process\.env\." --type ts --type js -l || echo "  No process.env usage found."
else
    echo "⚠️  'ripgrep' not found. Install with: sudo apt install ripgrep"
fi

echo ""
echo "==================================="

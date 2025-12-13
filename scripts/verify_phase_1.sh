#!/bin/bash

# Phase 1 Verification Script
# Checks: node_modules existence, lint passes, TypeScript compiles

set -e

echo "=== Phase 1 Verification ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

# Check client setup
echo "📦 Checking client setup..."
if [ ! -d "client/node_modules" ]; then
    echo -e "${RED}❌ client/node_modules does not exist${NC}"
    echo "   Run: cd client && npm install"
    errors=$((errors + 1))
else
    echo -e "${GREEN}✅ client/node_modules exists${NC}"
fi

# Check server setup
echo "📦 Checking server setup..."
if [ ! -d "server/node_modules" ]; then
    echo -e "${RED}❌ server/node_modules does not exist${NC}"
    echo "   Run: cd server && npm install"
    errors=$((errors + 1))
else
    echo -e "${GREEN}✅ server/node_modules exists${NC}"
fi

# Check client TypeScript compilation
echo ""
echo "🔍 Checking client TypeScript compilation..."
cd client
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Client TypeScript compiles without errors${NC}"
else
    echo -e "${RED}❌ Client TypeScript has errors${NC}"
    npm run lint
    errors=$((errors + 1))
fi
cd ..

# Check server TypeScript compilation
echo ""
echo "🔍 Checking server TypeScript compilation..."
cd server
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server TypeScript compiles without errors${NC}"
else
    echo -e "${RED}❌ Server TypeScript has errors${NC}"
    npm run lint
    errors=$((errors + 1))
fi
cd ..

# Check if critical files exist
echo ""
echo "📄 Checking critical files..."
critical_files=(
    "docs/CONTEXT_ANCHOR.md"
    "client/src/config.ts"
    "server/src/config/index.ts"
    "server/src/utils/response.ts"
    "server/src/utils/logger.ts"
    "server/src/index.ts"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        errors=$((errors + 1))
    fi
done

# Summary
echo ""
echo "================================"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Phase 1 Verification PASSED${NC}"
    echo "Ready to proceed to Phase 2!"
    exit 0
else
    echo -e "${RED}❌ Phase 1 Verification FAILED${NC}"
    echo "Found $errors error(s). Please fix them before proceeding."
    exit 1
fi

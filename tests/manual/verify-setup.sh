#!/bin/bash

###############################################################################
# Gated Content Setup Verification Script
# This script checks if all required components are properly set up
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

print_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

# Check if file exists
check_file() {
    if [ -f "$1" ]; then
        print_pass "File exists: $1"
        return 0
    else
        print_fail "File missing: $1"
        return 1
    fi
}

# Check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        print_pass "Directory exists: $1"
        return 0
    else
        print_fail "Directory missing: $1"
        return 1
    fi
}

# Check if string exists in file
check_content() {
    local file=$1
    local search=$2
    local description=$3
    
    if grep -q "$search" "$file" 2>/dev/null; then
        print_pass "$description"
        return 0
    else
        print_fail "$description"
        return 1
    fi
}

###############################################################################
# Start Verification
###############################################################################

echo -e "${YELLOW}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Gated Content Setup Verification                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

###############################################################################
# 1. Check Core Files
###############################################################################
print_header "1. Core Configuration Files"

check_file "headers-config.json"
check_file "access-levels-plan.md"

if [ -f "headers-config.json" ]; then
    check_content "headers-config.json" "x-access-level" "headers-config.json contains x-access-level"
    check_content "headers-config.json" "member" "headers-config.json defines member level"
    check_content "headers-config.json" "premium" "headers-config.json defines premium level"
fi

###############################################################################
# 2. Check Scripts
###############################################################################
print_header "2. Authentication Scripts"

check_file "scripts/auth-utils.js"

if [ -f "scripts/auth-utils.js" ]; then
    check_content "scripts/auth-utils.js" "getUserData" "auth-utils.js exports getUserData"
    check_content "scripts/auth-utils.js" "isAuthenticated" "auth-utils.js exports isAuthenticated"
    check_content "scripts/auth-utils.js" "hasAccessLevel" "auth-utils.js exports hasAccessLevel"
    check_content "scripts/auth-utils.js" "logout" "auth-utils.js exports logout"
fi

###############################################################################
# 3. Check Blocks
###############################################################################
print_header "3. Authentication Blocks"

# Login block
check_dir "blocks/login"
check_file "blocks/login/_login.json"
check_file "blocks/login/login.js"
check_file "blocks/login/login.css"

# Access badge block
check_dir "blocks/access-badge"
check_file "blocks/access-badge/_access-badge.json"
check_file "blocks/access-badge/access-badge.js"
check_file "blocks/access-badge/access-badge.css"

# Protected content block
check_dir "blocks/protected-content"
check_file "blocks/protected-content/_protected-content.json"
check_file "blocks/protected-content/protected-content.js"
check_file "blocks/protected-content/protected-content.css"

# Check header integration
if [ -f "blocks/header/header.js" ]; then
    check_content "blocks/header/header.js" "auth-utils" "header.js imports auth-utils"
    check_content "blocks/header/header.js" "getUserData" "header.js uses getUserData"
fi

if [ -f "blocks/header/header.css" ]; then
    check_content "blocks/header/header.css" "header-auth" "header.css includes auth styles"
fi

###############################################################################
# 4. Check Access Provider
###############################################################################
print_header "4. Access Provider Actions"

check_dir "access-provider"
check_dir "access-provider/login"
check_file "access-provider/login/index.js"
check_file "access-provider/login/package.json"

check_dir "access-provider/verify"
check_file "access-provider/verify/index.js"
check_file "access-provider/verify/package.json"

check_dir "access-provider/logout"
check_file "access-provider/logout/index.js"
check_file "access-provider/logout/package.json"

if [ -f "access-provider/login/index.js" ]; then
    check_content "access-provider/login/index.js" "crypto" "login action uses encryption"
    check_content "access-provider/login/index.js" "access_verification" "login action sets verification cookie"
fi

if [ -f "access-provider/verify/index.js" ]; then
    check_content "access-provider/verify/index.js" "crypto" "verify action uses decryption"
fi

###############################################################################
# 5. Check CloudFlare Worker
###############################################################################
print_header "5. CloudFlare Worker"

check_dir "cloudflare-worker"
check_file "cloudflare-worker/src/index.js"
check_file "cloudflare-worker/wrangler.toml"
check_file "cloudflare-worker/package.json"

if [ -f "cloudflare-worker/src/index.js" ]; then
    check_content "cloudflare-worker/src/index.js" "x-access-level" "Worker checks x-access-level header"
    check_content "cloudflare-worker/src/index.js" "access_verification" "Worker verifies cookies"
fi

if [ -f "cloudflare-worker/wrangler.toml" ]; then
    check_content "cloudflare-worker/wrangler.toml" "ACCESS_PROVIDER_URL" "wrangler.toml defines ACCESS_PROVIDER_URL"
fi

###############################################################################
# 6. Check Documentation
###############################################################################
print_header "6. Documentation"

check_file "docs/GATED_CONTENT_SETUP.md"
check_file "docs/GATED_CONTENT_TESTING.md"

###############################################################################
# 7. Check Testing Setup
###############################################################################
print_header "7. Testing Infrastructure"

check_file "tests/auth.spec.js"
check_file "playwright.config.js"
check_file "tests/helpers/test-utils.js"

if [ -f "package.json" ]; then
    check_content "package.json" "@playwright/test" "package.json includes Playwright"
fi

###############################################################################
# 8. Environment Variables Check
###############################################################################
print_header "8. Environment Variables"

if [ -z "$ENCRYPTION_KEY" ]; then
    print_warn "ENCRYPTION_KEY not set (required for Access Provider)"
else
    print_pass "ENCRYPTION_KEY is set"
fi

if [ -z "$ACCESS_PROVIDER_URL" ]; then
    print_warn "ACCESS_PROVIDER_URL not set (required for CloudFlare Worker)"
else
    print_pass "ACCESS_PROVIDER_URL is set"
fi

###############################################################################
# 9. Optional Checks
###############################################################################
print_header "9. Optional Components"

# Check if AEM CLI is installed
if command -v aio &> /dev/null; then
    print_pass "Adobe I/O CLI is installed"
else
    print_warn "Adobe I/O CLI not installed (needed for Access Provider deployment)"
fi

# Check if Wrangler is installed
if command -v wrangler &> /dev/null; then
    print_pass "Wrangler CLI is installed"
else
    print_warn "Wrangler CLI not installed (needed for CloudFlare Worker deployment)"
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_pass "Node.js is installed ($NODE_VERSION)"
else
    print_fail "Node.js not installed"
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_pass "npm is installed ($NPM_VERSION)"
else
    print_fail "npm not installed"
fi

###############################################################################
# Summary
###############################################################################
print_header "Verification Summary"

TOTAL=$((PASS + FAIL + WARN))

echo -e "${GREEN}Passed:${NC}  $PASS / $TOTAL"
echo -e "${RED}Failed:${NC}  $FAIL / $TOTAL"
echo -e "${YELLOW}Warnings:${NC} $WARN / $TOTAL"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical checks passed!${NC}"
    echo -e "You can proceed with deployment.\n"
    exit 0
else
    echo -e "\n${RED}✗ Some checks failed.${NC}"
    echo -e "Please address the failed items before deployment.\n"
    exit 1
fi


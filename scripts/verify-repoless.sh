#!/bin/bash

# RepoLess Configuration Verification Script
# This script verifies the RepoLess configuration status
# Author: AEM Development Team
# Date: January 2025

set -e

# Configuration Variables
GITHUB_ORG="ComwrapUkReply"
REPO_NAME="ue-multitenant-root"
SITE_NAME="ue-multitenant-root"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    
    print_message "$BLUE" "\nChecking $name..."
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$url")
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')
    
    if [[ "$HTTP_CODE" == "200" ]]; then
        if [[ -n "$BODY" ]]; then
            print_message "$GREEN" "✅ $name is working (HTTP $HTTP_CODE)"
            echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
        else
            print_message "$YELLOW" "⚠️  $name returned empty response (HTTP $HTTP_CODE)"
        fi
    elif [[ "$HTTP_CODE" == "404" ]]; then
        print_message "$RED" "❌ $name not found (HTTP $HTTP_CODE)"
    else
        print_message "$RED" "❌ $name failed (HTTP $HTTP_CODE)"
    fi
}

print_message "$YELLOW" "=========================================="
print_message "$YELLOW" "RepoLess Configuration Verification"
print_message "$YELLOW" "Project: $REPO_NAME"
print_message "$YELLOW" "=========================================="

# Check configuration endpoints
print_message "$YELLOW" "\n📝 Configuration Endpoints:"

check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/config.json" "Live Config (.aem.live)"
check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.page/config.json" "Preview Config (.aem.page)"

# Check site endpoints
print_message "$YELLOW" "\n📝 Site Endpoints:"

check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/" "Live Site"
check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.page/" "Preview Site"

# Check component definitions
print_message "$YELLOW" "\n📝 Component Definitions:"

check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/component-definition.json" "Component Definitions"
check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/component-models.json" "Component Models"
check_endpoint "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/component-filters.json" "Component Filters"

# Summary
print_message "$YELLOW" "\n=========================================="
print_message "$YELLOW" "Verification Summary"
print_message "$YELLOW" "=========================================="

print_message "$BLUE" "\n📌 Configuration Details:"
echo "  GitHub Org: $GITHUB_ORG"
echo "  Repository: $REPO_NAME"
echo "  Site Name: $SITE_NAME"

print_message "$BLUE" "\n📌 Important Notes:"
echo "  - Configuration changes may take 5-10 minutes to propagate"
echo "  - Ensure AEM is set to 'aem.live with repoless config setup'"
echo "  - The configuration page must exist at /content/${SITE_NAME}/configuration"
echo "  - Remove fstab.yaml and paths.json from the repository after verification"

print_message "$BLUE" "\n📌 Troubleshooting:"
echo "  - If configs are not loading, check the auth token expiration"
echo "  - Verify the technical account has proper permissions"
echo "  - Check AEM error logs for any exceptions"
echo "  - Ensure the configuration page exists in AEM"

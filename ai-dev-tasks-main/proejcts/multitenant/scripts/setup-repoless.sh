#!/bin/bash

# RepoLess Configuration Setup Script for ue-multitenant-root
# This script configures the AEM Edge Delivery Services for RepoLess operation
# Author: AEM Development Team
# Date: January 2025

set -e  # Exit on error

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

print_message "$YELLOW" "=========================================="
print_message "$YELLOW" "RepoLess Configuration Setup Script"
print_message "$YELLOW" "=========================================="

# Configuration Variables
GITHUB_ORG="ComwrapUkReply"
REPO_NAME="ue-multitenant-root"
SITE_NAME="ue-multitenant-root"
AEM_AUTHOR_URL="https://author-p24706-e491522.adobeaemcloud.com"
TECH_ACCOUNT="B0AC1E69623B0F1F0A495EC0@techacct.adobe.com"
ADMIN_EMAIL="s.sznajder@reply.com"

# Check if auth token is provided as argument or environment variable
if [ -n "$1" ]; then
    AUTH_TOKEN="$1"
elif [ -n "$REPOLESS_AUTH_TOKEN" ]; then
    AUTH_TOKEN="$REPOLESS_AUTH_TOKEN"
else
    print_message "$RED" "❌ ERROR: Auth token is required!"
    print_message "$YELLOW" ""
    print_message "$YELLOW" "To get a fresh auth token:"
    print_message "$BLUE" "1. Go to https://admin.hlx.page/login"
    print_message "$BLUE" "2. Click 'login_adobe' to login with Adobe ID"
    print_message "$BLUE" "3. Once redirected to https://admin.hlx.page/profile"
    print_message "$BLUE" "4. Open browser Developer Tools (F12)"
    print_message "$BLUE" "5. Go to Application/Storage > Cookies"
    print_message "$BLUE" "6. Find and copy the 'auth_token' cookie value"
    print_message "$YELLOW" ""
    print_message "$YELLOW" "Usage:"
    print_message "$GREEN" "  ./scripts/setup-repoless.sh <auth_token>"
    print_message "$GREEN" "  OR"
    print_message "$GREEN" "  export REPOLESS_AUTH_TOKEN='<your_token>'"
    print_message "$GREEN" "  ./scripts/setup-repoless.sh"
    exit 1
fi

# Function to check if command was successful
check_response() {
    local http_code=$1
    local response=$2
    local step_name=$3
    
    if [[ "$http_code" == "200" ]] || [[ "$http_code" == "201" ]] || [[ "$http_code" == "204" ]]; then
        print_message "$GREEN" "✅ Success: $step_name (HTTP $http_code)"
        if [[ -n "$response" ]]; then
            echo "$response" | jq . 2>/dev/null || echo "$response"
        fi
    elif [[ "$http_code" == "403" ]]; then
        print_message "$RED" "❌ Authentication Failed: $step_name (HTTP $http_code)"
        print_message "$YELLOW" "Your auth token may have expired. Please get a fresh token."
        exit 1
    elif [[ "$http_code" == "401" ]]; then
        print_message "$RED" "❌ Unauthorized: $step_name (HTTP $http_code)"
        print_message "$YELLOW" "Check your auth token and permissions."
        exit 1
    else
        print_message "$RED" "❌ Failed: $step_name (HTTP $http_code)"
        if [[ -n "$response" ]]; then
            echo "$response"
        fi
        exit 1
    fi
}

print_message "$YELLOW" "Project: $REPO_NAME"
print_message "$YELLOW" "GitHub: $GITHUB_ORG"
print_message "$YELLOW" "Site: $SITE_NAME"
print_message "$YELLOW" "=========================================="

# Step 1: Configure content and code sources
print_message "$YELLOW" "\n📝 Step 1: Configuring content and code sources..."

RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" -X PUT "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${REPO_NAME}.json" \
  -H 'content-type: application/json' \
  -H "x-auth-token: ${AUTH_TOKEN}" \
  --data '{
  "version": 1,
  "code": {
    "owner": "'${GITHUB_ORG}'",
    "repo": "'${REPO_NAME}'",
    "source": {
      "type": "github",
      "url": "https://github.com/'${GITHUB_ORG}'/'${REPO_NAME}'"
    }
  },
  "content": {
    "source": {
      "url": "'${AEM_AUTHOR_URL}'/bin/franklin.delivery/'${GITHUB_ORG}'/'${SITE_NAME}'/main",
      "type": "markup",
      "suffix": ".html"
    }
  }
}')

HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

check_response "$HTTP_CODE" "$BODY" "Content and code source configuration"

# Step 2: Add path mapping for site configuration
print_message "$YELLOW" "\n📝 Step 2: Adding path mapping and site configuration..."

RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${REPO_NAME}/public.json" \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "paths": {
        "mappings": [
            "/content/'${SITE_NAME}'/:/",
            "/content/'${SITE_NAME}'/configuration:/.helix/config.json"
        ],
        "includes": [
            "/content/'${SITE_NAME}'/",
            "/content/dam/'${SITE_NAME}'/"
        ]
    }
}')

HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

check_response "$HTTP_CODE" "$BODY" "Path mapping configuration"

# Step 3: Verify public configuration
print_message "$YELLOW" "\n📝 Step 3: Verifying public configuration..."

sleep 2  # Give the service time to propagate

RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/config.json")
HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

if [[ "$HTTP_CODE" == "200" ]]; then
    print_message "$GREEN" "✅ Public configuration is accessible"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    print_message "$YELLOW" "⚠️  Configuration might still be propagating (HTTP $HTTP_CODE)"
fi

# Step 4: Set technical account and access control
print_message "$YELLOW" "\n📝 Step 4: Setting technical account and access control..."

RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${REPO_NAME}/access.json" \
  --header 'Content-Type: application/json' \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --data '{
    "admin": {
        "role": {
            "admin": [
                "'${ADMIN_EMAIL}'"
            ],
            "config_admin": [
                "'${TECH_ACCOUNT}'"
            ]
        },
        "requireAuth": "auto"
    }
}')

HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

check_response "$HTTP_CODE" "$BODY" "Access control configuration"

# Step 5: Final verification
print_message "$YELLOW" "\n📝 Step 5: Final verification..."

print_message "$YELLOW" "Testing configuration endpoints..."

# Test .aem.live domain
RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/config.json")
HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

if [[ "$HTTP_CODE" == "200" ]]; then
    print_message "$GREEN" "✅ .aem.live configuration endpoint is working"
    echo "$BODY" | jq . 2>/dev/null
else
    print_message "$YELLOW" "⚠️  .aem.live configuration not yet available (HTTP $HTTP_CODE)"
fi

# Test .aem.page domain
RESPONSE=$(curl -s -w "\n__HTTP_CODE__:%{http_code}" "https://main--${REPO_NAME}--${GITHUB_ORG}.aem.page/config.json")
HTTP_CODE=$(echo "$RESPONSE" | grep "__HTTP_CODE__:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/__HTTP_CODE__:/d')

if [[ "$HTTP_CODE" == "200" ]]; then
    print_message "$GREEN" "✅ .aem.page configuration endpoint is working"
    echo "$BODY" | jq . 2>/dev/null
else
    print_message "$YELLOW" "⚠️  .aem.page configuration not yet available (HTTP $HTTP_CODE)"
fi

print_message "$GREEN" "\n=========================================="
print_message "$GREEN" "RepoLess Configuration Complete!"
print_message "$GREEN" "=========================================="

print_message "$YELLOW" "\n📌 Important URLs:"
echo "  - Live site: https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/"
echo "  - Preview site: https://main--${REPO_NAME}--${GITHUB_ORG}.aem.page/"
echo "  - Config endpoint: https://main--${REPO_NAME}--${GITHUB_ORG}.aem.live/config.json"

print_message "$YELLOW" "\n📌 Next Steps:"
echo "  1. Verify the configuration in AEM Author"
echo "  2. Remove fstab.yaml and paths.json from the repository"
echo "  3. Test content publishing from AEM"
echo "  4. Create additional sites using this base configuration"

print_message "$YELLOW" "\n⚠️  Note:"
echo "  - Configuration changes may take a few minutes to propagate"
echo "  - Ensure AEM configuration is set to 'aem.live with repoless config setup'"
echo "  - The configuration page must exist in AEM at /content/${SITE_NAME}/configuration"
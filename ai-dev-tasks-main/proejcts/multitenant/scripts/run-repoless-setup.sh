#!/bin/bash

# Interactive RepoLess Setup Script
# This script will guide you through getting a fresh token and running the setup

set -e

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
print_message "$YELLOW" "Interactive RepoLess Setup"
print_message "$YELLOW" "=========================================="

print_message "$BLUE" "\n🔑 Getting Fresh Auth Token"
print_message "$YELLOW" "\nPlease follow these steps to get a fresh auth token:"
print_message "$GREEN" "1. Open your browser and go to: https://admin.hlx.page/login"
print_message "$GREEN" "2. Click 'login_adobe' and authenticate with your Adobe ID"
print_message "$GREEN" "3. You'll be redirected to: https://admin.hlx.page/profile"
print_message "$GREEN" "4. Open Developer Tools (F12 or right-click > Inspect)"
print_message "$GREEN" "5. Go to Application tab > Cookies > https://admin.hlx.page"
print_message "$GREEN" "6. Find the 'auth_token' cookie and copy its value"

echo ""
print_message "$BLUE" "📋 Ready to proceed?"
read -p "Press Enter when you have copied the auth_token value..."

echo ""
print_message "$YELLOW" "Please paste your auth token below:"
print_message "$BLUE" "(The token will be hidden for security)"
read -s AUTH_TOKEN

# Validate token format (JWT tokens start with 'eyJ')
if [[ ! "$AUTH_TOKEN" =~ ^eyJ ]]; then
    print_message "$RED" "❌ Invalid token format. JWT tokens should start with 'eyJ'"
    print_message "$YELLOW" "Please make sure you copied the complete token value."
    exit 1
fi

print_message "$GREEN" "\n✅ Token received! Testing authentication..."

# Test the token
TEST_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "x-auth-token: $AUTH_TOKEN" "https://admin.hlx.page/profile")
HTTP_CODE=$(echo "$TEST_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [[ "$HTTP_CODE" == "200" ]]; then
    print_message "$GREEN" "✅ Authentication successful!"
else
    print_message "$RED" "❌ Authentication failed (HTTP $HTTP_CODE)"
    print_message "$YELLOW" "Please check your token and try again."
    exit 1
fi

print_message "$BLUE" "\n🚀 Starting RepoLess configuration..."

# Export the token and run the setup script
export REPOLESS_AUTH_TOKEN="$AUTH_TOKEN"
exec ./scripts/setup-repoless.sh

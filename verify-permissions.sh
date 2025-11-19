#!/bin/bash

# Permission Verification Script
# This script helps verify that author and publisher permissions are correctly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ORG="ComwrapUkReply"
SITE="ue-multitenant-root"
ADMIN_ENDPOINT="https://admin.hlx.page/config/${ORG}/sites/${SITE}/access/admin.json"

echo "=========================================="
echo "Permission Verification Script"
echo "=========================================="
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Auth token is required${NC}"
    echo "Usage: ./verify-permissions.sh <auth-token>"
    echo ""
    echo "To get your auth token:"
    echo "1. Go to https://admin.hlx.page"
    echo "2. Open browser developer tools (F12)"
    echo "3. Go to Network tab"
    echo "4. Make any API call"
    echo "5. Copy the 'x-auth-token' header value"
    exit 1
fi

TOKEN=$1

echo -e "${YELLOW}Step 1: Fetching current access configuration...${NC}"
echo ""

# Fetch current configuration
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "${ADMIN_ENDPOINT}" \
    -H "x-auth-token: ${TOKEN}" \
    -H "content-type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}Error: Failed to fetch configuration (HTTP ${HTTP_CODE})${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo -e "${GREEN}✓ Configuration fetched successfully${NC}"
echo ""

# Parse and display configuration
echo -e "${YELLOW}Current Permission Configuration:${NC}"
echo ""

# Extract roles using jq if available, otherwise use grep
if command -v jq &> /dev/null; then
    echo "Authors:"
    echo "$BODY" | jq -r '.role.author[]?' | sed 's/^/  - /'
    echo ""
    echo "Publishers:"
    echo "$BODY" | jq -r '.role.publish[]?' | sed 's/^/  - /'
    echo ""
    echo "Admins:"
    echo "$BODY" | jq -r '.role.admin[]?' | sed 's/^/  - /' || echo "  (none)"
else
    echo "$BODY" | grep -A 10 '"role"'
fi

echo ""
echo "=========================================="
echo -e "${YELLOW}Step 2: Verification Checklist${NC}"
echo "=========================================="
echo ""

# Expected authors
EXPECTED_AUTHORS=("h.scott@reply.com" "s.sznajder@reply.com")
EXPECTED_PUBLISHERS=("n.hutchison@reply.com" "j.leckie@reply.com")

echo "Verifying Author Role:"
for email in "${EXPECTED_AUTHORS[@]}"; do
    if echo "$BODY" | grep -q "\"$email\""; then
        echo -e "  ${GREEN}✓${NC} $email is configured as author"
    else
        echo -e "  ${RED}✗${NC} $email is NOT configured as author"
    fi
done

echo ""
echo "Verifying Publisher Role:"
for email in "${EXPECTED_PUBLISHERS[@]}"; do
    if echo "$BODY" | grep -q "\"$email\""; then
        echo -e "  ${GREEN}✓${NC} $email is configured as publisher"
    else
        echo -e "  ${RED}✗${NC} $email is NOT configured as publisher"
    fi
done

echo ""
echo "=========================================="
echo -e "${YELLOW}Step 3: Manual Testing Instructions${NC}"
echo "=========================================="
echo ""

echo "To test permissions in Universal Editor:"
echo ""
echo "1. For Authors (Preview Only):"
echo "   - Log in as: h.scott@reply.com or s.sznajder@reply.com"
echo "   - Open: https://experience.adobe.com/aem/editor/canvas"
echo "   - Load site: https://main--${SITE}--${ORG}.aem.page/"
echo "   - Expected: Can edit and preview, but NO publish button"
echo ""
echo "2. For Publishers (Preview + Publish):"
echo "   - Log in as: n.hutchison@reply.com or j.leckie@reply.com"
echo "   - Open: https://experience.adobe.com/aem/editor/canvas"
echo "   - Load site: https://main--${SITE}--${ORG}.aem.page/"
echo "   - Expected: Can edit, preview, AND publish"
echo ""
echo "3. Verify Published Content:"
echo "   - After publishing, check: https://main--${SITE}--${ORG}.aem.live/"
echo "   - Changes should be visible on live site"
echo ""

echo "=========================================="
echo -e "${GREEN}Verification Complete!${NC}"
echo "=========================================="
echo ""
echo "For detailed testing instructions, see: PERMISSION_VERIFICATION_GUIDE.md"


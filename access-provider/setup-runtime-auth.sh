#!/bin/bash

###############################################################################
# Setup Runtime Authentication
# This script helps configure Adobe I/O Runtime authentication
###############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Adobe I/O Runtime Authentication Setup                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if logged in to Adobe I/O
echo -e "${YELLOW}Step 1: Checking Adobe I/O login...${NC}"
if aio whoami 2>/dev/null | grep -q "You are logged in"; then
    echo -e "${GREEN}✓ Logged in to Adobe I/O${NC}"
else
    echo -e "${RED}❌ Not logged in to Adobe I/O${NC}"
    echo "Run: aio login"
    exit 1
fi

# Get namespace from command line argument, environment variable, or prompt
echo -e "\n${YELLOW}Step 2: Finding your Runtime namespace...${NC}"

# Check if namespace provided as argument
if [ ! -z "$1" ]; then
    NAMESPACE="$1"
    echo -e "${GREEN}✓ Namespace provided as argument: $NAMESPACE${NC}"
# Check if namespace provided as environment variable
elif [ ! -z "$RUNTIME_NAMESPACE" ]; then
    NAMESPACE="$RUNTIME_NAMESPACE"
    echo -e "${GREEN}✓ Namespace from environment variable: $NAMESPACE${NC}"
else
    # Prompt for namespace
    echo "You need to get your namespace from Adobe Console:"
    echo ""
    echo "1. Visit: ${BLUE}https://console.adobe.io/${NC}"
    echo "2. Navigate to: ${BLUE}Runtime${NC} (or ${BLUE}I/O Runtime${NC})"
    echo "3. Your namespace will be displayed (format: ${BLUE}your-org-name${NC})"
    echo ""
    echo "Or set it as: ${BLUE}export RUNTIME_NAMESPACE=\"your-namespace\"${NC}"
    echo "Or pass as argument: ${BLUE}./setup-runtime-auth.sh your-namespace${NC}"
    echo ""
    read -p "Enter your namespace (or press Enter to skip): " NAMESPACE
fi

if [ -z "$NAMESPACE" ]; then
    echo -e "${YELLOW}⚠️  No namespace provided${NC}"
    echo ""
    echo "Alternative: Try to auto-detect namespace..."
    
    # Try to get org info
    ORG_INFO=$(aio config:get:ims.contexts.aio-cli-plugin-config.ims_org_id 2>/dev/null || echo "")
    
    if [ ! -z "$ORG_INFO" ]; then
        echo "Found organization ID: $ORG_INFO"
        echo "Your namespace might be based on your org name"
    fi
    
    echo ""
    echo "Please get your namespace from the console and run:"
    echo "  aio runtime property set --namespace YOUR_NAMESPACE"
    exit 1
fi

# Set the namespace
echo -e "\n${YELLOW}Step 3: Setting namespace...${NC}"
if aio runtime property set --namespace "$NAMESPACE" 2>&1; then
    echo -e "${GREEN}✓ Namespace set to: $NAMESPACE${NC}"
else
    echo -e "${RED}❌ Failed to set namespace${NC}"
    echo "You may need to authenticate Runtime separately"
    exit 1
fi

# Verify authentication
echo -e "\n${YELLOW}Step 4: Verifying authentication...${NC}"
if aio runtime action list 2>&1 | grep -q "Error\|failed\|AUTH"; then
    echo -e "${RED}❌ Authentication still not working${NC}"
    echo ""
    echo "You may need to:"
    echo "1. Ensure Runtime is enabled in your Adobe organization"
    echo "2. Check you have Runtime permissions"
    echo "3. Try: aio auth:login"
    exit 1
else
    echo -e "${GREEN}✓ Runtime authentication successful!${NC}"
    echo ""
    echo "You can now run: ./deploy.sh"
fi


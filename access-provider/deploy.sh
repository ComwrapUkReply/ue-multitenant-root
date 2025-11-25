#!/bin/bash

###############################################################################
# Deploy Access Provider Actions
# Run this script after authenticating with 'aio login'
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if ENCRYPTION_KEY is set
if [ -z "$ENCRYPTION_KEY" ]; then
    echo -e "${RED}❌ ERROR: ENCRYPTION_KEY is not set${NC}"
    echo "Set it with: export ENCRYPTION_KEY=\"your-key-here\""
    exit 1
fi

echo -e "${GREEN}✓ ENCRYPTION_KEY is set${NC}"

# Check if authenticated
echo -e "\n${YELLOW}Checking authentication...${NC}"

# Try to get runtime properties
RUNTIME_PROPS=$(aio runtime property get 2>&1)
AUTH_CHECK=$(echo "$RUNTIME_PROPS" | grep "whisk auth" | awk '{print $3}')

if [ -z "$AUTH_CHECK" ] || [ "$AUTH_CHECK" == "" ]; then
    echo -e "${YELLOW}⚠️  Runtime authentication not configured${NC}"
    echo ""
    
    # Check if namespace is provided as environment variable
    if [ ! -z "$RUNTIME_NAMESPACE" ]; then
        echo -e "${YELLOW}Found RUNTIME_NAMESPACE environment variable: $RUNTIME_NAMESPACE${NC}"
        echo -e "${YELLOW}Attempting to set namespace...${NC}"
        if aio runtime property set --namespace "$RUNTIME_NAMESPACE" 2>&1; then
            echo -e "${GREEN}✓ Namespace set successfully${NC}"
            # Re-check authentication
            RUNTIME_PROPS=$(aio runtime property get 2>&1)
            AUTH_CHECK=$(echo "$RUNTIME_PROPS" | grep "whisk auth" | awk '{print $3}')
            if [ ! -z "$AUTH_CHECK" ] && [ "$AUTH_CHECK" != "" ]; then
                echo -e "${GREEN}✓ Authentication now configured!${NC}"
            else
                echo -e "${RED}❌ Still not authenticated after setting namespace${NC}"
                echo "You may need to ensure Runtime is enabled in your organization"
                exit 1
            fi
        else
            echo -e "${RED}❌ Failed to set namespace${NC}"
            exit 1
        fi
    else
        echo "You need to set up your Runtime namespace. Try one of these:"
        echo ""
        echo "Option 1: Set namespace as environment variable (recommended)"
        echo "  export RUNTIME_NAMESPACE=\"your-namespace\""
        echo "  ./deploy.sh"
        echo ""
        echo "Option 2: Set namespace manually"
        echo "  aio runtime property set --namespace YOUR_NAMESPACE"
        echo "  ./deploy.sh"
        echo ""
        echo "Option 3: Use setup script"
        echo "  ./setup-runtime-auth.sh your-namespace"
        echo "  ./deploy.sh"
        echo ""
        echo "Option 4: Get namespace from Adobe Console"
        echo "  Visit: https://console.adobe.io/"
        echo "  Navigate to: Runtime → Your namespace"
        echo ""
        
        # Try to list namespaces to help user
        echo -e "${YELLOW}Attempting to list namespaces...${NC}"
        NAMESPACES=$(aio runtime namespace list 2>&1)
        
        if echo "$NAMESPACES" | grep -q "Error\|failed\|AUTH"; then
            echo -e "${RED}Could not list namespaces. You may need to:${NC}"
            echo "  1. Ensure you have Runtime access in your Adobe organization"
            echo "  2. Try: aio auth:login"
            echo "  3. Or set namespace manually: export RUNTIME_NAMESPACE=\"your-namespace\""
            exit 1
        else
            echo "$NAMESPACES"
            echo ""
            echo -e "${YELLOW}Please set your namespace and run this script again:${NC}"
            echo "  export RUNTIME_NAMESPACE=\"<namespace-from-above>\""
            echo "  ./deploy.sh"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}✓ Authenticated${NC}"

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Package name
PACKAGE="gated-content"

echo -e "\n${YELLOW}Creating package: $PACKAGE${NC}"
aio runtime package create "$PACKAGE" 2>/dev/null || echo "Package may already exist"

# Deploy login action
echo -e "\n${YELLOW}Deploying login action...${NC}"
cd login
aio runtime action create "$PACKAGE/login" index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

echo -e "${GREEN}✓ Login action deployed${NC}"

# Deploy verify action
echo -e "\n${YELLOW}Deploying verify action...${NC}"
cd ../verify
aio runtime action create "$PACKAGE/verify" index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

echo -e "${GREEN}✓ Verify action deployed${NC}"

# Deploy logout action
echo -e "\n${YELLOW}Deploying logout action...${NC}"
cd ../logout
aio runtime action create "$PACKAGE/logout" index.js \
  --web true \
  --kind nodejs:20

echo -e "${GREEN}✓ Logout action deployed${NC}"

# Get action URLs
echo -e "\n${YELLOW}Getting action URLs...${NC}"
cd "$SCRIPT_DIR"

LOGIN_URL=$(aio runtime action get "$PACKAGE/login" --url 2>/dev/null | tail -1)
VERIFY_URL=$(aio runtime action get "$PACKAGE/verify" --url 2>/dev/null | tail -1)
LOGOUT_URL=$(aio runtime action get "$PACKAGE/logout" --url 2>/dev/null | tail -1)

echo -e "\n${GREEN}✅ Deployment Complete!${NC}\n"
echo "Action URLs:"
echo "  Login:  $LOGIN_URL"
echo "  Verify: $VERIFY_URL"
echo "  Logout: $LOGOUT_URL"
echo ""
echo "Next steps:"
echo "1. Update CloudFlare Worker with VERIFY_URL: $VERIFY_URL"
echo "2. Update login block with LOGIN_URL: $LOGIN_URL"
echo "3. Update header with LOGOUT_URL: $LOGOUT_URL"


#!/bin/bash

###############################################################################
# API Testing Script for Gated Content
# Tests the Access Provider endpoints manually
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ACCESS_PROVIDER_URL="${ACCESS_PROVIDER_URL:-http://localhost:9000}"
VERBOSE="${VERBOSE:-false}"

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq is not installed. Please install it to run this script."
    echo "  macOS: brew install jq"
    echo "  Ubuntu: sudo apt-get install jq"
    exit 1
fi

echo -e "${YELLOW}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Gated Content API Testing                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_info "Testing against: $ACCESS_PROVIDER_URL"
echo ""

###############################################################################
# Test 1: Login with valid member credentials
###############################################################################
print_header "Test 1: Login - Valid Member Credentials"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ACCESS_PROVIDER_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "demo123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Login succeeded (HTTP $HTTP_CODE)"
    
    # Parse response
    USER_DATA=$(echo "$BODY" | jq -r '.userData')
    LEVEL=$(echo "$USER_DATA" | jq -r '.level')
    
    if [ "$LEVEL" = "member" ]; then
        print_success "User level is 'member'"
    else
        print_error "Expected level 'member', got '$LEVEL'"
    fi
    
    # Check if cookies are in response
    if echo "$BODY" | jq -e '.cookies' > /dev/null 2>&1; then
        print_success "Response includes cookies"
    else
        print_error "Response missing cookies"
    fi
    
    # Save cookies for later tests
    VERIFICATION_TOKEN=$(echo "$BODY" | jq -r '.cookies.access_verification // empty')
    USER_DATA_COOKIE=$(echo "$BODY" | jq -r '.cookies.user_data // empty')
    
    if [ "$VERBOSE" = "true" ]; then
        echo "$BODY" | jq '.'
    fi
else
    print_error "Login failed (HTTP $HTTP_CODE)"
    echo "$BODY"
fi

###############################################################################
# Test 2: Login with invalid credentials
###############################################################################
print_header "Test 2: Login - Invalid Credentials"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ACCESS_PROVIDER_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Login correctly rejected (HTTP $HTTP_CODE)"
else
    print_error "Expected HTTP 401, got $HTTP_CODE"
fi

if [ "$VERBOSE" = "true" ]; then
    echo "$BODY"
fi

###############################################################################
# Test 3: Verify valid token
###############################################################################
print_header "Test 3: Verify - Valid Token"

if [ -z "$VERIFICATION_TOKEN" ]; then
    print_error "No verification token available (Test 1 may have failed)"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X POST "$ACCESS_PROVIDER_URL/verify" \
      -H "Content-Type: application/json" \
      -d "{
        \"verificationToken\": \"$VERIFICATION_TOKEN\",
        \"userData\": $USER_DATA_COOKIE
      }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Token verification succeeded (HTTP $HTTP_CODE)"
        
        VALID=$(echo "$BODY" | jq -r '.valid')
        if [ "$VALID" = "true" ]; then
            print_success "Token is valid"
        else
            print_error "Token marked as invalid"
        fi
        
        if [ "$VERBOSE" = "true" ]; then
            echo "$BODY" | jq '.'
        fi
    else
        print_error "Token verification failed (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
fi

###############################################################################
# Test 4: Verify with tampered user data
###############################################################################
print_header "Test 4: Verify - Tampered User Data"

if [ -z "$VERIFICATION_TOKEN" ]; then
    print_error "No verification token available"
else
    # Tamper with user data (change level)
    TAMPERED_DATA=$(echo "$USER_DATA_COOKIE" | jq '.level = "admin"')
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X POST "$ACCESS_PROVIDER_URL/verify" \
      -H "Content-Type: application/json" \
      -d "{
        \"verificationToken\": \"$VERIFICATION_TOKEN\",
        \"userData\": $TAMPERED_DATA
      }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Tampered data correctly rejected (HTTP $HTTP_CODE)"
    else
        print_error "Tampered data was accepted! (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
fi

###############################################################################
# Test 5: Login as premium user
###############################################################################
print_header "Test 5: Login - Premium User"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ACCESS_PROVIDER_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "premium@example.com",
    "password": "demo123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Premium login succeeded (HTTP $HTTP_CODE)"
    
    LEVEL=$(echo "$BODY" | jq -r '.userData.level')
    if [ "$LEVEL" = "premium" ]; then
        print_success "User level is 'premium'"
    else
        print_error "Expected level 'premium', got '$LEVEL'"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        echo "$BODY" | jq '.'
    fi
else
    print_error "Premium login failed (HTTP $HTTP_CODE)"
    echo "$BODY"
fi

###############################################################################
# Test 6: Login as admin user
###############################################################################
print_header "Test 6: Login - Admin User"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ACCESS_PROVIDER_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "demo123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Admin login succeeded (HTTP $HTTP_CODE)"
    
    LEVEL=$(echo "$BODY" | jq -r '.userData.level')
    if [ "$LEVEL" = "admin" ]; then
        print_success "User level is 'admin'"
    else
        print_error "Expected level 'admin', got '$LEVEL'"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        echo "$BODY" | jq '.'
    fi
else
    print_error "Admin login failed (HTTP $HTTP_CODE)"
    echo "$BODY"
fi

###############################################################################
# Test 7: Logout endpoint
###############################################################################
print_header "Test 7: Logout Endpoint"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ACCESS_PROVIDER_URL/logout")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Logout endpoint works (HTTP $HTTP_CODE)"
else
    print_error "Logout failed (HTTP $HTTP_CODE)"
fi

###############################################################################
# Summary
###############################################################################
print_header "Test Summary"

echo -e "All API tests completed."
echo -e "\nFor detailed output, run with: ${YELLOW}VERBOSE=true $0${NC}"
echo -e "To test a different URL: ${YELLOW}ACCESS_PROVIDER_URL=https://your-url.com $0${NC}"
echo ""


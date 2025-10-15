# RepoLess Configuration Verification Guide

This guide provides step-by-step verification commands for each stage of the RepoLess setup process.

## Prerequisites Verification

### 1. Verify AEM Environment
```bash
# Check if AEM author is accessible
curl -I "https://author-p24706-e491522.adobeaemcloud.com"
# Should return HTTP 200 or redirect
```

### 2. Verify GitHub Repository Access
```bash
# Check if GitHub repo is accessible
curl -I "https://github.com/ComwrapUkReply/ue-multitenant-root"
# Should return HTTP 200
```

### 3. Verify Current Site Status
```bash
# Check if site is currently working
curl -I "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/"
# Should return HTTP 200

# Check component definitions
curl -s "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/component-definition.json" | jq .
```

## Step-by-Step Configuration Verification

### Step 1: Content and Code Source Configuration

**Command:**
```bash
curl -X PUT "https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root.json" \
  -H 'content-type: application/json' \
  -H 'x-auth-token: YOUR_TOKEN_HERE' \
  --data '{
  "version": 1,
  "code": {
    "owner": "ComwrapUkReply",
    "repo": "ue-multitenant-root",
    "source": {
      "type": "github",
      "url": "https://github.com/ComwrapUkReply/ue-multitenant-root"
    }
  },
  "content": {
    "source": {
      "url": "https://author-p24706-e491522.adobeaemcloud.com/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root/main",
      "type": "markup",
      "suffix": ".html"
    }
  }
}'
```

**Verification:**
```bash
# Expected Response: HTTP 200/201 with JSON confirmation
# Success indicators:
# - HTTP status: 200 or 201
# - Response contains configuration details
# - No error messages in response
```

**What to check:**
- ✅ HTTP status code is 200 or 201
- ✅ Response contains the configuration you sent
- ✅ No error messages in the response body

### Step 2: Path Mapping Configuration

**Command:**
```bash
curl --request POST \
  --url "https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/public.json" \
  --header 'x-auth-token: YOUR_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "paths": {
        "mappings": [
            "/content/ue-multitenant-root/:/",
            "/content/ue-multitenant-root/configuration:/.helix/config.json"
        ],
        "includes": [
            "/content/ue-multitenant-root/",
            "/content/dam/ue-multitenant-root/"
        ]
    }
}'
```

**Verification:**
```bash
# Expected Response: HTTP 200/201 with path mapping confirmation
# Check the configuration is accessible:
curl -s "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/config.json"
```

**What to check:**
- ✅ HTTP status code is 200 or 201
- ✅ Path mappings are correctly set
- ✅ Configuration endpoint becomes accessible (may take 2-5 minutes)

### Step 3: Access Control Configuration

**Command:**
```bash
curl --request POST \
  --url "https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access.json" \
  --header 'Content-Type: application/json' \
  --header 'x-auth-token: YOUR_TOKEN_HERE' \
  --data '{
    "admin": {
        "role": {
            "admin": [
                "s.sznajder@reply.com"
            ],
            "config_admin": [
                "B0AC1E69623B0F1F0A495EC0@techacct.adobe.com"
            ]
        },
        "requireAuth": "auto"
    }
}'
```

**Verification:**
```bash
# Expected Response: HTTP 200/201 with access control confirmation
```

**What to check:**
- ✅ HTTP status code is 200 or 201
- ✅ Admin roles are correctly assigned
- ✅ Technical account is properly configured

## Configuration Endpoint Verification

### Test Configuration Accessibility

```bash
# Test .aem.live domain
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/config.json"

# Test .aem.page domain
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.page/config.json"
```

**Expected Response:**
```json
{
  "paths": {
    "mappings": [
      "/content/ue-multitenant-root/:/",
      "/content/ue-multitenant-root/configuration:/.helix/config.json"
    ],
    "includes": [
      "/content/ue-multitenant-root/",
      "/content/dam/ue-multitenant-root/"
    ]
  }
}
```

**What to check:**
- ✅ HTTP status code is 200
- ✅ JSON response contains path mappings
- ✅ Mappings match your configuration
- ✅ Both .aem.live and .aem.page domains work

## Component System Verification

### Test Component Definitions

```bash
# Check component definitions
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/component-definition.json" | jq .

# Check component models
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/component-models.json" | jq .

# Check component filters
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/component-filters.json" | jq .
```

**What to check:**
- ✅ All endpoints return HTTP 200
- ✅ JSON responses are valid and contain component definitions
- ✅ Components include: hero, cards, columns, fragment, etc.

## Site Functionality Verification

### Test Site Accessibility

```bash
# Test main site
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/" | head -20

# Test preview site
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.page/" | head -20
```

**What to check:**
- ✅ HTTP status code is 200
- ✅ HTML content is returned
- ✅ Content includes proper meta tags and scripts
- ✅ Both live and preview sites work

### Test Asset Loading

```bash
# Test CSS loading
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/styles/styles.css" | head -10

# Test JavaScript loading
curl -s -w "\nHTTP_CODE:%{http_code}" "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/scripts/scripts.js" | head -10
```

**What to check:**
- ✅ CSS and JS files load successfully (HTTP 200)
- ✅ Files contain expected content

## AEM Integration Verification

### Test AEM Content Delivery

```bash
# Test AEM delivery endpoint
curl -s -w "\nHTTP_CODE:%{http_code}" "https://author-p24706-e491522.adobeaemcloud.com/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root/main"
```

**What to check:**
- ✅ AEM delivery endpoint is accessible
- ✅ Returns content in expected format

### Test Universal Editor Integration

1. **Open Universal Editor**:
   ```
   https://experience.adobe.com/aem/editor/canvas
   ```

2. **Load your site**:
   ```
   https://main--ue-multitenant-root--ComwrapUkReply.aem.page/
   ```

**What to check:**
- ✅ Site loads in Universal Editor
- ✅ Components are editable
- ✅ Publishing works correctly

## Complete Verification Script

Run the comprehensive verification:

```bash
./scripts/verify-repoless.sh
```

This script will test all endpoints and provide a complete status report.

## Troubleshooting Common Issues

### Issue 1: Config.json Not Loading (404)

**Verification Commands:**
```bash
# Check if path mapping is correct
curl -s "https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/public.json" \
  -H "x-auth-token: YOUR_TOKEN"

# Wait 5-10 minutes and try again
curl -s "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/config.json"
```

**Solutions:**
- Wait for configuration propagation (5-10 minutes)
- Verify path mappings are correct
- Check that configuration page exists in AEM

### Issue 2: Authentication Errors (401/403)

**Verification Commands:**
```bash
# Test token validity
curl -s -w "\nHTTP_CODE:%{http_code}" -H "x-auth-token: YOUR_TOKEN" "https://admin.hlx.page/profile"
```

**Solutions:**
- Get a fresh auth token
- Verify you have proper permissions
- Check technical account configuration

### Issue 3: Site Not Loading

**Verification Commands:**
```bash
# Check site status
curl -I "https://main--ue-multitenant-root--ComwrapUkReply.aem.live/"

# Check AEM delivery
curl -I "https://author-p24706-e491522.adobeaemcloud.com/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root/main"
```

**Solutions:**
- Verify AEM configuration is set to "repoless"
- Check that content exists in AEM
- Verify technical account has publishing permissions

## Success Criteria Checklist

Your RepoLess configuration is successful when:

- [ ] **Configuration Commands**: All return HTTP 200/201
- [ ] **Config Endpoint**: `config.json` is accessible and returns correct mappings
- [ ] **Component System**: All component endpoints return valid JSON
- [ ] **Site Access**: Both .aem.live and .aem.page domains work
- [ ] **AEM Integration**: Content can be published from AEM
- [ ] **Universal Editor**: Site loads and is editable in Universal Editor
- [ ] **Asset Loading**: CSS, JS, and images load correctly
- [ ] **Performance**: Site loads quickly and meets Core Web Vitals

## Next Steps After Verification

Once all verifications pass:

1. **Remove Legacy Files**:
   ```bash
   # These files are no longer needed with RepoLess
   rm fstab.yaml paths.json
   git add -A
   git commit -m "Remove legacy files - now using RepoLess configuration"
   git push
   ```

2. **Test Content Publishing**:
   - Edit content in AEM
   - Publish changes
   - Verify changes appear on live site

3. **Create Additional Sites**:
   - Use this configuration as a base for other sites
   - Follow the same verification process

4. **Monitor Performance**:
   - Use Lighthouse to check Core Web Vitals
   - Monitor site performance metrics

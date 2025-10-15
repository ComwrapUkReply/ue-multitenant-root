# Multilingual RepoLess Setup Guide for AEM Universal Editor

This comprehensive guide walks you through setting up a multilingual RepoLess configuration for AEM Universal Editor with Edge Delivery Services. Follow these steps to create a multi-site, multi-language setup that allows content authors to manage localized content efficiently.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step 1: Initial RepoLess Configuration](#step-1-initial-repoless-configuration)
5. [Step 2: Configure Multilingual Path Mappings](#step-2-configure-multilingual-path-mappings)
6. [Step 3: Set Up Access Control](#step-3-set-up-access-control)
7. [Step 4: Create Localized Edge Delivery Services Sites](#step-4-create-localized-edge-delivery-services-sites)
8. [Step 5: Configure AEM Cloud Services](#step-5-configure-aem-cloud-services)
9. [Step 6: Verification and Testing](#step-6-verification-and-testing)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## Overview

### What is RepoLess Multilingual Setup?

RepoLess multilingual setup allows you to:
- Run multiple AEM sites from a single codebase
- Support multiple languages and regions
- Use separate content sources for each locale
- Maintain centralized code while having localized content
- Leverage AEM's Multi Site Manager (MSM) features

### Architecture

```
Single GitHub Repository (Code)
├── Shared blocks, styles, scripts
├── Shared components and templates
└── Configuration files

Multiple AEM Content Sources
├── /content/project/ch/de (Switzerland German)
├── /content/project/ch/fr (Switzerland French)
├── /content/project/ch/en (Switzerland English)
├── /content/project/de/en (Germany English)
└── /content/project/de/de (Germany German)

Multiple Edge Delivery Services Sites
├── project-ch-de.aem.page
├── project-ch-fr.aem.page
├── project-ch-en.aem.page
├── project-de-en.aem.page
└── project-de-de.aem.page
```

## Prerequisites

### Required Access and Information

1. **AEM as a Cloud Service Environment**
   - Author instance URL: `https://author-p[PROGRAM_ID]-e[ENVIRONMENT_ID].adobeaemcloud.com`
   - Admin access to AEM Author
   - Universal Editor enabled

2. **GitHub Repository**
   - Repository with AEM boilerplate code
   - Admin access to the repository
   - GitHub organization name (lowercase)

3. **Adobe Admin API Access**
   - Authentication token from `https://admin.hlx.page/login`
   - Technical Account ID for publishing privileges

4. **Project Information**
   - Project name (e.g., `ue-multitenant-root`)
   - Locale structure (e.g., `ch/de`, `ch/fr`, `de/en`)
   - GitHub organization name (must be lowercase)

### Tools Required

- Terminal/Command Line access
- Text editor
- Web browser
- `curl` command (for API calls)

## Project Structure

### Recommended Locale Structure

```
/content/[project-name]/
├── ch/                    # Switzerland
│   ├── de/               # German
│   ├── fr/               # French
│   └── en/               # English
├── de/                    # Germany
│   ├── de/               # German
│   └── en/               # English
└── configuration/         # Project configuration
```

### Edge Delivery Services Site Naming Convention

- Format: `[project-name]-[country]-[language]`
- Examples:
  - `ue-multitenant-root-ch-de`
  - `ue-multitenant-root-ch-fr`
  - `ue-multitenant-root-de-en`

## Step 1: Initial RepoLess Configuration

### 1.1 Gather Required Information

Create a configuration file with your project details:

```bash
# Create project-config.env file
cat > project-config.env << EOF
# Project Configuration
PROJECT_NAME="ue-multitenant-root"
GITHUB_ORG="comwrapukreply"  # Must be lowercase
GITHUB_REPO="ue-multitenant-root"

# AEM Configuration
AEM_AUTHOR_URL="https://author-p24706-e491522.adobeaemcloud.com"
PROGRAM_ID="24706"
ENVIRONMENT_ID="491522"

# User Configuration
ADMIN_EMAIL="your.email@domain.com"
TECHNICAL_ACCOUNT_ID="YOUR_TECH_ACCOUNT_ID@techacct.adobe.com"

# Authentication (Get from https://admin.hlx.page/login)
AUTH_TOKEN="YOUR_AUTH_TOKEN_HERE"
EOF
```

### 1.2 Configure Main RepoLess Site

```bash
# Load configuration
source project-config.env

# Configure main site
curl --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${PROJECT_NAME}.json" \
  --header 'Content-Type: application/json' \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --data "{
    \"code\": {
      \"owner\": \"${GITHUB_ORG}\",
      \"repo\": \"${GITHUB_REPO}\",
      \"source\": {
        \"type\": \"github\",
        \"url\": \"https://github.com/${GITHUB_ORG}/${GITHUB_REPO}\"
      }
    },
    \"content\": {
      \"source\": {
        \"url\": \"${AEM_AUTHOR_URL}/bin/franklin.delivery/${GITHUB_ORG}/${PROJECT_NAME}/main\",
        \"type\": \"markup\",
        \"suffix\": \".html\"
      }
    }
  }" \
  -w "\nHTTP_CODE:%{http_code}"
```

**Expected Result:** HTTP_CODE:200

## Step 2: Configure Multilingual Path Mappings

### 2.1 Create Multilingual Configuration File

```bash
# Create multilingual-config.json
cat > multilingual-config.json << EOF
{
  "paths": {
    "mappings": [
      "/content/${PROJECT_NAME}/:/",
      "/content/${PROJECT_NAME}/configuration:/.helix/config.json",
      "/content/${PROJECT_NAME}/ch/de/:/ch/de/",
      "/content/${PROJECT_NAME}/ch/fr/:/ch/fr/",
      "/content/${PROJECT_NAME}/ch/en/:/ch/en/",
      "/content/${PROJECT_NAME}/de/en/:/de/en/",
      "/content/${PROJECT_NAME}/de/de/:/de/de/"
    ],
    "includes": [
      "/content/${PROJECT_NAME}/",
      "/content/dam/${PROJECT_NAME}/"
    ]
  },
  "custom": {
    "locales": [
      {
        "code": "ch-de",
        "path": "/ch/de/",
        "label": "Switzerland (German)"
      },
      {
        "code": "ch-fr",
        "path": "/ch/fr/",
        "label": "Switzerland (French)"
      },
      {
        "code": "ch-en",
        "path": "/ch/en/",
        "label": "Switzerland (English)"
      },
      {
        "code": "de-en",
        "path": "/de/en/",
        "label": "Germany (English)"
      },
      {
        "code": "de-de",
        "path": "/de/de/",
        "label": "Germany (German)",
        "default": true
      }
    ]
  }
}
EOF
```

### 2.2 Apply Multilingual Configuration

```bash
# Apply multilingual path mappings
curl --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${PROJECT_NAME}/public.json" \
  --header 'Content-Type: application/json' \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --data @multilingual-config.json \
  -w "\nHTTP_CODE:%{http_code}"
```

**Expected Result:** HTTP_CODE:200

## Step 3: Set Up Access Control

### 3.1 Create Access Control Configuration

```bash
# Create access-control-config.json
cat > access-control-config.json << EOF
{
  "admin": {
    "role": {
      "admin": [
        "${ADMIN_EMAIL}"
      ],
      "config_admin": [
        "${TECHNICAL_ACCOUNT_ID}"
      ]
    },
    "requireAuth": "auto"
  }
}
EOF
```

### 3.2 Apply Access Control

```bash
# Configure access control
curl --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${PROJECT_NAME}/access.json" \
  --header 'Content-Type: application/json' \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --data @access-control-config.json \
  -w "\nHTTP_CODE:%{http_code}"
```

**Expected Result:** HTTP_CODE:200

## Step 4: Create Localized Edge Delivery Services Sites

### 4.1 Define Locales

```bash
# Define locale mappings
declare -A LOCALES=(
    ["ch-de"]="Switzerland German"
    ["ch-fr"]="Switzerland French"
    ["ch-en"]="Switzerland English"
    ["de-en"]="Germany English"
    ["de-de"]="Germany German"
)
```

### 4.2 Create Sites for Each Locale

```bash
# Create localized sites
for locale in "${!LOCALES[@]}"; do
    site_name="${PROJECT_NAME}-${locale}"
    
    echo "Creating site: ${site_name}"
    
    # Create Edge Delivery Services site
    curl --request POST \
      --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${site_name}.json" \
      --header 'Content-Type: application/json' \
      --header "x-auth-token: ${AUTH_TOKEN}" \
      --data "{
        \"code\": {
          \"owner\": \"${GITHUB_ORG}\",
          \"repo\": \"${GITHUB_REPO}\",
          \"source\": {
            \"type\": \"github\",
            \"url\": \"https://github.com/${GITHUB_ORG}/${GITHUB_REPO}\"
          }
        },
        \"content\": {
          \"source\": {
            \"url\": \"${AEM_AUTHOR_URL}/bin/franklin.delivery/${GITHUB_ORG}/${site_name}/main\",
            \"type\": \"markup\",
            \"suffix\": \".html\"
          }
        },
        \"access\": {
          \"admin\": {
            \"role\": {
              \"admin\": [
                \"${ADMIN_EMAIL}\"
              ],
              \"config_admin\": [
                \"${TECHNICAL_ACCOUNT_ID}\"
              ]
            },
            \"requireAuth\": \"auto\"
          }
        }
      }" \
      -w "\nHTTP_CODE:%{http_code}"
    
    # Configure path mapping
    curl --request POST \
      --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${site_name}/public.json" \
      --header 'Content-Type: application/json' \
      --header "x-auth-token: ${AUTH_TOKEN}" \
      --data "{
        \"paths\": {
          \"mappings\": [
            \"/content/${PROJECT_NAME}/${locale//-/\/}/:\/\"
          ],
          \"includes\": [
            \"/content/${PROJECT_NAME}/${locale//-/\/}/\"
          ]
        }
      }" \
      -w "\nHTTP_CODE:%{http_code}"
    
    echo "Completed: ${site_name}"
    echo ""
done
```

**Expected Result:** HTTP_CODE:200 for all sites

## Step 5: Configure AEM Cloud Services

### 5.1 Create AEM Site Configurations

1. **Navigate to AEM Author:**
   - Go to `https://author-p[PROGRAM_ID]-e[ENVIRONMENT_ID].adobeaemcloud.com`
   - Sign in with your credentials

2. **Access Configuration Browser:**
   - Go to **Tools** → **General** → **Configuration Browser**

3. **Create Locale Configurations:**
   - Select your main project configuration
   - Click **Create** for each locale:
     - **Switzerland** (`ch`)
     - **Germany** (`de`)
   - Enable **Cloud Configuration** feature for each

### 5.2 Configure Cloud Services for Each Locale

1. **Navigate to Cloud Services:**
   - Go to **Tools** → **Cloud Services** → **Edge Delivery Services Configuration**

2. **Create Configuration for Each Locale:**

   **For Switzerland German (ch-de):**
   - Create folder: `ue-multitenant-root-ch-de`
   - Create configuration with:
     - **Organization:** `comwrapukreply`
     - **Site Name:** `ue-multitenant-root-ch-de`
     - **Project Type:** `aem.live with repoless config setup`

   **For Switzerland French (ch-fr):**
   - Create folder: `ue-multitenant-root-ch-fr`
   - Create configuration with:
     - **Organization:** `comwrapukreply`
     - **Site Name:** `ue-multitenant-root-ch-fr`
     - **Project Type:** `aem.live with repoless config setup`

   **Repeat for all locales:**
   - `ue-multitenant-root-ch-en`
   - `ue-multitenant-root-de-en`
   - `ue-multitenant-root-de-de`

### 5.3 Assign Configurations to Content Pages

1. **Navigate to Sites Console:**
   - Go to **Navigation** → **Sites**

2. **For Each Locale Page:**
   - Select the locale page (e.g., `/content/ue-multitenant-root/ch/de`)
   - Click **Properties**
   - Go to **Advanced** tab
   - Under **Configuration**, unselect "Inherited from parent"
   - Set **Cloud Configuration** to the corresponding configuration path
   - Click **Save & Close**

## Step 6: Verification and Testing

### 6.1 Verify Edge Delivery Services Sites

Test each site URL:

```bash
# Test all localized sites
sites=(
    "https://main--ue-multitenant-root-ch-de--${GITHUB_ORG}.aem.page"
    "https://main--ue-multitenant-root-ch-fr--${GITHUB_ORG}.aem.page"
    "https://main--ue-multitenant-root-ch-en--${GITHUB_ORG}.aem.page"
    "https://main--ue-multitenant-root-de-en--${GITHUB_ORG}.aem.page"
    "https://main--ue-multitenant-root-de-de--${GITHUB_ORG}.aem.page"
)

for site in "${sites[@]}"; do
    echo "Testing: $site"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$site")
    echo "Status: $response"
    echo ""
done
```

### 6.2 Test Universal Editor

1. **For Each Locale:**
   - Navigate to the AEM page: `/content/ue-multitenant-root/[locale].html`
   - Add `?editor=on` to the URL
   - Verify the Universal Editor loads
   - Test editing content
   - Verify changes publish to Edge Delivery Services

2. **Test Content Publishing:**
   - Make changes in Universal Editor
   - Publish the page
   - Verify changes appear on the corresponding Edge Delivery Services site

### 6.3 Verification Checklist

- [ ] All 5 Edge Delivery Services sites are accessible
- [ ] Universal Editor works for all locales
- [ ] Content changes publish correctly
- [ ] Path mappings work for all locales
- [ ] Cloud configurations are properly assigned
- [ ] Access control is working
- [ ] Each locale uses the correct Edge Delivery Services site

## Troubleshooting

### Common Issues and Solutions

#### 1. HTTP 401/403 Errors
**Problem:** Authentication failures
**Solution:**
- Get fresh auth token from `https://admin.hlx.page/login`
- Verify Technical Account ID is correct
- Check admin email permissions

#### 2. HTTP 404 on Edge Delivery Services Sites
**Problem:** Sites not found
**Solution:**
- Wait 5-10 minutes for site provisioning
- Verify site names match exactly
- Check GitHub organization name is lowercase

#### 3. Universal Editor Not Loading
**Problem:** Editor interface doesn't appear
**Solution:**
- Verify Cloud Service configuration
- Check AEM page permissions
- Ensure `?editor=on` parameter is added

#### 4. Content Not Publishing
**Problem:** Changes don't appear on Edge Delivery Services
**Solution:**
- Verify path mappings are correct
- Check content source URLs
- Ensure pages are published in AEM

#### 5. Configuration Errors
**Problem:** Invalid configuration responses
**Solution:**
- Validate JSON syntax
- Check all required fields are present
- Verify URLs and paths are correct

### Debug Commands

```bash
# Test configuration endpoint
curl -s "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${PROJECT_NAME}.json" | jq .

# Test public configuration
curl -s "https://main--${PROJECT_NAME}--${GITHUB_ORG}.aem.page/config.json" | jq .

# Test site accessibility
curl -I "https://main--${PROJECT_NAME}-ch-de--${GITHUB_ORG}.aem.page"
```

## Best Practices

### 1. Naming Conventions

- **Sites:** Use consistent naming pattern `project-country-language`
- **Configurations:** Match site names exactly
- **Paths:** Use clear locale structure `/country/language/`

### 2. Content Organization

- **Language Masters:** Create master content for translation
- **Live Copies:** Use AEM MSM for content synchronization
- **Assets:** Organize by locale in DAM

### 3. Development Workflow

- **Code Changes:** Test in main site first
- **Content Changes:** Use Universal Editor for each locale
- **Deployment:** Use feature branches for testing

### 4. Performance Optimization

- **Caching:** Configure appropriate cache headers
- **Images:** Optimize for each locale's requirements
- **Scripts:** Minimize locale-specific JavaScript

### 5. Monitoring and Maintenance

- **Regular Testing:** Verify all locales monthly
- **Token Rotation:** Update auth tokens before expiry
- **Content Audits:** Review locale-specific content regularly

## Advanced Configuration

### Custom Domain Setup

For production environments, configure custom domains:

```bash
# Configure custom domain (example)
curl --request POST \
  --url "https://admin.hlx.page/config/${GITHUB_ORG}/sites/${PROJECT_NAME}-ch-de/live.json" \
  --header 'Content-Type: application/json' \
  --header "x-auth-token: ${AUTH_TOKEN}" \
  --data '{
    "host": "ch-de.yoursite.com"
  }'
```

### Language Switcher Integration

Implement language switching functionality:

1. **Create Language Switcher Block**
2. **Configure Locale Detection**
3. **Implement URL Mapping**
4. **Add Navigation Links**

### SEO Configuration

Configure SEO settings for each locale:

- **hreflang tags** for language targeting
- **Locale-specific sitemaps**
- **Regional meta tags**
- **Structured data markup**

## Conclusion

This guide provides a complete setup for multilingual RepoLess configuration with AEM Universal Editor. Following these steps will create a robust, scalable multilingual website architecture that leverages the power of Edge Delivery Services while maintaining centralized code management.

### Key Benefits Achieved

- **Single Codebase:** Shared components and styles
- **Localized Content:** Independent content management per locale
- **Scalable Architecture:** Easy to add new locales
- **Performance:** Fast Edge Delivery Services
- **Author Experience:** Familiar AEM Universal Editor interface

### Next Steps

1. **Content Creation:** Start creating localized content
2. **Language Switcher:** Implement navigation between locales
3. **SEO Optimization:** Configure locale-specific SEO
4. **Performance Monitoring:** Set up analytics and monitoring
5. **Content Governance:** Establish translation workflows

For additional support and advanced configurations, refer to the [AEM Edge Delivery Services documentation](https://www.aem.live/developer/repoless-multisite-manager).

# Gated Content Implementation Guide for AEM Universal Editor with Edge Delivery Services

## Overview

This guide provides step-by-step instructions for implementing gated content (access control) in Adobe Experience Manager (AEM) Universal Editor with Edge Delivery Services. This solution uses edge functions to enforce authentication and authorization while maintaining high performance.

**Target Audience:** Junior developers and AI coding agents  
**Estimated Time:** 4-6 hours  
**Prerequisites Level:** Basic understanding of JavaScript, HTTP, and command line

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Environment Setup](#phase-1-environment-setup)
4. [Phase 2: Configure AEM Headers](#phase-2-configure-aem-headers)
5. [Phase 3: Set Up CloudFlare Worker](#phase-3-set-up-cloudflare-worker)
6. [Phase 4: Create Access Provider](#phase-4-create-access-provider)
7. [Phase 5: Update AEM Blocks](#phase-5-update-aem-blocks)
8. [Phase 6: Testing](#phase-6-testing)
9. [Phase 7: Deployment](#phase-7-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Reference Materials](#reference-materials)

---

## Architecture Overview

### High-Level Flow

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│             │         │                  │         │             │
│   Browser   ├────────►│  Edge Function   ├────────►│     EDS     │
│             │         │  (CloudFlare)    │         │   Content   │
│             │◄────────┤                  │◄────────┤             │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                         │
      │                         │
      │                  ┌──────▼─────────┐
      │                  │                │
      └─────────────────►│     Access     │
                         │    Provider    │
                         │  (Auth/AuthZ)  │
                         └────────────────┘
```

### Components

1. **AEM Edge Delivery Services (EDS)**: Hosts your content and site code
2. **Edge Function (CloudFlare Worker)**: Middleware that checks access permissions
3. **Access Provider**: Authentication and authorization service
4. **Browser**: User's client with cookies for session management

### How It Works

1. User requests a page from your site
2. Request hits the Edge Function first
3. Edge Function checks if the page is protected (via custom headers)
4. If protected, checks user's authentication cookies
5. If authenticated, validates authorization level
6. If authorized, serves content from EDS
7. If not authenticated/authorized, redirects to login or shows 403

---

## Prerequisites

### Required Accounts

- [ ] AEM as a Cloud Service account (2025.4 or later)
- [ ] GitHub account with repository for your AEM project
- [ ] CloudFlare account (free tier is sufficient)
- [ ] Admin access to https://admin.hlx.page

### Required Tools

- [ ] Node.js (v18 or later) - [Download](https://nodejs.org/)
- [ ] npm (comes with Node.js)
- [ ] Git - [Download](https://git-scm.com/)
- [ ] Text editor/IDE (VS Code, Cursor, or similar)
- [ ] Command line terminal
- [ ] cURL (for API testing) or Postman

### Required Knowledge

- [ ] Basic JavaScript (functions, async/await, fetch)
- [ ] Basic command line usage
- [ ] HTTP concepts (headers, cookies, status codes)
- [ ] JSON structure

### Project Information

Before starting, gather this information:

```
Your GitHub Organization: ___________________________
Your AEM Project Name: ___________________________
Your AEM Author URL: ___________________________
Your AEM Program ID: ___________________________
Your AEM Environment ID: ___________________________
Your Domain (for CloudFlare): ___________________________
```

---

## Phase 1: Environment Setup

### Step 1.1: Get Admin API Access Token

**Purpose:** You need an access token to configure your site using the Configuration Service API.

**Instructions:**

1. Open your browser and navigate to:
   ```
   https://admin.hlx.page/login
   ```

2. Click on the `login_adobe` option to authenticate with Adobe IDP

3. You will be redirected to:
   ```
   https://admin.hlx.page/profile
   ```

4. Open browser Developer Tools (F12 or Cmd+Option+I)

5. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)

6. Navigate to **Cookies** → `https://admin.hlx.page`

7. Find the cookie named `auth_token`

8. Copy the **entire value** of the `auth_token` cookie

9. Store this token securely. You'll use it in all API requests as:
   ```bash
   -H 'x-auth-token: YOUR_TOKEN_HERE'
   ```

**Example:**
```bash
# If your token is: hlx_abc123xyz789
# Your header will be:
-H 'x-auth-token: hlx_abc123xyz789'
```

**Security Note:** This token grants admin access to your site configuration. Keep it secure and never commit it to version control.

---

### Step 1.2: Verify Your AEM Project

**Purpose:** Ensure your AEM project is properly set up for repoless configuration.

**Instructions:**

1. Verify your site is using the Configuration Service:
   ```bash
   curl https://main--YOUR_PROJECT--YOUR_ORG.aem.live/config.json
   ```

2. Expected response (should return JSON, not 404):
   ```json
   {
     "version": 1,
     "code": {
       "owner": "your-org",
       "repo": "your-project"
     },
     "content": {
       "source": {
         "url": "https://author-p12345-e67890.adobeaemcloud.com/bin/franklin.delivery/...",
         "type": "markup"
       }
     }
   }
   ```

3. If you get a 404, you need to set up the Configuration Service first. See:
   - [Setting up the configuration service](https://www.aem.live/docs/config-service-setup)
   - [Repoless setup guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/repoless)

---

### Step 1.3: Set Up Local Development Environment

**Purpose:** Prepare your local machine for development and testing.

**Instructions:**

1. Clone your AEM project repository:
   ```bash
   git clone https://github.com/YOUR_ORG/YOUR_PROJECT.git
   cd YOUR_PROJECT
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Install AEM CLI globally (if not already installed):
   ```bash
   npm install -g @adobe/aem-cli
   ```

4. Start local development server:
   ```bash
   aem up
   ```

5. Verify local server is running:
   - Open browser to http://localhost:3000
   - You should see your site content

6. Create a new branch for gated content implementation:
   ```bash
   git checkout -b feature/gated-content
   ```

---

## Phase 2: Configure AEM Headers

### Step 2.1: Plan Your Access Levels

**Purpose:** Define which content requires authentication and what access levels exist.

**Instructions:**

1. Create a file `access-levels-plan.md` in your project root:

```markdown
# Access Levels Plan

## Public Content (No Authentication Required)
- Homepage: /
- About page: /about
- Contact: /contact
- All blog posts: /blog/**

## Member Content (Requires Login)
- Member dashboard: /members/dashboard
- Member resources: /members/resources/**
- Member profile: /members/profile

## Premium Content (Requires Premium Subscription)
- Premium articles: /premium/**
- Exclusive videos: /premium/videos/**
- Premium downloads: /premium/downloads/**

## Admin Content (Requires Admin Role)
- Admin panel: /admin/**
- Analytics: /admin/analytics
```

2. Review this plan with your team/stakeholders

3. Identify the header key and values you'll use:
   - **Recommended:** `x-access-level`
   - **Possible values:** `public`, `member`, `premium`, `admin`

---

### Step 2.2: Configure Headers via Configuration Service

**Purpose:** Set custom HTTP headers that the Edge Function will read to determine access requirements.

**Instructions:**

1. Create a file `headers-config.json` with your access level configuration:

```json
{
  "/**": [
    {
      "key": "x-access-level",
      "value": "public"
    }
  ],
  "/members/**": [
    {
      "key": "x-access-level",
      "value": "member"
    }
  ],
  "/premium/**": [
    {
      "key": "x-access-level",
      "value": "premium"
    }
  ],
  "/admin/**": [
    {
      "key": "x-access-level",
      "value": "admin"
    }
  ]
}
```

2. Upload this configuration using the Configuration Service API:

```bash
curl -X POST https://admin.hlx.page/config/YOUR_ORG/sites/YOUR_PROJECT/headers.json \
  -H 'content-type: application/json' \
  -H 'x-auth-token: YOUR_AUTH_TOKEN' \
  --data @headers-config.json
```

**Important:** Replace `YOUR_ORG`, `YOUR_PROJECT`, and `YOUR_AUTH_TOKEN` with your actual values.

3. Verify the configuration was applied:

```bash
curl https://main--YOUR_PROJECT--YOUR_ORG.aem.page/members/dashboard.html -I
```

4. Look for your custom header in the response:
```
x-access-level: member
```

---

### Step 2.3: Document Header Configuration

**Purpose:** Create documentation for future reference and team members.

**Instructions:**

1. Create `docs/access-control-headers.md`:

```markdown
# Access Control Headers Documentation

## Overview
Our site uses custom HTTP headers to indicate the access level required for each resource.

## Header Details
- **Header Name:** `x-access-level`
- **Configured via:** Configuration Service API
- **Read by:** CloudFlare Worker edge function

## Access Levels

| Value | Description | Required Role |
|-------|-------------|---------------|
| `public` | No authentication required | None |
| `member` | Basic membership required | Logged in user |
| `premium` | Premium subscription required | Premium subscriber |
| `admin` | Administrative access required | Administrator |

## Path Mappings

| Path Pattern | Access Level |
|--------------|--------------|
| `/**` | public |
| `/members/**` | member |
| `/premium/**` | premium |
| `/admin/**` | admin |

## Updating Headers

To update header configuration:

1. Edit `headers-config.json`
2. Run the API command:
   \`\`\`bash
   curl -X POST https://admin.hlx.page/config/YOUR_ORG/sites/YOUR_PROJECT/headers.json \
     -H 'content-type: application/json' \
     -H 'x-auth-token: YOUR_AUTH_TOKEN' \
     --data @headers-config.json
   \`\`\`
3. Clear CDN cache if needed
4. Test the changes

## Testing Headers

Test if headers are applied:
\`\`\`bash
curl https://main--YOUR_PROJECT--YOUR_ORG.aem.page/PATH_TO_TEST -I | grep x-access-level
\`\`\`
```

2. Commit this documentation:
```bash
git add docs/access-control-headers.md headers-config.json
git commit -m "docs: add access control header documentation"
```

---

## Phase 3: Set Up CloudFlare Worker

### Step 3.1: Create CloudFlare Account and Connect Domain

**Purpose:** Set up CloudFlare to host your edge function.

**Instructions:**

1. Go to https://www.cloudflare.com/plans/free/

2. Click "Sign Up" and create a free account

3. Add your domain:
   - Click "Add a Site"
   - Enter your domain (e.g., `example.com`)
   - Select the Free plan
   - Click "Continue"

4. CloudFlare will scan your DNS records

5. Update your domain's nameservers at your registrar to point to CloudFlare's nameservers:
   ```
   Example nameservers (yours will be different):
   - ace.ns.cloudflare.com
   - ben.ns.cloudflare.com
   ```

6. Wait for DNS propagation (can take up to 24 hours, usually much faster)

7. Verify SSL/TLS settings:
   - Go to SSL/TLS → Overview
   - Set to "Full" or "Full (strict)"

**Alternative:** If you don't have a custom domain, you can use CloudFlare Pages for testing.

---

### Step 3.2: Clone and Configure CloudFlare Worker

**Purpose:** Get the worker code and customize it for your project.

**Instructions:**

1. Clone the reference worker implementation:
```bash
cd ~/projects  # or your preferred directory
git clone https://github.com/Ben-Zahler/consumer-worker.git
cd consumer-worker
```

2. Install dependencies:
```bash
npm install
```

3. Open `wrangler.toml` and update the configuration:

```toml
name = "your-project-access-control"  # Must be URL-friendly, no underscores
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "your-project-access-control-prod"
route = "https://yourdomain.com/*"
```

**Important:** 
- The `name` field must be lowercase, alphanumeric, and hyphens only (no underscores)
- Update `route` to match your actual domain

4. Save the file

---

### Step 3.3: Customize Worker Code

**Purpose:** Adapt the worker code to your specific AEM setup and access levels.

**Instructions:**

1. Open `src/index.js` in your editor

2. Update the configuration constants at the top:

```javascript
// Configuration
const CONFIG = {
  // Your EDS domain
  EDS_DOMAIN: 'main--YOUR_PROJECT--YOUR_ORG.aem.live',
  
  // Your production domain (after CloudFlare)
  PRODUCTION_DOMAIN: 'yourdomain.com',
  
  // Access level header name
  ACCESS_HEADER: 'x-access-level',
  
  // Cookie names
  VERIFICATION_COOKIE: 'access_verification',
  USER_DATA_COOKIE: 'user_data',
  
  // Access provider URL (we'll set this up in Phase 4)
  ACCESS_PROVIDER_URL: 'https://YOUR_ACCESS_PROVIDER/verify',
  
  // Cache TTL in seconds
  CACHE_TTL: 3600  // 1 hour
};

// Access level hierarchy (higher number = more access)
const ACCESS_LEVELS = {
  'public': 0,
  'member': 1,
  'premium': 2,
  'admin': 3
};
```

3. Locate the `fetch` handler and understand its structure:

```javascript
export default {
  async fetch(request, env, ctx) {
    try {
      // 1. Try to get response from cache
      let response = await caches.default.match(request.url);
      
      if (!response) {
        // 2. Not in cache - fetch from EDS origin
        response = await fetchFromOrigin(request);
        
        // 3. Cache the response
        ctx.waitUntil(caches.default.put(request.url, response.clone()));
      }
      
      // 4. Check if resource is protected
      if (isResourceProtected(response)) {
        // 5. Verify user has access
        const accessCheck = await verifyAccess(request, response);
        
        if (!accessCheck.authorized) {
          return accessCheck.response;  // Redirect or 403
        }
      }
      
      // 6. Return the response
      return response;
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
```

4. Implement the `fetchFromOrigin` function:

```javascript
/**
 * Fetch content from EDS origin
 */
async function fetchFromOrigin(request) {
  // Clone the request
  const url = new URL(request.url);
  
  // Change hostname to EDS domain
  url.hostname = CONFIG.EDS_DOMAIN;
  
  // Create new request to EDS
  const edsRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });
  
  // Fetch from EDS
  const response = await fetch(edsRequest);
  
  return response;
}
```

5. Implement the `isResourceProtected` function:

```javascript
/**
 * Check if resource requires authentication
 * Reads the x-access-level header set in AEM configuration
 */
function isResourceProtected(response) {
  const accessLevel = response.headers.get(CONFIG.ACCESS_HEADER);
  
  // If no header or explicitly public, not protected
  if (!accessLevel || accessLevel === 'public') {
    return false;
  }
  
  // Any other access level means protected
  return true;
}
```

6. Implement the `verifyAccess` function:

```javascript
/**
 * Verify user has required access level
 */
async function verifyAccess(request, response) {
  // Get required access level from response header
  const requiredLevel = response.headers.get(CONFIG.ACCESS_HEADER);
  
  // Get user cookies
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const verificationToken = cookies[CONFIG.VERIFICATION_COOKIE];
  const userDataStr = cookies[CONFIG.USER_DATA_COOKIE];
  
  // No verification token = not logged in
  if (!verificationToken) {
    return {
      authorized: false,
      response: redirectToLogin(request.url)
    };
  }
  
  // Parse user data
  let userData;
  try {
    userData = JSON.parse(decodeURIComponent(userDataStr));
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return {
      authorized: false,
      response: redirectToLogin(request.url)
    };
  }
  
  // Verify the token with access provider
  const isValid = await verifyToken(verificationToken, userData);
  
  if (!isValid) {
    return {
      authorized: false,
      response: redirectToLogin(request.url)
    };
  }
  
  // Check if user's level is sufficient
  const userLevel = ACCESS_LEVELS[userData.level] || 0;
  const requiredLevelNum = ACCESS_LEVELS[requiredLevel] || 0;
  
  if (userLevel < requiredLevelNum) {
    return {
      authorized: false,
      response: new Response('Forbidden: Insufficient access level', {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store'
        }
      })
    };
  }
  
  // User is authorized
  return {
    authorized: true
  };
}
```

7. Implement helper functions:

```javascript
/**
 * Parse cookies from Cookie header string
 */
function parseCookies(cookieString) {
  const cookies = {};
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = rest.join('=').trim();
  });
  
  return cookies;
}

/**
 * Verify token with access provider
 */
async function verifyToken(token, userData) {
  try {
    const response = await fetch(CONFIG.ACCESS_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verification: token,
        userData: userData
      })
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

/**
 * Redirect to login page
 */
function redirectToLogin(returnUrl) {
  const loginUrl = new URL('/login', CONFIG.PRODUCTION_DOMAIN);
  loginUrl.searchParams.set('returnUrl', returnUrl);
  
  return Response.redirect(loginUrl.toString(), 302);
}
```

8. Save the file

---

### Step 3.4: Test Worker Locally (Optional)

**Purpose:** Test your worker code before deploying to CloudFlare.

**Instructions:**

1. Install Wrangler CLI globally:
```bash
npm install -g wrangler
```

2. Authenticate with CloudFlare:
```bash
wrangler login
```

3. This will open a browser window. Log in and authorize Wrangler

4. Test the worker locally:
```bash
wrangler dev
```

5. Open http://localhost:8787 in your browser

6. Test various scenarios:
   - Public page (should load)
   - Protected page without cookies (should redirect)
   - Protected page with mock cookies (add via DevTools)

7. Press Ctrl+C to stop the local server

---

### Step 3.5: Deploy CloudFlare Worker

**Purpose:** Deploy your worker to CloudFlare's edge network.

**Instructions:**

1. Ensure you're logged in to Wrangler:
```bash
wrangler whoami
```

2. Deploy the worker:
```bash
npm run deploy
```

Or:
```bash
wrangler deploy
```

3. You should see output like:
```
✨ Built successfully!
🌎 Published your-project-access-control to https://your-project-access-control.YOUR-SUBDOMAIN.workers.dev
```

4. Test the deployed worker:
```bash
curl -I https://your-project-access-control.YOUR-SUBDOMAIN.workers.dev
```

5. Verify the worker is running by visiting a public page through the worker URL

---

### Step 3.6: Configure CloudFlare Routes

**Purpose:** Route your custom domain traffic through the worker.

**Instructions:**

1. Go to CloudFlare Dashboard

2. Select your domain

3. Navigate to **Workers & Pages** → **Overview**

4. Click on your worker name

5. Click **Triggers** tab

6. Under **Routes**, click **Add route**

7. Configure the route:
   ```
   Route: *yourdomain.com/*
   Zone: yourdomain.com
   ```

8. Click **Save**

9. Test that requests to your domain now go through the worker:
```bash
curl -I https://yourdomain.com/
```

10. You should see your worker's custom headers or behavior

---

## Phase 4: Create Access Provider

### Step 4.1: Choose Access Provider Platform

**Purpose:** Select a platform to host your authentication/authorization service.

**Options:**

1. **Adobe I/O Runtime** (Recommended for AEM users)
   - Pros: Integrated with Adobe ecosystem, serverless
   - Cons: Requires Adobe I/O account
   - Guide: https://developer.adobe.com/runtime/docs/

2. **AWS Lambda**
   - Pros: Widely used, flexible, generous free tier
   - Cons: More complex setup
   - Guide: https://aws.amazon.com/lambda/

3. **Vercel Functions**
   - Pros: Easy deployment, great DX
   - Cons: Limited execution time on free tier
   - Guide: https://vercel.com/docs/functions

4. **Custom Node.js Server**
   - Pros: Full control
   - Cons: Need to manage hosting
   - Guide: Deploy on any Node.js host

**For this guide, we'll use Adobe I/O Runtime as the example.**

---

### Step 4.2: Set Up Adobe I/O Runtime Project

**Purpose:** Create a serverless action to handle authentication and verification.

**Instructions:**

1. Go to https://developer.adobe.com/console

2. Click "Create new project"

3. Add API:
   - Click "Add API"
   - Select "I/O Management API"
   - Complete the setup

4. Install Adobe I/O CLI:
```bash
npm install -g @adobe/aio-cli
```

5. Log in:
```bash
aio login
```

6. Initialize a new project:
```bash
mkdir access-provider
cd access-provider
aio app init
```

7. Select:
   - Template: `@adobe/generator-app-excshell`
   - Actions: Yes
   - Add default action

---

### Step 4.3: Create Login Action

**Purpose:** Create an endpoint that authenticates users and sets cookies.

**Instructions:**

1. Create file `actions/login/index.js`:

```javascript
const crypto = require('crypto');

/**
 * Authenticate user and set cookies
 * 
 * Input (POST body):
 * {
 *   "email": "user@example.com",
 *   "password": "userpassword"
 * }
 * 
 * Output:
 * - Sets cookies: access_verification, user_data
 * - Returns user info
 */
async function main(params) {
  try {
    const { email, password } = params;
    
    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: {
          error: 'Email and password required'
        }
      };
    }
    
    // IMPORTANT: Replace this with real authentication
    // This is a dummy implementation for demonstration
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return {
        statusCode: 401,
        body: {
          error: 'Invalid credentials'
        }
      };
    }
    
    // Create user data object
    const userData = {
      userId: user.id,
      email: user.email,
      userName: user.name,
      level: user.accessLevel  // 'member', 'premium', 'admin'
    };
    
    // Generate verification token (encrypted user data)
    const verificationToken = encryptData(JSON.stringify(userData));
    
    // Create cookies
    const cookies = [
      // HTTP-only cookie for server-side verification
      `access_verification=${verificationToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      
      // JavaScript-readable cookie for client-side display
      `user_data=${encodeURIComponent(JSON.stringify(userData))}; Path=/; Secure; SameSite=Strict; Max-Age=86400`
    ];
    
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookies,
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        user: {
          email: user.email,
          name: user.name,
          level: user.accessLevel
        }
      }
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    };
  }
}

/**
 * Authenticate user against your user database
 * REPLACE THIS with your actual authentication logic
 */
async function authenticateUser(email, password) {
  // DUMMY IMPLEMENTATION - Replace with real authentication
  // This could connect to:
  // - Your database
  // - LDAP/Active Directory
  // - SSO provider (Okta, Auth0, Azure AD)
  // - Adobe IMS
  
  const dummyUsers = {
    'member@example.com': {
      id: '1',
      email: 'member@example.com',
      name: 'John Member',
      accessLevel: 'member',
      passwordHash: 'hashed_password_1'  // In real app, use bcrypt
    },
    'premium@example.com': {
      id: '2',
      email: 'premium@example.com',
      name: 'Jane Premium',
      accessLevel: 'premium',
      passwordHash: 'hashed_password_2'
    },
    'admin@example.com': {
      id: '3',
      email: 'admin@example.com',
      name: 'Admin User',
      accessLevel: 'admin',
      passwordHash: 'hashed_password_3'
    }
  };
  
  const user = dummyUsers[email];
  
  // In real implementation, use bcrypt.compare()
  if (user && password === 'demo123') {
    return user;
  }
  
  return null;
}

/**
 * Encrypt data for verification token
 */
function encryptData(data) {
  // Get encryption key from environment variable
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  
  // Create cipher
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

exports.main = main;
```

2. Create `actions/login/package.json`:

```json
{
  "name": "login-action",
  "version": "1.0.0",
  "description": "Login action for access control",
  "main": "index.js",
  "dependencies": {}
}
```

---

### Step 4.4: Create Verification Action

**Purpose:** Create an endpoint that verifies authentication tokens.

**Instructions:**

1. Create file `actions/verify/index.js`:

```javascript
const crypto = require('crypto');

/**
 * Verify authentication token
 * Called by CloudFlare Worker to validate user access
 * 
 * Input (POST body):
 * {
 *   "verification": "encrypted_token",
 *   "userData": { user data object }
 * }
 * 
 * Output:
 * - 200 if valid
 * - 400/401 if invalid
 */
async function main(params) {
  try {
    const { verification, userData } = params;
    
    // Validate input
    if (!verification || !userData) {
      return {
        statusCode: 400,
        body: {
          error: 'Verification token and user data required'
        }
      };
    }
    
    // Decrypt verification token
    const decryptedData = decryptData(verification);
    
    if (!decryptedData) {
      return {
        statusCode: 401,
        body: {
          error: 'Invalid verification token'
        }
      };
    }
    
    // Compare decrypted data with provided user data
    const userDataJson = JSON.stringify(userData);
    const decryptedJson = decryptedData.trim();
    
    if (decryptedJson !== userDataJson.trim()) {
      console.error('Token mismatch');
      console.error('Decrypted:', decryptedJson);
      console.error('Provided:', userDataJson);
      
      return {
        statusCode: 401,
        body: {
          error: 'Token verification failed'
        }
      };
    }
    
    // Optionally: Check token expiration, user status, etc.
    // const tokenAge = checkTokenAge(userData.userId);
    // if (tokenAge > MAX_TOKEN_AGE) { return 401; }
    
    // Token is valid
    return {
      statusCode: 200,
      body: {
        valid: true,
        userId: userData.userId,
        level: userData.level
      }
    };
    
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    };
  }
}

/**
 * Decrypt verification token
 */
function decryptData(encryptedData) {
  try {
    // Get encryption key from environment variable
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    
    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      return null;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

exports.main = main;
```

2. Create `actions/verify/package.json`:

```json
{
  "name": "verify-action",
  "version": "1.0.0",
  "description": "Verification action for access control",
  "main": "index.js",
  "dependencies": {}
}
```

---

### Step 4.5: Create Logout Action

**Purpose:** Create an endpoint to log users out by clearing cookies.

**Instructions:**

1. Create file `actions/logout/index.js`:

```javascript
/**
 * Logout user by clearing cookies
 * 
 * Input: None required
 * 
 * Output:
 * - Clears authentication cookies
 * - Returns success message
 */
async function main(params) {
  try {
    // Create expired cookies to clear them
    const cookies = [
      `access_verification=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      `user_data=; Path=/; Secure; SameSite=Strict; Max-Age=0`
    ];
    
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookies,
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        message: 'Logged out successfully'
      }
    };
    
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    };
  }
}

exports.main = main;
```

2. Create `actions/logout/package.json`:

```json
{
  "name": "logout-action",
  "version": "1.0.0",
  "description": "Logout action for access control",
  "main": "index.js",
  "dependencies": {}
}
```

---

### Step 4.6: Deploy Access Provider Actions

**Purpose:** Deploy your authentication actions to Adobe I/O Runtime.

**Instructions:**

1. Set environment variable for encryption key:
```bash
aio runtime action update login --param ENCRYPTION_KEY "your-super-secret-key-min-32-chars-long"
aio runtime action update verify --param ENCRYPTION_KEY "your-super-secret-key-min-32-chars-long"
```

**Important:** Use the SAME encryption key for both actions!

2. Deploy all actions:
```bash
aio app deploy
```

3. Get your action URLs:
```bash
aio runtime action list
```

4. Note the URLs (they'll look like):
```
https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/login
https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/verify
https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/logout
```

5. Test the verify action:
```bash
curl -X POST https://YOUR_RUNTIME_URL/verify \
  -H 'Content-Type: application/json' \
  -d '{
    "verification": "dummy_token",
    "userData": {"userId": "1", "level": "member"}
  }'
```

6. Update your CloudFlare Worker's `CONFIG.ACCESS_PROVIDER_URL` with the verify action URL

---

### Step 4.7: Create Login UI

**Purpose:** Create a simple login page for users.

**Instructions:**

1. In your AEM project, create `blocks/login/login.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <style>
    .login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    label {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    
    input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    button {
      padding: 0.75rem;
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    
    button:hover {
      background-color: #0052a3;
    }
    
    .error-message {
      color: #d32f2f;
      padding: 0.75rem;
      background-color: #ffebee;
      border-radius: 4px;
      display: none;
    }
    
    .demo-credentials {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>Login</h1>
    
    <div class="error-message" id="errorMessage"></div>
    
    <form class="login-form" id="loginForm">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
      </div>
      
      <button type="submit">Login</button>
    </form>
    
    <div class="demo-credentials">
      <strong>Demo Credentials:</strong><br>
      Member: member@example.com / demo123<br>
      Premium: premium@example.com / demo123<br>
      Admin: admin@example.com / demo123
    </div>
  </div>
  
  <script>
    const LOGIN_API_URL = 'YOUR_ACCESS_PROVIDER_LOGIN_URL';
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('errorMessage');
      
      // Hide previous error
      errorMessage.style.display = 'none';
      
      try {
        const response = await fetch(LOGIN_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Get return URL from query parameter
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl') || '/';
          
          // Redirect to return URL
          window.location.href = returnUrl;
        } else {
          // Show error
          errorMessage.textContent = data.error || 'Login failed';
          errorMessage.style.display = 'block';
        }
        
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
      }
    });
  </script>
</body>
</html>
```

2. Create the corresponding block JavaScript `blocks/login/login.js`:

```javascript
export default function decorate(block) {
  // The HTML file will be loaded automatically by EDS
  // This file is for any additional JavaScript logic if needed
  
  // For example, you could add analytics tracking:
  block.querySelector('form')?.addEventListener('submit', () => {
    // Track login attempt
    console.log('Login attempt');
  });
}
```

3. Create `blocks/login/login.css`:

```css
/* Additional styling if needed */
.login {
  /* Block container styles */
}
```

4. Update the `LOGIN_API_URL` in the HTML file with your actual Adobe I/O Runtime login action URL

---

## Phase 5: Update AEM Blocks

### Step 5.1: Create Utility Functions for Cookie Handling

**Purpose:** Create reusable functions to read and manage authentication cookies.

**Instructions:**

1. Create file `scripts/auth-utils.js` in your project:

```javascript
/**
 * Authentication utility functions
 * These functions help blocks interact with the authentication system
 */

/**
 * Cookie names - must match what Access Provider sets
 */
const COOKIE_NAMES = {
  VERIFICATION: 'access_verification',
  USER_DATA: 'user_data'
};

/**
 * Parse cookies from document.cookie string
 * @returns {Object} Object with cookie name-value pairs
 */
function parseCookies() {
  const cookies = {};
  
  document.cookie.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  
  return cookies;
}

/**
 * Get user data from cookie
 * @returns {Object|null} User data object or null if not authenticated
 */
export function getUserData() {
  try {
    const cookies = parseCookies();
    const userDataStr = cookies[COOKIE_NAMES.USER_DATA];
    
    if (!userDataStr) {
      return null;
    }
    
    const userData = JSON.parse(decodeURIComponent(userDataStr));
    return userData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export function isAuthenticated() {
  const userData = getUserData();
  return userData !== null;
}

/**
 * Check if user has required access level
 * @param {string} requiredLevel - Required access level ('member', 'premium', 'admin')
 * @returns {boolean} True if user has sufficient access
 */
export function hasAccessLevel(requiredLevel) {
  const userData = getUserData();
  
  if (!userData) {
    return false;
  }
  
  const levelHierarchy = {
    'public': 0,
    'member': 1,
    'premium': 2,
    'admin': 3
  };
  
  const userLevel = levelHierarchy[userData.level] || 0;
  const requiredLevelNum = levelHierarchy[requiredLevel] || 0;
  
  return userLevel >= requiredLevelNum;
}

/**
 * Get user's display name
 * @returns {string|null} User's name or null
 */
export function getUserName() {
  const userData = getUserData();
  return userData ? userData.userName : null;
}

/**
 * Get user's email
 * @returns {string|null} User's email or null
 */
export function getUserEmail() {
  const userData = getUserData();
  return userData ? userData.email : null;
}

/**
 * Get user's access level
 * @returns {string|null} Access level ('member', 'premium', 'admin') or null
 */
export function getUserLevel() {
  const userData = getUserData();
  return userData ? userData.level : null;
}

/**
 * Logout function (clears cookies and redirects)
 * @param {string} logoutUrl - URL of logout endpoint
 */
export async function logout(logoutUrl = '/api/logout') {
  try {
    await fetch(logoutUrl, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // Even if API call fails, try to redirect
    window.location.href = '/';
  }
}
```

2. Commit the utility file:
```bash
git add scripts/auth-utils.js
git commit -m "feat: add authentication utility functions"
```

---

### Step 5.2: Update Header Block

**Purpose:** Show login status and user info in the header.

**Instructions:**

1. Open or create `blocks/header/header.js`

2. Add authentication-aware code:

```javascript
import { getUserData, logout } from '../../scripts/auth-utils.js';

/**
 * Decorate header block with authentication features
 */
export default function decorate(block) {
  // Get user data
  const userData = getUserData();
  
  // Create auth container
  const authContainer = document.createElement('div');
  authContainer.className = 'header-auth';
  
  if (userData) {
    // User is logged in - show user info and logout
    authContainer.innerHTML = `
      <div class="user-info">
        <span class="user-greeting">Hello, ${userData.userName}!</span>
        <span class="user-level">(${userData.level})</span>
        <button class="logout-button">Sign Out</button>
      </div>
    `;
    
    // Add logout handler
    const logoutButton = authContainer.querySelector('.logout-button');
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout('YOUR_ACCESS_PROVIDER_LOGOUT_URL');
    });
    
  } else {
    // User is not logged in - show login link
    authContainer.innerHTML = `
      <a href="/login" class="login-link">Sign In</a>
    `;
  }
  
  // Add auth container to header
  block.appendChild(authContainer);
  
  // Add any other header decoration logic here
}
```

3. Add styles in `blocks/header/header.css`:

```css
.header-auth {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  font-weight: 600;
}

.user-level {
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.user-level::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

/* Different colors for access levels */
.user-info[data-level="member"] .user-level::before {
  background-color: #4caf50;
}

.user-info[data-level="premium"] .user-level::before {
  background-color: #ff9800;
}

.user-info[data-level="admin"] .user-level::before {
  background-color: #f44336;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.logout-button:hover {
  background-color: #444;
}

.login-link {
  padding: 0.5rem 1rem;
  background-color: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
}

.login-link:hover {
  background-color: #0052a3;
}
```

4. Update the logout URL with your actual Adobe I/O Runtime logout action URL

---

### Step 5.3: Create Access Level Badge Block

**Purpose:** Display the user's current access level on the page.

**Instructions:**

1. Create directory `blocks/access-badge/`

2. Create `blocks/access-badge/access-badge.js`:

```javascript
import { getUserData } from '../../scripts/auth-utils.js';

/**
 * Display user's access level badge
 */
export default function decorate(block) {
  const userData = getUserData();
  
  if (!userData) {
    // Not logged in - show guest badge
    block.innerHTML = `
      <div class="access-badge guest">
        <span class="badge-icon">👤</span>
        <span class="badge-text">Guest</span>
      </div>
    `;
    return;
  }
  
  // Map access levels to icons and colors
  const levelConfig = {
    'member': {
      icon: '⭐',
      label: 'Member',
      class: 'member'
    },
    'premium': {
      icon: '💎',
      label: 'Premium',
      class: 'premium'
    },
    'admin': {
      icon: '👑',
      label: 'Admin',
      class: 'admin'
    }
  };
  
  const config = levelConfig[userData.level] || levelConfig.member;
  
  block.innerHTML = `
    <div class="access-badge ${config.class}">
      <span class="badge-icon">${config.icon}</span>
      <div class="badge-content">
        <span class="badge-label">${config.label}</span>
        <span class="badge-name">${userData.userName}</span>
      </div>
    </div>
  `;
}
```

3. Create `blocks/access-badge/access-badge.css`:

```css
.access-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-icon {
  font-size: 2rem;
}

.badge-content {
  display: flex;
  flex-direction: column;
}

.badge-label {
  font-weight: 700;
  font-size: 1.125rem;
}

.badge-name {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Guest */
.access-badge.guest {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Member */
.access-badge.member {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
}

/* Premium */
.access-badge.premium {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

/* Admin */
.access-badge.admin {
  background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
  color: white;
}
```

---

### Step 5.4: Create Conditional Content Block

**Purpose:** Show/hide content based on user's access level.

**Instructions:**

1. Create directory `blocks/protected-content/`

2. Create `blocks/protected-content/protected-content.js`:

```javascript
import { getUserData, hasAccessLevel } from '../../scripts/auth-utils.js';

/**
 * Protected content block
 * Shows content only if user has required access level
 * 
 * Usage in authoring:
 * | Protected Content (premium) |
 * | This content is for premium users only |
 */
export default function decorate(block) {
  // Get required access level from block class or data attribute
  const blockClasses = block.className.split(' ');
  let requiredLevel = 'member'; // default
  
  // Look for level in class names (e.g., "protected-content-premium")
  blockClasses.forEach(cls => {
    if (cls.startsWith('protected-content-')) {
      const level = cls.replace('protected-content-', '');
      if (['member', 'premium', 'admin'].includes(level)) {
        requiredLevel = level;
      }
    }
  });
  
  // Check if user has access
  const userData = getUserData();
  const hasAccess = hasAccessLevel(requiredLevel);
  
  if (hasAccess) {
    // User has access - show content
    block.classList.add('has-access');
    
    // Add a subtle indicator
    const indicator = document.createElement('div');
    indicator.className = 'access-indicator';
    indicator.textContent = `✓ ${requiredLevel} content`;
    block.prepend(indicator);
    
  } else {
    // User doesn't have access - show upgrade message
    block.classList.add('no-access');
    
    const upgradeMessage = document.createElement('div');
    upgradeMessage.className = 'upgrade-message';
    
    if (userData) {
      // Logged in but insufficient level
      upgradeMessage.innerHTML = `
        <div class="lock-icon">🔒</div>
        <h3>Premium Content</h3>
        <p>This content requires ${requiredLevel} access.</p>
        <p>Your current level: <strong>${userData.level}</strong></p>
        <a href="/upgrade" class="upgrade-button">Upgrade Now</a>
      `;
    } else {
      // Not logged in
      upgradeMessage.innerHTML = `
        <div class="lock-icon">🔒</div>
        <h3>Sign In Required</h3>
        <p>Please sign in to access this content.</p>
        <a href="/login?returnUrl=${encodeURIComponent(window.location.pathname)}" class="login-button">Sign In</a>
      `;
    }
    
    // Replace block content with upgrade message
    block.innerHTML = '';
    block.appendChild(upgradeMessage);
  }
}
```

3. Create `blocks/protected-content/protected-content.css`:

```css
.protected-content {
  position: relative;
  margin: 2rem 0;
}

.access-indicator {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.protected-content.no-access {
  padding: 3rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border: 2px dashed #999;
  border-radius: 8px;
}

.upgrade-message {
  text-align: center;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upgrade-message h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.upgrade-message p {
  margin: 0.5rem 0;
  color: #666;
}

.upgrade-button,
.login-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background-color: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.upgrade-button:hover,
.login-button:hover {
  background-color: #0052a3;
}
```

---

### Step 5.5: Test Blocks Locally

**Purpose:** Verify blocks work correctly before deploying.

**Instructions:**

1. Start local development server:
```bash
aem up
```

2. Open http://localhost:3000

3. Test header block:
   - Should show "Sign In" link when not logged in
   - Should show username and "Sign Out" button when logged in

4. Test with mock cookies in browser DevTools:
   - Open DevTools (F12)
   - Go to Application → Cookies
   - Add cookie manually:
     ```
     Name: user_data
     Value: %7B%22userId%22%3A%221%22%2C%22userName%22%3A%22Test%20User%22%2C%22level%22%3A%22premium%22%7D
     Domain: localhost
     Path: /
     ```
   - Refresh page
   - Header should now show "Hello, Test User!"

5. Test protected content block:
   - Create a test page with the block
   - Verify it shows upgrade message without auth
   - Verify it shows content with auth (use mock cookie)

6. Make adjustments as needed

---

## Phase 6: Testing

### Step 6.1: Create Test Plan

**Purpose:** Systematically test all scenarios.

**Instructions:**

1. Create file `test-plan.md`:

```markdown
# Gated Content Test Plan

## Test Environment
- Test URL: ___________________________
- Test User Credentials: ___________________________

## Test Cases

### TC-1: Public Content Access
**Objective:** Verify public pages are accessible without authentication

**Steps:**
1. Clear all cookies
2. Navigate to homepage (/)
3. Navigate to /about
4. Navigate to /contact

**Expected Results:**
- All pages load successfully
- No login redirect
- Header shows "Sign In" link

**Status:** [ ] Pass [ ] Fail

---

### TC-2: Protected Content - Not Logged In
**Objective:** Verify protected pages redirect to login

**Steps:**
1. Clear all cookies
2. Navigate to /members/dashboard

**Expected Results:**
- Redirected to /login
- Return URL parameter present
- Login form displayed

**Status:** [ ] Pass [ ] Fail

---

### TC-3: Login - Valid Credentials
**Objective:** Verify successful login flow

**Steps:**
1. Navigate to /login
2. Enter valid member credentials
3. Submit form

**Expected Results:**
- Login succeeds
- Cookies are set
- Redirected to return URL or homepage
- Header shows username

**Status:** [ ] Pass [ ] Fail

---

### TC-4: Login - Invalid Credentials
**Objective:** Verify login fails with wrong credentials

**Steps:**
1. Navigate to /login
2. Enter invalid credentials
3. Submit form

**Expected Results:**
- Login fails
- Error message displayed
- No cookies set
- User remains on login page

**Status:** [ ] Pass [ ] Fail

---

### TC-5: Member Content Access
**Objective:** Verify member can access member content

**Steps:**
1. Login as member user
2. Navigate to /members/dashboard

**Expected Results:**
- Page loads successfully
- Content is displayed
- No access denied message

**Status:** [ ] Pass [ ] Fail

---

### TC-6: Premium Content Access - Member User
**Objective:** Verify member cannot access premium content

**Steps:**
1. Login as member user
2. Navigate to /premium/article

**Expected Results:**
- Access denied (403)
- Upgrade message displayed
- Current level shown

**Status:** [ ] Pass [ ] Fail

---

### TC-7: Premium Content Access - Premium User
**Objective:** Verify premium user can access premium content

**Steps:**
1. Login as premium user
2. Navigate to /premium/article

**Expected Results:**
- Page loads successfully
- Content is displayed
- No access denied message

**Status:** [ ] Pass [ ] Fail

---

### TC-8: Logout
**Objective:** Verify logout clears session

**Steps:**
1. Login as any user
2. Click "Sign Out" button
3. Navigate to /members/dashboard

**Expected Results:**
- Cookies are cleared
- Redirected to homepage or login
- Header shows "Sign In" link
- Cannot access protected content

**Status:** [ ] Pass [ ] Fail

---

### TC-9: Token Verification
**Objective:** Verify token validation works

**Steps:**
1. Login as member user
2. Manually modify user_data cookie in DevTools
3. Change level from "member" to "premium"
4. Navigate to /premium/article

**Expected Results:**
- Access denied (tampered cookie detected)
- Token verification fails
- Redirected to login

**Status:** [ ] Pass [ ] Fail

---

### TC-10: Session Expiration
**Objective:** Verify expired sessions are handled

**Steps:**
1. Login as any user
2. Wait for cookie expiration (or manually expire)
3. Navigate to protected content

**Expected Results:**
- Redirected to login
- Session expired message (optional)

**Status:** [ ] Pass [ ] Fail

---

### TC-11: Edge Function Bypass Attempt
**Objective:** Verify direct EDS access is blocked

**Steps:**
1. Clear cookies
2. Try to access content directly via .aem.live URL

**Expected Results:**
- Access depends on your setup
- Ideally should be blocked or redirect

**Status:** [ ] Pass [ ] Fail

---

### TC-12: Performance - Cached Content
**Objective:** Verify caching works for public content

**Steps:**
1. Clear browser cache
2. Load public page
3. Check Network tab for cache headers
4. Reload page

**Expected Results:**
- First load: Cache-Control header set
- Second load: Served from cache
- Fast load times

**Status:** [ ] Pass [ ] Fail

---

### TC-13: Performance - Protected Content
**Objective:** Verify performance for authenticated users

**Steps:**
1. Login as user
2. Navigate to protected content
3. Check Network tab

**Expected Results:**
- Authorization check doesn't significantly slow down load
- Content loads within acceptable time

**Status:** [ ] Pass [ ] Fail

## Test Results Summary

Total Test Cases: 13
Passed: ___
Failed: ___
Pass Rate: ___%

## Issues Found

1. 
2. 
3. 

## Notes

```

2. Run through each test case

3. Document results

---

### Step 6.2: Automated Testing (Optional)

**Purpose:** Create automated tests for critical flows.

**Instructions:**

1. Install Playwright:
```bash
npm install -D @playwright/test
```

2. Create `tests/auth.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://yourdomain.com';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/members/dashboard`);
    await expect(page).toHaveURL(/.*login.*/);
  });
  
  test('should allow login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('#email', 'member@example.com');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Should be redirected away from login
    await expect(page).not.toHaveURL(/.*login.*/);
    
    // Should see user name in header
    await expect(page.locator('.user-greeting')).toContainText('Hello');
  });
  
  test('should deny access to premium content for member user', async ({ page, context }) => {
    // Login as member
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'member@example.com');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Try to access premium content
    await page.goto(`${BASE_URL}/premium/article`);
    
    // Should see access denied message
    await expect(page.locator('.upgrade-message')).toBeVisible();
  });
  
  test('should allow access to premium content for premium user', async ({ page }) => {
    // Login as premium
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'premium@example.com');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Access premium content
    await page.goto(`${BASE_URL}/premium/article`);
    
    // Should see content, not upgrade message
    await expect(page.locator('.upgrade-message')).not.toBeVisible();
  });
  
  test('should logout successfully', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'member@example.com');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Logout
    await page.click('.logout-button');
    await page.waitForNavigation();
    
    // Should see login link
    await expect(page.locator('.login-link')).toBeVisible();
    
    // Cookies should be cleared
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'user_data');
    expect(authCookie).toBeUndefined();
  });
});
```

3. Run tests:
```bash
npx playwright test
```

---

### Step 6.3: Security Testing

**Purpose:** Verify security measures are working.

**Instructions:**

1. **Test Cookie Tampering:**
   - Login with a member account
   - Open DevTools → Application → Cookies
   - Modify the `user_data` cookie to change level to "admin"
   - Try to access admin content
   - **Expected:** Should be denied (verification fails)

2. **Test Token Expiration:**
   - Login
   - Manually set cookie expiration to past date
   - Try to access protected content
   - **Expected:** Should redirect to login

3. **Test Direct Origin Access:**
   - Try accessing content directly from .aem.live domain
   - Bypass CloudFlare Worker
   - **Expected:** Depends on your setup, ideally should fail

4. **Test XSS Protection:**
   - Try injecting JavaScript in user data
   - Verify it doesn't execute
   - **Expected:** Data is properly escaped/sanitized

5. **Test HTTPS:**
   - Verify all cookies have `Secure` flag
   - Verify site uses HTTPS
   - **Expected:** No mixed content warnings

6. Document findings in `security-test-results.md`

---

## Phase 7: Deployment

### Step 7.1: Pre-Deployment Checklist

**Purpose:** Ensure everything is ready for production.

**Instructions:**

Review this checklist:

- [ ] All test cases pass
- [ ] Security tests pass
- [ ] Performance is acceptable
- [ ] Encryption key is strong and secure (min 32 characters)
- [ ] Same encryption key used in both login and verify actions
- [ ] Access Provider URLs are correct in CloudFlare Worker
- [ ] CloudFlare Worker is deployed and tested
- [ ] Headers configuration is applied
- [ ] Login/logout pages work
- [ ] All blocks display correctly
- [ ] Documentation is complete
- [ ] Team has been trained
- [ ] Rollback plan is ready
- [ ] Monitoring is set up

---

### Step 7.2: Deploy to Production

**Purpose:** Deploy all components to production environment.

**Instructions:**

1. **Deploy AEM Changes:**
```bash
# Ensure you're on main branch
git checkout main

# Merge your feature branch
git merge feature/gated-content

# Push to GitHub
git push origin main

# Wait for AEM Code Sync to deploy
# Monitor at https://main--YOUR_PROJECT--YOUR_ORG.aem.page
```

2. **Verify Headers Configuration:**
```bash
curl -I https://main--YOUR_PROJECT--YOUR_ORG.aem.live/members/dashboard | grep x-access-level
```

3. **Verify CloudFlare Worker:**
```bash
# Check worker is active
curl -I https://yourdomain.com/

# Should see worker's custom headers or behavior
```

4. **Verify Access Provider:**
```bash
# Test verify endpoint
curl -X POST https://YOUR_RUNTIME_URL/verify \
  -H 'Content-Type: application/json' \
  -d '{"verification":"test","userData":{}}'

# Should return 401 (invalid token is expected)
```

5. **Smoke Test in Production:**
   - Visit homepage (should work)
   - Try protected content (should redirect to login)
   - Login with test account (should work)
   - Access member content (should work)
   - Try premium content with member account (should be denied)
   - Logout (should work)

---

### Step 7.3: Set Up Monitoring

**Purpose:** Monitor the system for issues.

**Instructions:**

1. **CloudFlare Analytics:**
   - Go to CloudFlare Dashboard
   - Navigate to Analytics & Logs
   - Monitor:
     - Request volume
     - Error rates
     - Cache hit ratio
     - Worker CPU time

2. **Adobe I/O Runtime Logs:**
```bash
# View action logs
aio runtime action get login --last

# Monitor activations
aio runtime activation list
```

3. **Set Up Alerts:**
   - Configure CloudFlare alerts for:
     - High error rate (>5%)
     - High latency (>2s)
     - Worker errors
   
   - Configure Adobe I/O alerts for:
     - Action failures
     - High execution time

4. **Create Monitoring Dashboard:**
   - Use your preferred tool (Datadog, Grafana, etc.)
   - Track:
     - Login success rate
     - Authorization failures
     - Page load times
     - User sessions

---

### Step 7.4: Post-Deployment Verification

**Purpose:** Confirm everything works in production.

**Instructions:**

1. **Run Full Test Suite:**
   - Execute all test cases from test plan
   - Document results

2. **Monitor for 24 Hours:**
   - Check logs every 4 hours
   - Look for errors or unusual patterns
   - Monitor user feedback

3. **Gather Metrics:**
   - Login success rate: ____%
   - Average page load time: ____ms
   - Cache hit rate: ____%
   - Error rate: ____%

4. **User Acceptance Testing:**
   - Have stakeholders test the system
   - Gather feedback
   - Make minor adjustments if needed

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Headers Not Applied

**Symptoms:**
- `x-access-level` header not present on responses
- All content treated as public

**Solutions:**
1. Verify headers configuration:
   ```bash
   curl https://main--YOUR_PROJECT--YOUR_ORG.aem.live/config.json
   ```
2. Check if headers.json was applied correctly
3. Wait 5-10 minutes for propagation
4. Clear CDN cache

---

#### Issue 2: Login Fails

**Symptoms:**
- Login form submits but returns error
- Cookies not set

**Solutions:**
1. Check Access Provider logs:
   ```bash
   aio runtime activation list
   aio runtime activation logs ACTIVATION_ID
   ```
2. Verify CORS headers allow your domain
3. Check encryption key is set correctly
4. Test Access Provider directly with cURL
5. Verify cookie domain matches your site domain

---

#### Issue 3: Token Verification Fails

**Symptoms:**
- User logs in but still redirected to login
- "Invalid token" errors in logs

**Solutions:**
1. **Most Common:** Encryption keys don't match
   - Verify same key used in login and verify actions
   - Check for extra spaces or line breaks in key
   
2. Check token format in cookies:
   ```javascript
   // In browser console
   document.cookie
   ```

3. Test verification endpoint manually:
   ```bash
   curl -X POST YOUR_VERIFY_URL \
     -H 'Content-Type: application/json' \
     -d '{"verification":"TOKEN","userData":{...}}'
   ```

4. Check for cookie tampering/corruption

---

#### Issue 4: CloudFlare Worker Not Running

**Symptoms:**
- Content loads but no access control
- Headers from EDS, not worker

**Solutions:**
1. Check worker deployment:
   ```bash
   wrangler deployments list
   ```

2. Verify routes are configured:
   - Go to CloudFlare Dashboard
   - Workers & Pages → Your Worker → Triggers
   - Ensure route matches your domain

3. Check worker code for errors:
   ```bash
   wrangler tail
   ```

4. Verify domain is on CloudFlare

---

#### Issue 5: Infinite Redirect Loop

**Symptoms:**
- Browser shows "Too many redirects"
- User cannot access any page

**Solutions:**
1. Check for redirect conflicts in worker code
2. Verify login page is marked as public
3. Check return URL parameter handling
4. Clear browser cookies and cache
5. Add debugging to worker:
   ```javascript
   console.log('Checking access for:', request.url);
   ```

---

#### Issue 6: Blocks Not Showing User Data

**Symptoms:**
- Header shows "Sign In" even when logged in
- User name not displayed

**Solutions:**
1. Check cookies are set:
   ```javascript
   // Browser console
   document.cookie
   ```

2. Verify cookie names match:
   - In auth-utils.js
   - In Access Provider
   - In CloudFlare Worker

3. Check cookie domain and path
4. Verify cookie is not HTTP-only when it should be readable

---

#### Issue 7: Performance Issues

**Symptoms:**
- Slow page loads
- High CloudFlare Worker CPU time
- Timeout errors

**Solutions:**
1. Enable caching in worker:
   - Cache responses from EDS
   - Set appropriate TTL

2. Optimize verification:
   - Reduce external API calls
   - Cache verification results (carefully!)

3. Check CloudFlare Worker limits:
   - CPU time per request
   - Number of subrequests

4. Consider edge caching strategies

---

#### Issue 8: CORS Errors

**Symptoms:**
- "CORS policy" errors in browser console
- API calls from login form fail

**Solutions:**
1. Add CORS headers to Access Provider responses:
   ```javascript
   headers: {
     'Access-Control-Allow-Origin': 'https://yourdomain.com',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type',
     'Access-Control-Allow-Credentials': 'true'
   }
   ```

2. Handle OPTIONS preflight requests

3. Verify origin matches exactly (no trailing slash differences)

---

### Debug Mode

Add this to your worker for detailed logging:

```javascript
const DEBUG = true; // Set to false in production

function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
  }
}

// Use throughout worker:
debugLog('Request received', { url: request.url });
debugLog('User data', userData);
debugLog('Access check result', { authorized: true });
```

View logs:
```bash
wrangler tail
```

---

## Reference Materials

### API Endpoints Summary

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| /api/login | POST | Authenticate user | `{email, password}` | Sets cookies, returns user info |
| /api/verify | POST | Verify token | `{verification, userData}` | 200 if valid, 401 if invalid |
| /api/logout | POST | Clear session | None | Clears cookies |

### Cookie Reference

| Cookie Name | Type | Content | Purpose |
|-------------|------|---------|---------|
| access_verification | HTTP-Only | Encrypted token | Server-side verification |
| user_data | JavaScript | JSON user info | Client-side display |

### Access Level Hierarchy

```
public (0)
  ↓
member (1)
  ↓
premium (2)
  ↓
admin (3)
```

Higher levels inherit access from lower levels.

### Configuration Files Checklist

- [ ] `headers-config.json` - Access level headers
- [ ] `access-levels-plan.md` - Access level documentation
- [ ] `test-plan.md` - Testing checklist
- [ ] `docs/access-control-headers.md` - Header documentation
- [ ] `scripts/auth-utils.js` - Utility functions
- [ ] `blocks/login/` - Login block
- [ ] `blocks/header/` - Header with auth
- [ ] `blocks/access-badge/` - Access level badge
- [ ] `blocks/protected-content/` - Conditional content
- [ ] `actions/login/index.js` - Login action
- [ ] `actions/verify/index.js` - Verify action
- [ ] `actions/logout/index.js` - Logout action

### Key URLs

- Configuration Service: https://admin.hlx.page
- CloudFlare Dashboard: https://dash.cloudflare.com
- Adobe I/O Console: https://developer.adobe.com/console
- AEM Admin: https://admin.hlx.page/profile
- Your EDS Preview: https://main--PROJECT--ORG.aem.page
- Your EDS Live: https://main--PROJECT--ORG.aem.live

### Useful Commands

```bash
# Get auth token
# Visit https://admin.hlx.page/profile
# Copy auth_token cookie value

# Update headers
curl -X POST https://admin.hlx.page/config/ORG/sites/PROJECT/headers.json \
  -H 'content-type: application/json' \
  -H 'x-auth-token: TOKEN' \
  --data @headers-config.json

# Deploy CloudFlare Worker
wrangler deploy

# View worker logs
wrangler tail

# Deploy Adobe I/O Runtime actions
aio app deploy

# View action logs
aio runtime activation list
aio runtime activation logs ACTIVATION_ID

# Test local AEM
aem up

# Run Playwright tests
npx playwright test
```

### Security Best Practices

1. **Encryption Keys:**
   - Minimum 32 characters
   - Use random, strong keys
   - Store securely (environment variables)
   - Rotate regularly

2. **Cookies:**
   - Always use `Secure` flag (HTTPS only)
   - Use `HttpOnly` for verification cookies
   - Use `SameSite=Strict` to prevent CSRF
   - Set appropriate expiration times

3. **Token Management:**
   - Verify tokens on every request
   - Don't trust client-side data alone
   - Implement token expiration
   - Consider token refresh mechanism

4. **Error Handling:**
   - Don't expose sensitive error details
   - Log errors server-side
   - Show generic messages to users
   - Monitor error patterns

### Performance Optimization

1. **Caching Strategy:**
   - Cache public content aggressively
   - Use short cache for authenticated content
   - Implement proper cache invalidation
   - Monitor cache hit rates

2. **Edge Function Optimization:**
   - Minimize external API calls
   - Use async operations
   - Optimize cryptographic operations
   - Monitor CPU time

3. **Content Delivery:**
   - Use CDN effectively
   - Optimize asset loading
   - Implement lazy loading
   - Monitor Core Web Vitals

### Support and Resources

- **AEM Edge Delivery Docs:** https://www.aem.live/docs/
- **CloudFlare Workers Docs:** https://developers.cloudflare.com/workers/
- **Adobe I/O Runtime Docs:** https://developer.adobe.com/runtime/docs/
- **Configuration Service:** https://www.aem.live/docs/config-service-setup
- **Repoless Setup:** https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/repoless
- https://www.hitthecode.com/gated-access-aem-eds
- **Github https://github.com/Ben-Zahler/consumer-worker
- **Github https://github.com/zagi25/adaptto



### Glossary

- **EDS:** Edge Delivery Services
- **Edge Function:** Serverless function running at CDN edge
- **Access Level:** Permission tier (public, member, premium, admin)
- **Verification Token:** Encrypted cookie for server-side auth
- **User Data Cookie:** Client-readable cookie with user info
- **Configuration Service:** AEM API for site configuration
- **Repoless:** Multi-site setup sharing code repository

---

## Appendix: Complete Code Reference

### A1. Full CloudFlare Worker Code

See separate file: `cloudflare-worker-complete.js`

### A2. Full Access Provider Code

See separate files:
- `access-provider-login.js`
- `access-provider-verify.js`
- `access-provider-logout.js`

### A3. All Block Implementations

See `blocks/` directory for complete implementations

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-XX | Initial guide created | Your Name |
|     |            |                       |           |

---

## Feedback and Improvements

Have suggestions for improving this guide? Please:
1. Open an issue in the project repository
2. Submit a pull request with improvements
3. Contact the development team

---

**End of Guide**

Remember: Security is paramount. Always follow security best practices, keep your encryption keys secret, and regularly update your dependencies.

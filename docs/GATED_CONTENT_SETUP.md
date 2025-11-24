# Gated Content Setup Guide for ue-multitenant-root

## Overview

This document provides step-by-step instructions for implementing and configuring gated content (access control) in the ue-multitenant-root project.

## Architecture

The gated content system consists of:

1. **Authentication Utilities** (`scripts/auth-utils.js`) - Client-side authentication helpers
2. **Access Control Blocks** - Login, access-badge, and protected-content blocks
3. **Enhanced Header** - Updated header with authentication UI
4. **Access Provider** - Serverless functions for authentication (login, verify, logout)
5. **CloudFlare Worker** - Edge function for access control enforcement
6. **Configuration** - Headers configuration for access levels

## File Structure

```
ue-multitenant-root/
├── scripts/
│   └── auth-utils.js                    # Authentication utility functions
├── blocks/
│   ├── login/                           # Login block
│   │   ├── _login.json
│   │   ├── login.js
│   │   └── login.css
│   ├── access-badge/                    # Access badge block
│   │   ├── _access-badge.json
│   │   ├── access-badge.js
│   │   └── access-badge.css
│   ├── protected-content/               # Protected content block
│   │   ├── _protected-content.json
│   │   ├── protected-content.js
│   │   └── protected-content.css
│   └── header/                          # Updated header
│       ├── header.js
│       └── header.css
├── access-provider/                     # Adobe I/O Runtime actions
│   ├── login/
│   │   ├── index.js
│   │   └── package.json
│   ├── verify/
│   │   ├── index.js
│   │   └── package.json
│   └── logout/
│       ├── index.js
│       └── package.json
├── cloudflare-worker/                   # CloudFlare Worker
│   ├── src/
│   │   └── index.js
│   ├── wrangler.toml
│   └── package.json
├── headers-config.json                  # Access level headers configuration
└── access-levels-plan.md               # Access levels documentation
```

## Setup Instructions

### Phase 1: Prepare Project Configuration

#### Step 1.1: Review Access Levels

Review the `access-levels-plan.md` file to understand the access level structure:

- **public** (0) - No authentication required
- **member** (1) - Basic membership required
- **premium** (2) - Premium subscription required
- **admin** (3) - Administrative access required

#### Step 1.2: Update Component Definitions

Run the build command to update component definitions:

```bash
npm run build:json
```

This will merge the block definitions from:
- `blocks/login/_login.json`
- `blocks/access-badge/_access-badge.json`
- `blocks/protected-content/_protected-content.json`

### Phase 2: Configure Access Level Headers

#### Step 2.1: Get Admin API Access Token

1. Navigate to: https://admin.hlx.page/login
2. Click `login_adobe` to authenticate
3. Open browser DevTools (F12)
4. Go to Application → Cookies → https://admin.hlx.page
5. Copy the value of the `auth_token` cookie
6. Store this token securely

#### Step 2.2: Upload Headers Configuration

Upload the headers configuration using the Configuration Service API:

```bash
curl -X POST https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/headers.json \
  -H 'content-type: application/json' \
  -H 'x-auth-token: YOUR_AUTH_TOKEN' \
  --data @headers-config.json
```

Replace `YOUR_AUTH_TOKEN` with your actual token.

#### Step 2.3: Verify Headers Configuration

Test if headers are applied:

```bash
curl -I https://main--ue-multitenant-root--ComwrapUkReply.aem.live/members/dashboard
```

Look for the `x-access-level: member` header in the response.

### Phase 3: Deploy Access Provider

#### Step 3.1: Set Up Adobe I/O Runtime

1. Install Adobe I/O CLI:
   ```bash
   npm install -g @adobe/aio-cli
   ```

2. Log in:
   ```bash
   aio login
   ```

3. Navigate to the access provider directory:
   ```bash
   cd access-provider
   ```

#### Step 3.2: Set Encryption Key

Set the same encryption key for all actions:

```bash
export ENCRYPTION_KEY="your-super-secret-key-min-32-chars-long"
```

**IMPORTANT**: Use a strong, random encryption key (minimum 32 characters).

#### Step 3.3: Deploy Actions

Deploy all three actions:

```bash
cd login
aio runtime action create login index.js --param ENCRYPTION_KEY "$ENCRYPTION_KEY"

cd ../verify
aio runtime action create verify index.js --param ENCRYPTION_KEY "$ENCRYPTION_KEY"

cd ../logout
aio runtime action create logout index.js
```

#### Step 3.4: Get Action URLs

List your actions to get their URLs:

```bash
aio runtime action list
```

Note the URLs for:
- Login: `https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/login`
- Verify: `https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/verify`
- Logout: `https://NAMESPACE.adobeioruntime.net/api/v1/web/YOUR_PACKAGE/logout`

### Phase 4: Deploy CloudFlare Worker

#### Step 4.1: Update Worker Configuration

Edit `cloudflare-worker/wrangler.toml`:

```toml
name = "ue-multitenant-access-control"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "ue-multitenant-access-control-prod"
route = "https://yourdomain.com/*"
```

Update `cloudflare-worker/src/index.js`:

```javascript
const CONFIG = {
  EDS_DOMAIN: 'main--ue-multitenant-root--ComwrapUkReply.aem.live',
  PRODUCTION_DOMAIN: 'yourdomain.com',
  ACCESS_HEADER: 'x-access-level',
  VERIFICATION_COOKIE: 'access_verification',
  USER_DATA_COOKIE: 'user_data',
  ACCESS_PROVIDER_URL: 'YOUR_VERIFY_ACTION_URL', // From Phase 3
  CACHE_TTL: 3600,
};
```

#### Step 4.2: Install Dependencies

```bash
cd cloudflare-worker
npm install
```

#### Step 4.3: Deploy Worker

```bash
npm install -g wrangler
wrangler login
npm run deploy
```

#### Step 4.4: Configure CloudFlare Routes

1. Go to CloudFlare Dashboard
2. Select your domain
3. Navigate to Workers & Pages → Overview
4. Click on your worker name
5. Click Triggers tab
6. Under Routes, click Add route
7. Configure:
   - Route: `*yourdomain.com/*`
   - Zone: `yourdomain.com`
8. Click Save

### Phase 5: Update Block Configuration

#### Step 5.1: Update Login Block API URL

In Universal Editor, update the login block's API URL field with your login action URL from Phase 3.

#### Step 5.2: Update Header Logout URL

Edit `blocks/header/header.js` and update the logout URL:

```javascript
await logout('YOUR_LOGOUT_ACTION_URL');
```

### Phase 6: Testing

#### Step 6.1: Test Public Content

```bash
curl -I https://yourdomain.com/
```

Expected: Page loads without redirect.

#### Step 6.2: Test Protected Content

```bash
curl -I https://yourdomain.com/members/dashboard
```

Expected: Redirect to `/login?returnUrl=/members/dashboard`.

#### Step 6.3: Test Login Flow

1. Navigate to `/login`
2. Enter demo credentials:
   - Member: `member@example.com` / `demo123`
   - Premium: `premium@example.com` / `demo123`
   - Admin: `admin@example.com` / `demo123`
3. Click Sign In
4. Verify redirect to dashboard
5. Check cookies in DevTools:
   - `access_verification` (HTTP-only)
   - `user_data` (readable)

#### Step 6.4: Test Access Control

1. Log in as member user
2. Try to access `/premium/content`
3. Expected: Access denied (403) with upgrade message

#### Step 6.5: Test Logout

1. Click "Sign Out" in header
2. Expected: Cookies cleared, redirect to homepage
3. Try to access `/members/dashboard`
4. Expected: Redirect to login

## Security Considerations

### Encryption Key

- Use a strong, random encryption key (minimum 32 characters)
- Store in environment variables, never in code
- Use the same key for both login and verify actions
- Rotate keys regularly

### Cookies

- `access_verification`: HTTP-only, Secure, SameSite=Strict
- `user_data`: Secure, SameSite=Strict (readable by JavaScript)
- Max-Age: 86400 seconds (24 hours)

### HTTPS

- All traffic must use HTTPS
- CloudFlare SSL/TLS mode: Full or Full (strict)
- No mixed content

## Troubleshooting

### Headers Not Applied

**Problem**: `x-access-level` header not present on responses.

**Solution**:
1. Verify headers.json was uploaded correctly
2. Wait 5-10 minutes for propagation
3. Clear CDN cache
4. Check configuration:
   ```bash
   curl https://main--ue-multitenant-root--ComwrapUkReply.aem.live/config.json
   ```

### Login Fails

**Problem**: Login form submits but returns error.

**Solution**:
1. Check Access Provider logs:
   ```bash
   aio runtime activation list
   aio runtime activation logs ACTIVATION_ID
   ```
2. Verify CORS headers allow your domain
3. Check encryption key is set correctly
4. Test Access Provider directly with cURL

### Token Verification Fails

**Problem**: User logs in but still redirected to login.

**Solution**:
1. Verify same encryption key in both login and verify actions
2. Check for extra spaces or line breaks in key
3. Test verification endpoint manually
4. Check cookie domain matches site domain

### CloudFlare Worker Not Running

**Problem**: Content loads but no access control.

**Solution**:
1. Check worker deployment:
   ```bash
   wrangler deployments list
   ```
2. Verify routes are configured in CloudFlare Dashboard
3. Check worker logs:
   ```bash
   wrangler tail
   ```

## Monitoring

### CloudFlare Analytics

Monitor in CloudFlare Dashboard → Analytics & Logs:
- Request volume
- Error rates
- Cache hit ratio
- Worker CPU time

### Adobe I/O Runtime Logs

```bash
# View action logs
aio runtime action get login --last

# Monitor activations
aio runtime activation list
```

## Next Steps

1. **Replace Demo Authentication**: Update `access-provider/login/index.js` with real authentication (database, LDAP, SSO)
2. **Add User Management**: Create pages for user profile, upgrade, etc.
3. **Implement Token Refresh**: Add token refresh mechanism for long sessions
4. **Add Analytics**: Track login attempts, access denials, upgrades
5. **Create Admin Panel**: Build admin interface for user management

## Support

For issues or questions:
- Check the troubleshooting section
- Review Adobe I/O Runtime logs
- Check CloudFlare Worker logs
- Contact: s.sznajder@reply.com

## References

- [Original Guide](.guides/gated-content-guide.md)
- [Access Levels Plan](../access-levels-plan.md)
- [AEM Edge Delivery Docs](https://www.aem.live/docs/)
- [CloudFlare Workers Docs](https://developers.cloudflare.com/workers/)
- [Adobe I/O Runtime Docs](https://developer.adobe.com/runtime/docs/)


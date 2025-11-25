# Deploy Access Provider Actions - Step 3.3 Guide

## Current Issue

The Adobe I/O Runtime CLI requires proper authentication. Let's fix this step by step.

## Step 1: Verify Authentication

First, let's check if you're properly authenticated:

```bash
# Check authentication status
aio runtime property get

# If whisk auth is empty, you need to authenticate
```

## Step 2: Authenticate with Adobe I/O

If authentication is missing, run:

```bash
# Login to Adobe I/O
aio login

# Follow the prompts:
# 1. Select your organization
# 2. Authorize the CLI
# 3. Complete the authentication flow
```

## Step 3: Set Up Runtime Namespace

After logging in, you need to configure your runtime namespace:

```bash
# List available namespaces
aio runtime namespace list

# Set your namespace (replace with your actual namespace)
aio runtime property set --namespace YOUR_NAMESPACE
```

## Step 4: Deploy Actions

Once authenticated, deploy the actions:

### Option A: Deploy as Web Actions (Recommended)

Web actions can be called via HTTP:

```bash
cd access-provider

# Deploy login action
cd login
aio runtime action create gated-content/login index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy verify action
cd ../verify
aio runtime action create gated-content/verify index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy logout action
cd ../logout
aio runtime action create gated-content/logout index.js \
  --web true \
  --kind nodejs:20
```

### Option B: Deploy as Regular Actions

If web actions don't work, try regular actions:

```bash
cd access-provider

# Deploy login action
cd login
aio runtime action create gated-content/login index.js \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy verify action
cd ../verify
aio runtime action create gated-content/verify index.js \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy logout action
cd ../logout
aio runtime action create gated-content/logout index.js \
  --kind nodejs:20
```

## Step 5: Get Action URLs

After deployment, get the action URLs:

```bash
# List all actions
aio runtime action list

# Get specific action URL
aio runtime action get gated-content/login --url
aio runtime action get gated-content/verify --url
aio runtime action get gated-content/logout --url
```

The URLs will look like:
```
https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/login
https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/verify
https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/logout
```

## Alternative: Using Adobe App Builder

If you're using Adobe App Builder, you might need to:

1. Create an `app.config.yaml` file in the project root
2. Use `aio app deploy` instead

Let me know if you'd like help setting up App Builder configuration.

## Troubleshooting

### Error: "An AUTH key must be specified"

**Solution:**
1. Run `aio login` to authenticate
2. Verify with `aio runtime property get`
3. Check that `whisk auth` is not empty

### Error: "Namespace not found"

**Solution:**
1. List namespaces: `aio runtime namespace list`
2. Set namespace: `aio runtime property set --namespace YOUR_NAMESPACE`
3. Verify: `aio runtime property get`

### Error: "Action already exists"

**Solution:**
```bash
# Update existing action
aio runtime action update gated-content/login index.js \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY"

# Or delete and recreate
aio runtime action delete gated-content/login
aio runtime action create gated-content/login index.js \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY"
```

## Next Steps

After successful deployment:

1. ✅ Note the action URLs
2. ✅ Update CloudFlare Worker config with verify URL
3. ✅ Update login block with login URL
4. ✅ Update header with logout URL
5. ✅ Test the endpoints

## Quick Test

Test your deployed actions:

```bash
# Test login (replace URL with your actual URL)
curl -X POST https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"demo123"}'
```

Expected: JSON response with user data and cookies.


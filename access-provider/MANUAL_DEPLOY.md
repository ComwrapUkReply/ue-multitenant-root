# Manual Deployment Guide

Since automatic namespace configuration isn't working, here's how to deploy manually.

## Step 1: Get Your Runtime Auth Key

You need a Runtime API key. Get it from:

1. **Adobe Console**: https://console.adobe.io/
2. Navigate to: **Runtime** → **API Keys**
3. Generate or copy your API key

OR

The auth key format is: `NAMESPACE:AUTH_KEY`

## Step 2: Set Auth Key

```bash
export WSK_AUTH="your-namespace:your-auth-key"
```

Or set it in the CLI:
```bash
aio runtime property set --auth "your-namespace:your-auth-key"
```

## Step 3: Deploy Actions Manually

```bash
cd access-provider

# Set encryption key
export ENCRYPTION_KEY="tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q="

# Create package
aio runtime package create gated-content

# Deploy login
cd login
aio runtime action create gated-content/login index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy verify
cd ../verify
aio runtime action create gated-content/verify index.js \
  --web true \
  --param ENCRYPTION_KEY "$ENCRYPTION_KEY" \
  --kind nodejs:20

# Deploy logout
cd ../logout
aio runtime action create gated-content/logout index.js \
  --web true \
  --kind nodejs:20
```

## Alternative: Use Adobe App Builder

If you're using App Builder, create `app.config.yaml`:

```yaml
application:
  name: gated-content
  version: 1.0.0

runtime:
  manifest:
    packages:
      gated-content:
        actions:
          login:
            function: access-provider/login/index.js
            web: 'yes'
            runtime: 'nodejs:20'
            inputs:
              ENCRYPTION_KEY: $ENCRYPTION_KEY
          verify:
            function: access-provider/verify/index.js
            web: 'yes'
            runtime: 'nodejs:20'
            inputs:
              ENCRYPTION_KEY: $ENCRYPTION_KEY
          logout:
            function: access-provider/logout/index.js
            web: 'yes'
            runtime: 'nodejs:20'
```

Then deploy:
```bash
aio app deploy
```

## Getting Help

If you're still having issues:
1. Check Adobe Console for Runtime API keys
2. Contact your organization admin for Runtime access
3. Verify Runtime is enabled in your Adobe organization


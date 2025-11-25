# Quick Start: Deploy Access Provider

## The Problem

You've run `aio login` successfully, but Runtime needs a separate namespace configuration.

## Solution: Get Your Namespace

### Method 1: From Adobe Console (Recommended)

1. **Go to Adobe Console**: https://console.adobe.io/
2. **Navigate to Runtime**:
   - Click on your project/organization
   - Look for "Runtime" or "I/O Runtime" in the left menu
   - Your namespace will be displayed (e.g., `your-org-name` or `comwrapukreply`)

### Method 2: Try Common Namespace Formats

Your namespace might be:
- Your organization name (lowercase, no spaces)
- Your Adobe organization ID
- Format: `your-org-name` or `comwrapukreply`

### Method 3: Use Setup Script

Run the interactive setup script:

```bash
cd access-provider
./setup-runtime-auth.sh
```

This will guide you through the process.

## Once You Have Your Namespace

Set it with:

```bash
aio runtime property set --namespace YOUR_NAMESPACE
```

Replace `YOUR_NAMESPACE` with your actual namespace.

## Verify It Works

Test authentication:

```bash
aio runtime action list
```

If this works (even if it shows an empty list), authentication is configured!

## Then Deploy

```bash
cd access-provider
./deploy.sh
```

## Alternative: Manual Deployment

If you know your namespace, you can deploy manually:

```bash
cd access-provider

# Set namespace
aio runtime property set --namespace YOUR_NAMESPACE

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

## Still Having Issues?

1. **Check Runtime Access**: Make sure Runtime is enabled in your Adobe organization
2. **Check Permissions**: You need Runtime developer permissions
3. **Try Fresh Login**: 
   ```bash
   aio logout
   aio login
   ```
4. **Contact Admin**: Your organization admin may need to enable Runtime for your account

## Next Steps After Deployment

Once deployed, you'll get action URLs like:
- `https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/login`
- `https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/verify`
- `https://YOUR_NAMESPACE.adobeioruntime.net/api/v1/web/gated-content/logout`

Save these URLs for:
- CloudFlare Worker configuration
- Login block configuration
- Header logout configuration


# Authenticate Adobe I/O Runtime - Step by Step

## Current Status

You've run `aio login` and received JWT tokens, but the runtime authentication isn't fully configured yet.

## Complete Authentication Process

### Step 1: Verify Login Status

```bash
# Check if you're logged in
aio whoami
```

If this works, you're logged in to Adobe I/O.

### Step 2: Get Your Namespace

You need to find your Adobe I/O Runtime namespace. This is typically:
- Your organization's namespace
- Format: `your-org-name` or similar

**Option A: Check Adobe I/O Console**
1. Go to: https://console.adobe.io/
2. Navigate to Runtime (or I/O Runtime)
3. Your namespace will be displayed

**Option B: Try to list namespaces**
```bash
aio runtime namespace list
```

If this prompts for authentication, follow the prompts.

### Step 3: Set Runtime Namespace

Once you have your namespace:

```bash
# Set the namespace
aio runtime property set --namespace YOUR_NAMESPACE

# Verify it's set
aio runtime property get
```

### Step 4: Alternative - Use App Builder

If you're using Adobe App Builder, you might need to:

1. Create an `app.config.yaml` in your project root:

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

2. Then deploy with:
```bash
aio app deploy
```

### Step 5: Manual Authentication Check

Try this to see what's needed:

```bash
# Check current config
aio config:list

# Try to get runtime info
aio runtime property get

# If it asks for auth, you may need to:
aio auth:login
```

## Quick Test

After authentication, test with:

```bash
# This should work without "AUTH key" error
aio runtime action list
```

## If Still Having Issues

1. **Check Adobe I/O Console**: Make sure you have Runtime access enabled
2. **Check Permissions**: Your account needs Runtime permissions
3. **Try Fresh Login**: 
   ```bash
   aio logout
   aio login
   ```
4. **Check Organization**: Make sure you're in the correct Adobe organization

## Next Steps

Once authentication works:
1. Run the deployment script: `./access-provider/deploy.sh`
2. Or deploy manually using the commands in `docs/DEPLOY_ACCESS_PROVIDER.md`


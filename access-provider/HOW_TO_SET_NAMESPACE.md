# How to Set Runtime Namespace

There are **4 ways** to set your Runtime namespace:

## Method 1: Environment Variable (Recommended) ⭐

Set it as an environment variable before running the scripts:

```bash
export RUNTIME_NAMESPACE="231729-358bluekoi"
./deploy.sh
```

Or for the setup script:
```bash
export RUNTIME_NAMESPACE="231729-358bluekoi"
./setup-runtime-auth.sh
```

**Advantages:**
- Works with both scripts
- Can be added to your `~/.zshrc` or `~/.bashrc` for persistence
- No need to type it each time

**To make it permanent:**
```bash
echo 'export RUNTIME_NAMESPACE="231729-358bluekoi"' >> ~/.zshrc
source ~/.zshrc
```

## Method 2: Command Line Argument

Pass it directly to the setup script:

```bash
./setup-runtime-auth.sh your-namespace
```

**Note:** This only works with `setup-runtime-auth.sh`, not `deploy.sh`.

## Method 3: Interactive Prompt

Run the setup script and it will prompt you:

```bash
./setup-runtime-auth.sh
# When prompted, enter your namespace
```

## Method 4: Manual CLI Command

Set it directly using the Adobe I/O CLI:

```bash
aio runtime property set --namespace your-namespace
```

Then verify it worked:
```bash
aio runtime action list
```

If this works (even if empty), you're authenticated!

## Finding Your Namespace

Your namespace is typically:
- Your organization name (lowercase, no spaces)
- Format: `your-org-name` or `comwrapukreply`

**To find it:**
1. Visit: https://console.adobe.io/
2. Navigate to: **Runtime** (or **I/O Runtime**)
3. Your namespace will be displayed

## Quick Example

If your namespace is `comwrapukreply`:

```bash
# Set it
export RUNTIME_NAMESPACE="comwrapukreply"

# Verify it's set
echo $RUNTIME_NAMESPACE

# Run setup (will use the env var)
./setup-runtime-auth.sh

# Or deploy directly (will use the env var)
./deploy.sh
```

## Troubleshooting

### "Namespace not found"
- Check you have Runtime enabled in your Adobe organization
- Verify the namespace spelling
- Try listing namespaces: `aio runtime namespace list`

### "AUTH key must be specified"
- Make sure you ran `aio login` first
- Try: `aio auth:login`
- Check you have Runtime permissions

### Environment variable not working
- Make sure you `export` it (not just set it)
- Check spelling: `RUNTIME_NAMESPACE` (not `NAMESPACE`)
- Verify with: `echo $RUNTIME_NAMESPACE`

## Recommended Workflow

1. **Find your namespace** from Adobe Console
2. **Set it as environment variable:**
   ```bash
   export RUNTIME_NAMESPACE="your-namespace"
   ```
3. **Run setup script:**
   ```bash
   ./setup-runtime-auth.sh
   ```
4. **Deploy:**
   ```bash
   ./deploy.sh
   ```

## Quick Test

After setting namespace, test with:
```bash
aio runtime action list
```

If this works without errors, you're ready to deploy!


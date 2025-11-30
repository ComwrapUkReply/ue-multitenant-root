# Encryption Key Setup Guide

## Overview

The encryption key is used to encrypt and decrypt authentication tokens in the Access Provider. It's critical that the **same key** is used for both the `login` and `verify` actions.

## Your Encryption Key

**Generated Key**: `tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q=`

⚠️ **IMPORTANT**: Keep this key secure and never commit it to version control!

## Setting the Encryption Key

### Method 1: Current Terminal Session (Temporary)

For the current terminal session only:

```bash
export ENCRYPTION_KEY="tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q="
```

This will only work for the current terminal session. When you close the terminal, you'll need to set it again.

### Method 2: Shell Configuration File (Persistent)

I've already added it to your `~/.zshrc` file. To use it:

```bash
# Reload your shell configuration
source ~/.zshrc

# Or open a new terminal window
```

### Method 3: Environment File (Recommended for Production)

Create a `.env` file in your project root (add to `.gitignore`):

```bash
# Create .env file
cat > .env << EOF
ENCRYPTION_KEY=tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q=
EOF

# Load it
source .env
```

### Method 4: Adobe I/O Runtime Parameters (For Deployment)

When deploying actions, pass the key as a parameter:

```bash
aio runtime action create login index.js \
  --param ENCRYPTION_KEY "tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q="

aio runtime action create verify index.js \
  --param ENCRYPTION_KEY "tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q="
```

## Verifying the Key is Set

Check if the key is set correctly:

```bash
# Check if variable exists
echo $ENCRYPTION_KEY

# Check key length (should be 44 characters for base64)
echo ${#ENCRYPTION_KEY}

# Verify it's not empty
if [ -z "$ENCRYPTION_KEY" ]; then
  echo "ERROR: ENCRYPTION_KEY is not set!"
else
  echo "✓ ENCRYPTION_KEY is set (${#ENCRYPTION_KEY} characters)"
fi
```

## Security Best Practices

### ✅ DO:
- Use a strong, random key (minimum 32 characters)
- Store in environment variables
- Use the same key for login and verify actions
- Rotate keys periodically
- Keep keys secure and private

### ❌ DON'T:
- Commit keys to Git
- Share keys in plain text
- Use weak or predictable keys
- Use different keys for login and verify
- Hardcode keys in source files

## Generating a New Key

If you need to generate a new encryption key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Troubleshooting

### Key Not Set Error

**Problem**: Actions fail with "ENCRYPTION_KEY not defined"

**Solution**:
1. Verify the key is set:
   ```bash
   echo $ENCRYPTION_KEY
   ```
2. If empty, set it:
   ```bash
   export ENCRYPTION_KEY="tXHkVo+cXx752o16fje1VBe839uVUe0LWvCNJKgPd2Q="
   ```
3. Reload shell config:
   ```bash
   source ~/.zshrc
   ```

### Key Mismatch Error

**Problem**: Login works but verification fails

**Solution**:
- Ensure the **exact same key** is used in both login and verify actions
- Check for extra spaces or line breaks
- Verify key is passed correctly when deploying actions

### Key Too Short

**Problem**: Encryption fails with "Invalid key length"

**Solution**:
- Minimum key length is 32 characters
- Generate a new key using one of the methods above
- Ensure no truncation occurred when copying

## Next Steps

After setting the encryption key:

1. ✅ Verify it's set: `echo $ENCRYPTION_KEY`
2. ✅ Proceed to Step 3.3: Deploy Actions
3. ✅ Use the same key for both login and verify actions

## Additional Resources

- [Node.js crypto documentation](https://nodejs.org/api/crypto.html)
- [Adobe I/O Runtime environment variables](https://developer.adobe.com/runtime/docs/guides/using/using-environment-variables/)
- [Security best practices](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)


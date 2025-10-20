# How to Get RepoLess Auth Token

Follow these steps to get a fresh authentication token for RepoLess configuration:

## Step-by-Step Instructions

1. **Open your browser** and navigate to:
   ```
   https://admin.hlx.page/login
   ```

2. **Login with Adobe ID**
   - Click on the `login_adobe` button
   - Enter your Adobe credentials
   - Complete the authentication process

3. **Get redirected to profile page**
   - You will be automatically redirected to:
   ```
   https://admin.hlx.page/profile
   ```

4. **Open Browser Developer Tools**
   - Press `F12` or right-click and select "Inspect"
   - Navigate to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)

5. **Find the auth_token cookie**
   - In the left sidebar, expand **Cookies**
   - Click on `https://admin.hlx.page`
   - Look for a cookie named `auth_token`

6. **Copy the token value**
   - Click on the `auth_token` row
   - Copy the entire value (it's a long JWT token)

## Using the Token

Once you have the token, you can use it in three ways:

### Option 1: Pass as argument
```bash
./scripts/setup-repoless.sh "your-auth-token-here"
```

### Option 2: Set as environment variable
```bash
export REPOLESS_AUTH_TOKEN="your-auth-token-here"
./scripts/setup-repoless.sh
```

### Option 3: Save in a file (for convenience)
```bash
echo "your-auth-token-here" > .auth-token
./scripts/setup-repoless.sh $(cat .auth-token)
```

> **Note**: Don't commit the `.auth-token` file to git. Add it to `.gitignore` if you use this method.

## Token Information

- **Validity**: Tokens are typically valid for 24 hours
- **Format**: JWT (JSON Web Token) - a very long string starting with `eyJ...`
- **Security**: Keep your token secure and don't share it publicly

## Troubleshooting

If you get authentication errors:
1. Your token may have expired - get a fresh one
2. Ensure you copied the complete token value
3. Check that you're logged in with the correct Adobe account
4. Verify you have the necessary permissions for the organization

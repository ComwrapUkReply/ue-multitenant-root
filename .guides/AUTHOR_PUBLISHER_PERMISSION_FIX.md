# Fix: Authors Can Still Publish - Solution Guide

## Problem

Users with only "Author" role permissions can still publish pages in AEM Universal Editor, even though they should only be able to preview.

## Root Cause

The issue is that the `requireAuth` setting was set to `"auto"` instead of `"true"`. According to the [AEM documentation](https://www.aem.live/docs/authentication-setup-site#create-a-site-token-to-access-your-protected-site), setting `requireAuth: "true"` enforces strict role-based authentication.

## Solution

### Step 1: Update Admin Configuration with requireAuth: "true"

The configuration needs to explicitly require authentication and enforce role-based restrictions:

```bash
curl -X POST https://admin.hlx.page/config/comwrapukreply/sites/ue-multitenant-root/access/admin.json \
  -H "content-type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  --data '{
    "role": {
      "author": [
        "h.scott@reply.com",
        "s.sznajder@reply.com"
      ],
      "publish": [
        "n.hutchison@reply.com",
        "j.leckie@reply.com"
      ],
      "admin": []
    },
    "requireAuth": "true"
  }'
```

**Key Change:** `"requireAuth": "true"` instead of `"auto"`

### Step 2: Configure Preview Access (Optional but Recommended)

To explicitly control who can access the preview site, you can also configure the preview section:

```bash
curl -X POST https://admin.hlx.page/config/comwrapukreply/sites/ue-multitenant-root/access/preview.json \
  -H "content-type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  --data '{
    "allow": [
      "h.scott@reply.com",
      "s.sznajder@reply.com",
      "n.hutchison@reply.com",
      "j.leckie@reply.com"
    ]
  }'
```

This allows both authors and publishers to access the preview site (`.aem.page` domain).

## Understanding the Configuration

### Access Configuration Structure

According to the [AEM documentation](https://www.aem.live/docs/authentication-setup-site#create-a-site-token-to-access-your-protected-site), the access configuration has this structure:

```json
{
  "access": {
    "preview": {
      "allow": ["*@acme.com"]  // Who can access preview site
    },
    "admin": {
      "role": {
        "author": ["*@acme.com"],    // Who can preview/edit
        "publish": ["*@acme.com"]    // Who can publish
      },
      "requireAuth": "true"          // Enforce authentication
    }
  }
}
```

### Role Permissions

- **`admin.role.author`**: Users who can:
  - Access Universal Editor
  - Edit content
  - Preview changes
  - **CANNOT** publish to live site

- **`admin.role.publish`**: Users who can:
  - All author permissions
  - **CAN** publish to live site

- **`requireAuth: "true"`**: Enforces that:
  - Users must be authenticated
  - Role-based restrictions are enforced
  - Only users in `publish` role can publish

## Verification Steps

### 1. Verify Configuration

```bash
curl -X GET https://admin.hlx.page/config/comwrapukreply/sites/ue-multitenant-root/access/admin.json \
  -H "x-auth-token: YOUR_TOKEN" \
  -H "content-type: application/json" | jq '.'
```

**Expected Response:**
```json
{
  "role": {
    "author": [
      "h.scott@reply.com",
      "s.sznajder@reply.com"
    ],
    "publish": [
      "n.hutchison@reply.com",
      "j.leckie@reply.com"
    ],
    "admin": []
  },
  "requireAuth": "true"
}
```

### 2. Test as Author

1. Log in as `h.scott@reply.com` or `s.sznajder@reply.com`
2. Open Universal Editor: `https://experience.adobe.com/aem/editor/canvas`
3. Load site: `https://main--ue-multitenant-root--ComwrapUkReply.aem.page/`

**Expected Behavior:**
- ✅ Can edit content
- ✅ Can preview changes
- ❌ **Publish button should be hidden or disabled**
- ❌ Cannot publish to live site

### 3. Test as Publisher

1. Log in as `n.hutchison@reply.com` or `j.leckie@reply.com`
2. Open Universal Editor: `https://experience.adobe.com/aem/editor/canvas`
3. Load site: `https://main--ue-multitenant-root--ComwrapUkReply.aem.page/`

**Expected Behavior:**
- ✅ Can edit content
- ✅ Can preview changes
- ✅ **Publish button is visible and enabled**
- ✅ Can publish to live site

## Important Notes

### Configuration Propagation

- Changes may take **5-10 minutes** to fully propagate
- Clear browser cache and cookies
- Log out and log back in after configuration changes

### Browser Access

According to the [AEM documentation](https://www.aem.live/docs/authentication-setup-site#create-a-site-token-to-access-your-protected-site):

> "Accessing protected sites directly from a browser requires users to have an appropriate role defined in the project configuration and to sign in using the AEM Sidekick Extension."

Users must:
1. Have the AEM Sidekick browser extension installed
2. Be signed in with their Adobe account
3. Have their email in the appropriate role configuration

### Difference from Site Authentication

The documentation you found ([authentication-setup-site](https://www.aem.live/docs/authentication-setup-site#create-a-site-token-to-access-your-protected-site)) is about:
- **Site Authentication**: Token-based protection of the entire site (intranet)
- **Not about**: Role-based permissions in Universal Editor

However, the configuration structure shown in that documentation is relevant for understanding how the access configuration works.

## Troubleshooting

### Issue: Authors Still Can Publish

**Possible Causes:**
1. Configuration hasn't propagated (wait 5-10 minutes)
2. `requireAuth` is not set to `"true"`
3. User is logged in with wrong account
4. Browser cache needs clearing

**Solution:**
1. Verify `requireAuth: "true"` is set
2. Clear browser cache and cookies
3. Log out and log back in
4. Wait 5-10 minutes for propagation
5. Verify user email is in correct role (not in `publish` role)

### Issue: Publishers Cannot Publish

**Possible Causes:**
1. User not in `publish` role
2. Configuration error
3. AEM author instance permissions

**Solution:**
1. Verify user is in `publish` role array
2. Check configuration syntax
3. Verify AEM author instance permissions

## Related Documentation

- [AEM Authentication Setup](https://www.aem.live/docs/authentication-setup-site#create-a-site-token-to-access-your-protected-site)
- [AEM Authentication for Authoring](https://www.aem.live/developer/authentication-setup-site-for-aem-authoring)
- [Admin API Documentation](https://admin.hlx.page/docs)

## Summary

The key fix is setting `"requireAuth": "true"` in the admin configuration. This enforces strict role-based authentication and prevents authors from publishing while allowing publishers to do so.


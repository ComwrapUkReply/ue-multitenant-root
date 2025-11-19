# User Permission Verification Guide

This guide helps you verify that author and publisher permissions are correctly configured for your AEM Universal Editor site.

## Current Permission Configuration

Based on your setup, the following users have been configured:

### Author Role (Preview Only)
- `h.scott@reply.com` - Can preview pages but cannot publish
- `s.sznajder@reply.com` - Can preview pages but cannot publish

### Publisher Role (Preview + Publish)
- `n.hutchison@reply.com` - Can preview and publish pages
- `j.leckie@reply.com` - Can preview and publish pages

## Step 1: Verify Current Configuration

### Check Current Access Configuration

```bash
curl -X GET https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
  -H "x-auth-token: eyJhbGciOiJSUzI1NiIsImtpZCI6Ijdzb2k4N3pkb3NJRnc4b19fbVR5a082QlVRNEZBVGhjaHlyNGZqY1dSbWcifQ.eyJlbWFpbCI6InMuc3puYWpkZXJAcmVwbHkuY29tIiwibmFtZSI6IlN6eW1vbiBzem5hamRlciIsInVzZXJfaWQiOiJEQkFFMTQwOTY1QTgxMDVFMEE0OTVDQURANWRiODM1MzA2MzE0YzQ4ODQ5NWZhNS5lIiwiaW1zVG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luZzFkU0k2SW1sdGMxOXVZVEV0YTJWNUxXRjBMVEV1WTJWeUlpd2lhMmxrSWpvaWFXMXpYMjVoTVMxclpYa3RZWFF0TVNJc0ltbDBkQ0k2SW1GMEluMC5leUpwWkNJNklqRTNOak16TnpRMU5qUXdOVE5mTnpWaVlUTmtObVF0WXpZek1TMDBaV05sTFRsaU9HTXRNV1JrTURKaFl6STRPVEV3WDNWbE1TSXNJblI1Y0dVaU9pSmhZMk5sYzNOZmRHOXJaVzRpTENKamJHbGxiblJmYVdRaU9pSm9aV3hwZUMxaFpHMXBiaUlzSW5WelpYSmZhV1FpT2lKRVFrRkZNVFF3T1RZMVFUZ3hNRFZGTUVFME9UVkRRVVJBTldSaU9ETTFNekEyTXpFMFl6UTRPRFE1TldaaE5TNWxJaXdpYzNSaGRHVWlPaUpsZVVwb1lrZGphVTlwU25WaU1qVnNTVzR3TG1WNVNuZGpiVGwwWTBoUmFVOXBTblZpTWpWc1NXbDNhV0l6U201SmFtOXBXVmRTZGxsdFZXbG1VUzRpTENKaGN5STZJbWx0Y3kxdVlURWlMQ0poWVY5cFpDSTZJa1JDUVVReE5EQTVOalZCT0RFd05VVXdRVFE1TlVOQlJFQkJaRzlpWlVsRUlpd2lZM1J3SWpvd0xDSm1aeUk2SWxvMldGUlhSVWxhVmt4Tk5VRkVWVXRHUVZGV1NVaEJRVVUwSWl3aWMybGtJam9pTVRjMk1qazFNRGszT1RNMk0xOWtZall3T1dRNVppMHhORGs0TFRSbU5UQXRPRE01TWkwMU0yUXdOak5oWlRVek4yTmZkbUUyWXpJaUxDSnlkR2xrSWpvaU1UYzJNek0zTkRVMk5EQTFNMTgxWmpobU4ySTJOQzFqTnprM0xUUmtZMkl0WVRWaE9DMDFNVEJrWVdFeVlURTBaV1JmZFdVeElpd2liVzlwSWpvaU1tUTBOVEExT0dJaUxDSndZbUVpT2lKTlpXUlRaV05PYjBWV0xFeHZkMU5sWXlJc0luSjBaV0VpT2lJeE56WTBOVGcwTVRZME1EVXpJaXdpWlhod2FYSmxjMTlwYmlJNklqZzJOREF3TURBd0lpd2ljMk52Y0dVaU9pSkJaRzlpWlVsRUxHOXdaVzVwWkN4d2NtOW1hV3hsTEdWdFlXbHNMR0ZpTG0xaGJtRm5aU3huYm1GMkxHOXlaeTV5WldGa0xISmxZV1JmYjNKbllXNXBlbUYwYVc5dWN5eHpaWE56YVc5dUxHRmtaR2wwYVc5dVlXeGZhVzVtYnk1dmQyNWxjazl5Wnl4aFpHUnBkR2x2Ym1Gc1gybHVabTh1Y0hKdmFtVmpkR1ZrVUhKdlpIVmpkRU52Ym5SbGVIUXNZV1Z0TG1aeWIyNTBaVzVrTG1Gc2JDSXNJbU55WldGMFpXUmZZWFFpT2lJeE56WXpNemMwTlRZME1EVXpJbjAuS0xfZ241c01BMzNyN1NsMXFOTU5xelFSaTE2NDFDOEdVS0wyMTd5NGYzaUtIbU1fQ1hxNWljZExLQm9IZU9uTElXWU1VLUpXaDU3NTBwWVotT3dqQ1RWVU1ES2pxeDRaQ3lCSmFSeldwbHRqTU9KR3F2d2Y0QURBNndLT1g0bFlDU2lvRk13S3ZVanpMT3NnQUd5TTZvVFF2QUxhOEV5WkdBbHdIMmMzN2w5cWh0VDg0UXhYSWhxNG1uQjRheW42d1ZJWWZkZjY0c2FZREZST0ZTZlJSRDQzV3MzZUs2Z1l2X3VOazdBNDVIVlBibHF3NlBxb01PY2FZMVptb0I5RDRMaDNuTk1mekpYbTNWelhqdGplN3RMT0pOMVF4NEFTUFNOc2RhbGgxX1JaRkZWLUdBdnVTYkJGeTZ2TVdDcUtwLU5yR3JJQndSSXNRX2xvblJfVlpBIiwiaWF0IjoxNzYzMzc0NTY0LCJpc3MiOiJodHRwczovL2FkbWluLmhseC5wYWdlLyIsInN1YiI6IiovKiIsImF1ZCI6IjgzYTM2MzU1LWFkMTctNGVkMC04NzAxLWU5OWEzMDIwZjg2YSIsImV4cCI6MTc2MzQ2MDk2NH0.PIFpHf8Nj6RweVCx1A4TN4F3IR5EEbg6JvzRjmBzCQ_ZNNZbqGYgAxK0ST5AFrRc8EFBgX5gfWXjFL1kwQYo0bKm4fr-tNYN_7EQx6ulJh7obCtOIIcuElOxflDQOTbK1I8N2NyxVY6nC2tgu--dmBQUOpKCfpatTg4aY393w_aOAfAOppU1-dMOjZ79mYGLQR34hKY6xuVKXObjST2IgpRjU-7IIQHvGY7OU6vObl1zeu6Tl6eR5W857ZS516DOlz_VvOyoco1_Oru8iNc57e9On8xlg2cxq3jwf02FxMIA-QmYm2nxk05slO4kVIiLVIXJXhqVH33N7V8cVR5pyA" \
  -H "content-type: application/json"
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
  }
}
```

**What to check:**
- ✅ All email addresses are correctly listed
- ✅ No syntax errors in JSON
- ✅ Author and publish roles are properly separated

### Fix Configuration (if needed)

If you need to update the configuration, use this corrected command:

```bash
curl -X POST https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
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
    }
  }'
```

## Step 2: Test Author Permissions (Preview Only)

### Test 1: Author Can Access Preview Site

1. **Log in as an author** (e.g., `h.scott@reply.com` or `s.sznajder@reply.com`)
2. **Open Universal Editor**:
   ```
   https://experience.adobe.com/aem/editor/canvas
   ```
3. **Load your site**:
   ```
   https://main--ue-multitenant-root--ComwrapUkReply.aem.page/
   ```

**Expected Behavior:**
- ✅ Author can see and edit content in Universal Editor
- ✅ Author can preview changes
- ✅ Author can see the preview site (`.aem.page` domain)
- ❌ Author should NOT see publish button or publish options
- ❌ Author should NOT be able to publish to live site

### Test 2: Author Cannot Access Live Site

1. **While logged in as author**, try to access:
   ```
   https://main--ue-multitenant-root--ComwrapUkReply.aem.live/
   ```

**Expected Behavior:**
- ✅ Author can access preview site (`.aem.page`)
- ❌ Author may be restricted from live site (`.aem.live`) or see read-only version

### Test 3: Author Cannot Publish

1. **In Universal Editor**, look for publish controls
2. **Try to publish a page**

**Expected Behavior:**
- ❌ Publish button should be disabled or hidden
- ❌ If publish button is visible, clicking it should show an error message
- ✅ Author can only save/preview changes

## Step 3: Test Publisher Permissions (Preview + Publish)

### Test 1: Publisher Can Access Both Sites

1. **Log in as a publisher** (e.g., `n.hutchison@reply.com` or `j.leckie@reply.com`)
2. **Open Universal Editor**:
   ```
   https://experience.adobe.com/aem/editor/canvas
   ```
3. **Load your site**:
   ```
   https://main--ue-multitenant-root--ComwrapUkReply.aem.page/
   ```

**Expected Behavior:**
- ✅ Publisher can see and edit content
- ✅ Publisher can preview changes
- ✅ Publisher can access preview site (`.aem.page`)
- ✅ Publisher can access live site (`.aem.live`)

### Test 2: Publisher Can Publish

1. **In Universal Editor**, make a test change to a page
2. **Look for publish button/controls**
3. **Click publish**

**Expected Behavior:**
- ✅ Publish button should be visible and enabled
- ✅ Publisher can publish to live site
- ✅ Published changes appear on `.aem.live` domain
- ✅ No error messages when publishing

### Test 3: Verify Published Content

1. **After publishing**, check the live site:
   ```
   https://main--ue-multitenant-root--ComwrapUkReply.aem.live/
   ```
2. **Verify changes are visible**

**Expected Behavior:**
- ✅ Changes appear on live site
- ✅ Content is publicly accessible
- ✅ No authentication required for public users

## Step 4: Testing in Universal Editor

### How to Test Permissions in Universal Editor

#### For Authors:

1. **Open Universal Editor**:
   - Go to: `https://experience.adobe.com/aem/editor/canvas`
   - Or use the direct link: `https://main--ue-multitenant-root--ComwrapUkReply.aem.page/`

2. **Verify Author Capabilities**:
   - ✅ Can edit content (text, images, blocks)
   - ✅ Can add/remove blocks
   - ✅ Can see preview of changes
   - ✅ Can save changes (preview only)
   - ❌ Cannot see "Publish" button in toolbar
   - ❌ Cannot access publish workflow

3. **Check Toolbar**:
   - Look at the top toolbar in Universal Editor
   - Author should see: "Save", "Preview", "Undo/Redo"
   - Author should NOT see: "Publish", "Publish to Live"

#### For Publishers:

1. **Open Universal Editor** (same as above)

2. **Verify Publisher Capabilities**:
   - ✅ All author capabilities (edit, preview, save)
   - ✅ Can see "Publish" button in toolbar
   - ✅ Can access publish workflow
   - ✅ Can publish to live site

3. **Check Toolbar**:
   - Publisher should see: "Save", "Preview", "Publish", "Undo/Redo"
   - Publisher can click "Publish" to make changes live

### Visual Indicators in Universal Editor

**Author View:**
- Content is editable
- Preview works
- No publish controls visible
- Status shows "Preview" or "Draft"

**Publisher View:**
- Content is editable
- Preview works
- Publish button visible in toolbar
- Can see publish status and history

## Step 5: Verify via API

### Check User's Current Role

You can verify a user's role programmatically:

```bash
# Get current user's permissions
curl -X GET "https://admin.hlx.page/profile" \
  -H "x-auth-token: USER_TOKEN_HERE" \
  -H "content-type: application/json"
```

### Check Site Access Configuration

```bash
# Get full access configuration
curl -X GET "https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access.json" \
  -H "x-auth-token: ADMIN_TOKEN_HERE" \
  -H "content-type: application/json"
```

## Step 6: Common Issues and Solutions

### Issue 1: Author Can See Publish Button

**Problem:** Author role user can see and click publish button

**Solution:**
1. Verify the access configuration is correct:
   ```bash
   curl -X GET https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
     -H "x-auth-token: YOUR_TOKEN"
   ```

2. Ensure the user is NOT in the publish role
3. Clear browser cache and cookies
4. Log out and log back in
5. Wait 5-10 minutes for configuration to propagate

### Issue 2: Publisher Cannot Publish

**Problem:** Publisher role user cannot publish

**Solution:**
1. Verify user is in publish role:
   ```bash
   curl -X GET https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
     -H "x-auth-token: YOUR_TOKEN"
   ```

2. Check user's authentication token is valid
3. Verify AEM author instance permissions
4. Check browser console for errors
5. Ensure technical account has proper permissions

### Issue 3: Changes Not Reflecting

**Problem:** Permission changes not taking effect

**Solution:**
1. Wait 5-10 minutes for configuration propagation
2. Clear browser cache
3. Log out and log back in
4. Verify configuration was saved correctly
5. Check for typos in email addresses

### Issue 4: Access Denied Errors

**Problem:** Users getting 403 or access denied errors

**Solution:**
1. Verify user email is in correct role
2. Check email address spelling (case-sensitive)
3. Ensure user is logged in with correct Adobe account
4. Verify auth token is valid and not expired
5. Check AEM author instance permissions

## Step 7: Testing Checklist

Use this checklist to verify permissions are working correctly:

### Author Role Testing
- [ ] Author can log into Universal Editor
- [ ] Author can edit content
- [ ] Author can preview changes
- [ ] Author can access `.aem.page` domain
- [ ] Author cannot see publish button
- [ ] Author cannot publish to live site
- [ ] Author changes remain in preview only

### Publisher Role Testing
- [ ] Publisher can log into Universal Editor
- [ ] Publisher can edit content
- [ ] Publisher can preview changes
- [ ] Publisher can access `.aem.page` domain
- [ ] Publisher can access `.aem.live` domain
- [ ] Publisher can see publish button
- [ ] Publisher can publish to live site
- [ ] Published changes appear on live site

### Configuration Verification
- [ ] Access configuration is correctly set
- [ ] All email addresses are valid
- [ ] No JSON syntax errors
- [ ] Configuration has propagated (5-10 min wait)
- [ ] Users can authenticate properly

## Step 8: Monitoring and Maintenance

### Regular Verification

Run these checks periodically:

```bash
# Weekly check of access configuration
curl -X GET https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
  -H "x-auth-token: YOUR_TOKEN" | jq '.'
```

### Adding New Users

To add a new author:
```bash
curl -X POST https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
  -H "content-type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  --data '{
    "role": {
      "author": [
        "h.scott@reply.com",
        "s.sznajder@reply.com",
        "new.author@reply.com"
      ],
      "publish": [
        "n.hutchison@reply.com",
        "j.leckie@reply.com"
      ]
    }
  }'
```

To add a new publisher:
```bash
curl -X POST https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
  -H "content-type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  --data '{
    "role": {
      "author": [
        "h.scott@reply.com",
        "s.sznajder@reply.com"
      ],
      "publish": [
        "n.hutchison@reply.com",
        "j.leckie@reply.com",
        "new.publisher@reply.com"
      ]
    }
  }'
```

### Removing Users

Simply remove the email from the appropriate array in the configuration.

## Additional Resources

- [AEM Universal Editor Documentation](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
- [Edge Delivery Services Access Control](https://www.aem.live/developer/access-control)
- [Admin API Documentation](https://admin.hlx.page/docs)

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify configuration via API
3. Check AEM author instance logs
4. Contact Adobe support if needed


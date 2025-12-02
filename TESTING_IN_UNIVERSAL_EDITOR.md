# Testing Permissions in Universal Editor

Quick guide for testing author and publisher permissions directly in Universal Editor.

## Quick Start

### Step 1: Open Universal Editor

1. Go to: `https://experience.adobe.com/aem/editor/canvas`
2. Or use direct link: `https://main--ue-multitenant-root--ComwrapUkReply.aem.page/`

### Step 2: Log In

Make sure you're logged in with the correct Adobe account for the user you want to test.

## Testing Author Permissions

### Test as Author User

**Users to test:**
- `h.scott@reply.com`
- `s.sznajder@reply.com`

**What to check:**

1. **Can Edit Content**
   - ✅ Click on any text block - should be editable
   - ✅ Can modify text, images, and blocks
   - ✅ Changes save successfully

2. **Can Preview**
   - ✅ Click "Preview" button (if available)
   - ✅ Can see preview of changes
   - ✅ Preview site works: `https://main--ue-multitenant-root--ComwrapUkReply.aem.page/`

3. **Cannot Publish**
   - ❌ Should NOT see "Publish" button in toolbar
   - ❌ Should NOT see publish options in menu
   - ❌ If publish button exists, it should be disabled/grayed out

4. **Visual Indicators**
   - Status bar shows "Preview" or "Draft"
   - No publish workflow available
   - Changes remain in preview only

### Where to Look in Universal Editor

**Toolbar (Top of Editor):**
- Author should see: Save, Preview, Undo, Redo
- Author should NOT see: Publish, Publish to Live

**Right Panel:**
- Author can see: Properties, Content
- Author should NOT see: Publish Status, Publish History

**Page Status:**
- Shows "Preview" or "Draft"
- Does NOT show "Published" or "Live"

## Testing Publisher Permissions

### Test as Publisher User

**Users to test:**
- `n.hutchison@reply.com`
- `j.leckie@reply.com`

**What to check:**

1. **Can Edit Content** (Same as Author)
   - ✅ Click on any text block - should be editable
   - ✅ Can modify text, images, and blocks
   - ✅ Changes save successfully

2. **Can Preview** (Same as Author)
   - ✅ Click "Preview" button
   - ✅ Can see preview of changes
   - ✅ Preview site works

3. **Can Publish** (Publisher Only)
   - ✅ Should see "Publish" button in toolbar
   - ✅ Publish button is enabled/clickable
   - ✅ Can access publish workflow
   - ✅ Can publish to live site

4. **Visual Indicators**
   - Status bar shows publish options
   - Publish workflow is accessible
   - Can see publish history

### Where to Look in Universal Editor

**Toolbar (Top of Editor):**
- Publisher should see: Save, Preview, **Publish**, Undo, Redo
- Publish button should be visible and enabled

**Right Panel:**
- Publisher can see: Properties, Content, **Publish Status**
- Can see publish history and status

**Page Status:**
- Can see "Published" status
- Can see when last published
- Can see live site link

## Step-by-Step Testing Process

### Test 1: Author Cannot Publish

1. **Log in as author** (`h.scott@reply.com` or `s.sznajder@reply.com`)
2. **Open Universal Editor**
3. **Make a test change** (e.g., add text to a block)
4. **Look for publish button** - should NOT be visible
5. **Check toolbar** - no publish options
6. **Verify** - changes only appear in preview, not on live site

### Test 2: Publisher Can Publish

1. **Log in as publisher** (`n.hutchison@reply.com` or `j.leckie@reply.com`)
2. **Open Universal Editor**
3. **Make a test change** (e.g., add text to a block)
4. **Look for publish button** - should be visible and enabled
5. **Click publish button**
6. **Complete publish workflow**
7. **Verify** - changes appear on live site: `https://main--ue-multitenant-root--ComwrapUkReply.aem.live/`

### Test 3: Verify Live Site Access

1. **As Author:**
   - Try to access: `https://main--ue-multitenant-root--ComwrapUkReply.aem.live/`
   - Should work (read-only access to published content)
   - Cannot publish new changes

2. **As Publisher:**
   - Access: `https://main--ue-multitenant-root--ComwrapUkReply.aem.live/`
   - Should work (full access)
   - Can see published content

## Troubleshooting in Universal Editor

### Issue: Author Can See Publish Button

**Possible causes:**
1. Configuration hasn't propagated (wait 5-10 minutes)
2. User is logged in with wrong account
3. Browser cache needs clearing

**Solution:**
1. Clear browser cache and cookies
2. Log out and log back in
3. Wait 5-10 minutes for configuration to update
4. Verify user email in configuration

### Issue: Publisher Cannot Publish

**Possible causes:**
1. User not in publish role
2. AEM author instance permissions issue
3. Technical account permissions

**Solution:**
1. Verify user is in publish role via API
2. Check browser console for errors
3. Verify AEM author instance permissions
4. Check technical account configuration

### Issue: Changes Not Saving

**Possible causes:**
1. Authentication issue
2. Network connectivity
3. AEM author instance issue

**Solution:**
1. Check browser console for errors
2. Verify internet connection
3. Check AEM author instance status
4. Try refreshing the page

## Visual Guide

### Author View in Universal Editor

```
┌─────────────────────────────────────────┐
│ [Save] [Preview] [Undo] [Redo]         │  ← No Publish button
├─────────────────────────────────────────┤
│                                         │
│  [Editable Content Area]                │
│                                         │
│  Status: Preview / Draft                │  ← Shows preview status
│                                         │
└─────────────────────────────────────────┘
```

### Publisher View in Universal Editor

```
┌─────────────────────────────────────────┐
│ [Save] [Preview] [Publish] [Undo] [Redo]│  ← Publish button visible
├─────────────────────────────────────────┤
│                                         │
│  [Editable Content Area]                │
│                                         │
│  Status: Published / Last published: ...│  ← Shows publish status
│                                         │
└─────────────────────────────────────────┘
```

## Quick Verification Commands

### Check Current Configuration

```bash
# Replace YOUR_TOKEN with your auth token
curl -X GET https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access/admin.json \
  -H "x-auth-token: YOUR_TOKEN" \
  -H "content-type: application/json" | jq '.'
```

### Use Verification Script

```bash
# Make script executable (if not already)
chmod +x verify-permissions.sh

# Run verification
./verify-permissions.sh YOUR_TOKEN
```

## Next Steps

1. **Test with each user** - Log in as each author and publisher to verify
2. **Document any issues** - Note any problems you encounter
3. **Verify live site** - Check that published content appears correctly
4. **Regular checks** - Periodically verify permissions are still correct

For more detailed information, see: `PERMISSION_VERIFICATION_GUIDE.md`


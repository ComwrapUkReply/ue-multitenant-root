# Gated Content Testing Plan

## Overview

This document provides a comprehensive testing plan for the gated content implementation in ue-multitenant-root.

## Test Environment

| Parameter | Value |
|-----------|-------|
| Test URL | _____________________________ |
| Test User Credentials | See demo credentials below |

## Demo Credentials

- **Member**: `member@example.com` / `demo123`
- **Premium**: `premium@example.com` / `demo123`
- **Admin**: `admin@example.com` / `demo123`

## Test Cases

### TC-1: Public Content Access

**Objective**: Verify public pages are accessible without authentication

**Steps**:
1. Clear all cookies in browser
2. Navigate to homepage (/)
3. Navigate to /about
4. Navigate to any public page

**Expected Results**:
- [ ] All pages load successfully
- [ ] No login redirect
- [ ] Header shows "Sign In" link
- [ ] No authentication errors

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-2: Protected Content - Not Logged In

**Objective**: Verify protected pages redirect to login

**Steps**:
1. Clear all cookies in browser
2. Navigate to /members/dashboard

**Expected Results**:
- [ ] Redirected to /login
- [ ] Return URL parameter present (?returnUrl=/members/dashboard)
- [ ] Login form displayed

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-3: Login - Valid Credentials

**Objective**: Verify successful login flow

**Steps**:
1. Navigate to /login
2. Enter member credentials: `member@example.com` / `demo123`
3. Submit form

**Expected Results**:
- [ ] Login succeeds
- [ ] Cookies are set (check DevTools → Application → Cookies):
  - [ ] `access_verification` (HTTP-only)
  - [ ] `user_data` (readable)
- [ ] Redirected to return URL or homepage
- [ ] Header shows "Hello, John Member!"
- [ ] Header shows member badge
- [ ] "Sign Out" button visible

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-4: Login - Invalid Credentials

**Objective**: Verify login fails with wrong credentials

**Steps**:
1. Navigate to /login
2. Enter invalid credentials: `invalid@example.com` / `wrong`
3. Submit form

**Expected Results**:
- [ ] Login fails
- [ ] Error message displayed
- [ ] No cookies set
- [ ] User remains on login page
- [ ] Can retry login

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-5: Member Content Access

**Objective**: Verify member can access member content

**Steps**:
1. Login as member user
2. Navigate to /members/dashboard
3. Navigate to /members/resources

**Expected Results**:
- [ ] Pages load successfully
- [ ] Content is displayed
- [ ] No access denied message
- [ ] Header shows member level

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-6: Premium Content Access - Member User

**Objective**: Verify member cannot access premium content

**Steps**:
1. Login as member user
2. Navigate to /premium/article

**Expected Results**:
- [ ] Access denied (403) or upgrade message
- [ ] "Upgrade Now" button visible
- [ ] Current level shown as "member"
- [ ] Required level shown as "premium"
- [ ] Cannot view actual content

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-7: Premium Content Access - Premium User

**Objective**: Verify premium user can access premium content

**Steps**:
1. Login as premium user: `premium@example.com` / `demo123`
2. Navigate to /premium/article
3. Navigate to /members/dashboard (lower level)

**Expected Results**:
- [ ] Premium page loads successfully
- [ ] Content is displayed
- [ ] No access denied message
- [ ] Header shows premium badge
- [ ] Can also access member-level content

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-8: Admin Content Access

**Objective**: Verify admin user can access all content

**Steps**:
1. Login as admin user: `admin@example.com` / `demo123`
2. Navigate to /admin/dashboard
3. Navigate to /premium/article
4. Navigate to /members/dashboard

**Expected Results**:
- [ ] All pages load successfully
- [ ] Admin badge shown in header
- [ ] Can access all content levels
- [ ] No access denied messages

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-9: Logout

**Objective**: Verify logout clears session

**Steps**:
1. Login as any user
2. Click "Sign Out" button in header
3. Navigate to /members/dashboard

**Expected Results**:
- [ ] Cookies are cleared
- [ ] Redirected to homepage after logout
- [ ] Header shows "Sign In" link
- [ ] Cannot access protected content
- [ ] Redirected to login when accessing protected pages

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-10: Token Verification

**Objective**: Verify token validation detects tampering

**Steps**:
1. Login as member user
2. Open DevTools → Application → Cookies
3. Manually modify `user_data` cookie
4. Change `"level":"member"` to `"level":"premium"`
5. Navigate to /premium/article

**Expected Results**:
- [ ] Access denied (tampered cookie detected)
- [ ] Token verification fails
- [ ] Redirected to login
- [ ] Error logged in CloudFlare Worker

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-11: Session Expiration

**Objective**: Verify expired sessions are handled

**Steps**:
1. Login as any user
2. Wait for cookie expiration (24 hours) OR manually expire cookies
3. Navigate to protected content

**Expected Results**:
- [ ] Redirected to login
- [ ] Session expired behavior (optional message)
- [ ] Can log in again

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-12: Access Badge Block

**Objective**: Verify access badge displays correctly

**Steps**:
1. Add Access Badge block to a page
2. View page without login
3. Login as member, view page
4. Login as premium, view page
5. Login as admin, view page

**Expected Results**:
- [ ] Without login: Shows "Guest" badge
- [ ] Member: Shows "⭐ Member" with username
- [ ] Premium: Shows "💎 Premium" with username
- [ ] Admin: Shows "👑 Admin" with username
- [ ] Different gradient colors for each level

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-13: Protected Content Block

**Objective**: Verify protected content block works

**Steps**:
1. Add Protected Content block with "premium" level
2. View page without login
3. View page as member user
4. View page as premium user

**Expected Results**:
- [ ] Without login: Shows "Sign In Required" message
- [ ] Member: Shows "Upgrade Now" message with current level
- [ ] Premium: Shows actual content with "✓ premium content" indicator
- [ ] Appropriate buttons/links shown

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-14: Header Authentication UI

**Objective**: Verify header shows correct authentication state

**Steps**:
1. View site without login
2. Login as member
3. Check header display
4. Logout
5. Check header display

**Expected Results**:
- [ ] Without login: Shows "Sign In" link
- [ ] After login: Shows greeting, level badge, "Sign Out" button
- [ ] User name displayed correctly
- [ ] Level indicator has correct color
- [ ] After logout: Back to "Sign In" link

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-15: Performance - Cached Content

**Objective**: Verify caching works for public content

**Steps**:
1. Clear browser cache
2. Load public page
3. Check Network tab for cache headers
4. Reload page
5. Check if served from cache

**Expected Results**:
- [ ] First load: Cache-Control header set
- [ ] Second load: Served from cache (304 or from disk)
- [ ] Fast load times
- [ ] No unnecessary requests

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-16: Performance - Protected Content

**Objective**: Verify performance for authenticated users

**Steps**:
1. Login as user
2. Navigate to protected content
3. Check Network tab for timing
4. Measure time to interactive

**Expected Results**:
- [ ] Authorization check doesn't significantly slow down load
- [ ] Content loads within acceptable time (< 2s)
- [ ] No unnecessary redirects
- [ ] Good Core Web Vitals scores

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-17: Mobile Responsiveness

**Objective**: Verify authentication works on mobile

**Steps**:
1. Open site on mobile device or use DevTools mobile emulation
2. Navigate to login page
3. Login as member
4. Test header UI
5. Test protected content

**Expected Results**:
- [ ] Login form displays correctly on mobile
- [ ] Header authentication UI adapts to mobile
- [ ] All buttons are tappable
- [ ] No horizontal scrolling
- [ ] User info readable on small screens

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-18: Browser Compatibility

**Objective**: Verify works across browsers

**Browsers to Test**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Steps** (repeat for each browser):
1. Login as member
2. Access protected content
3. Check cookies
4. Logout

**Expected Results**:
- [ ] Consistent behavior across all browsers
- [ ] No console errors
- [ ] Cookies work correctly
- [ ] UI displays correctly

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-19: Accessibility

**Objective**: Verify accessibility compliance

**Steps**:
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate login form
3. Test keyboard navigation (Tab, Enter, Space)
4. Check focus indicators
5. Run Lighthouse accessibility audit

**Expected Results**:
- [ ] Form fields have proper labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Lighthouse score > 90

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

### TC-20: Edge Cases

**Objective**: Verify handling of edge cases

**Test Scenarios**:
1. Rapid login/logout
2. Multiple tabs with different auth states
3. Login in one tab, access protected content in another
4. Network interruption during login
5. Very long usernames
6. Special characters in passwords

**Expected Results**:
- [ ] No race conditions
- [ ] Consistent auth state across tabs
- [ ] Graceful error handling
- [ ] No crashes or freezes
- [ ] Proper error messages

**Status**: [ ] Pass [ ] Fail

**Notes**: _____________________

---

## Test Results Summary

**Date**: _______________  
**Tester**: _______________  
**Environment**: _______________

| Metric | Result |
|--------|--------|
| Total Test Cases | 20 |
| Passed | ___ |
| Failed | ___ |
| Blocked | ___ |
| Pass Rate | ___% |

## Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Non-Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Sign-Off

**Developer**: _______________ Date: _______________  
**QA**: _______________ Date: _______________  
**Product Owner**: _______________ Date: _______________

---

## Automated Testing

### Setup Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Run Tests

```bash
npx playwright test
```

### Sample Test Script

Create `tests/auth.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://yourdomain.com';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto(\`\${BASE_URL}/members/dashboard\`);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should allow login with valid credentials', async ({ page }) => {
    await page.goto(\`\${BASE_URL}/login\`);
    await page.fill('#email', 'member@example.com');
    await page.fill('#password', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await expect(page).not.toHaveURL(/.*login.*/);
    await expect(page.locator('.user-greeting')).toContainText('Hello');
  });
});
```

## Continuous Monitoring

### CloudFlare Analytics

Monitor daily:
- Request volume
- Error rate (should be < 1%)
- Cache hit ratio (should be > 80%)
- Worker CPU time (should be < 50ms)

### Adobe I/O Runtime

Check regularly:
- Action invocations
- Error logs
- Response times

### User Metrics

Track:
- Login success rate
- Average session duration
- Access denials by level
- Upgrade conversion rate

---

**End of Testing Plan**


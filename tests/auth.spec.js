const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const TEST_USERS = {
  member: {
    email: 'member@example.com',
    password: 'demo123',
    level: 'member',
    name: 'John Member'
  },
  premium: {
    email: 'premium@example.com',
    password: 'demo123',
    level: 'premium',
    name: 'Jane Premium'
  },
  admin: {
    email: 'admin@example.com',
    password: 'demo123',
    level: 'admin',
    name: 'Admin User'
  }
};

// Helper function to login
async function login(page, userType) {
  const user = TEST_USERS[userType];
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

// Helper function to logout
async function logout(page) {
  await page.click('.logout-button');
  await page.waitForNavigation();
}

test.describe('Public Content Access', () => {
  test('should access homepage without authentication', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(BASE_URL);
    const signInLink = page.locator('.login-link');
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveText('Sign In');
  });

  test('should access about page without authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await expect(page).toHaveURL(`${BASE_URL}/about`);
    await expect(page.locator('.login-link')).toBeVisible();
  });
});

test.describe('Protected Content - Unauthenticated', () => {
  test('should redirect to login for member content', async ({ page }) => {
    await page.goto(`${BASE_URL}/members/dashboard`);
    await page.waitForURL(/.*login.*/);
    expect(page.url()).toContain('returnUrl');
  });

  test('should redirect to login for premium content', async ({ page }) => {
    await page.goto(`${BASE_URL}/premium/article`);
    await page.waitForURL(/.*login.*/);
    expect(page.url()).toContain('returnUrl');
  });

  test('should redirect to login for admin content', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForURL(/.*login.*/);
    expect(page.url()).toContain('returnUrl');
  });
});

test.describe('Login Flow', () => {
  test('should login successfully with valid member credentials', async ({ page }) => {
    await login(page, 'member');
    
    // Verify not on login page
    expect(page.url()).not.toContain('login');
    
    // Verify header shows user info
    const userGreeting = page.locator('.user-greeting');
    await expect(userGreeting).toBeVisible();
    await expect(userGreeting).toContainText('Hello');
    
    // Verify member level badge
    const userLevel = page.locator('.user-level');
    await expect(userLevel).toBeVisible();
    await expect(userLevel).toContainText('member');
    
    // Verify logout button
    await expect(page.locator('.logout-button')).toBeVisible();
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('login');
    
    // Should show error message
    const errorMessage = page.locator('.login-error, .error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('should redirect to return URL after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/members/dashboard`);
    await page.waitForURL(/.*login.*/);
    
    const returnUrl = new URL(page.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBeTruthy();
    
    await page.fill('#email', TEST_USERS.member.email);
    await page.fill('#password', TEST_USERS.member.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    expect(page.url()).toBe(`${BASE_URL}${returnUrl}`);
  });
});

test.describe('Access Control - Member User', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'member');
  });

  test('should access member content', async ({ page }) => {
    await page.goto(`${BASE_URL}/members/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/members/dashboard`);
    
    // Verify no access denied message
    const accessDenied = page.locator('.access-denied, .upgrade-message');
    await expect(accessDenied).not.toBeVisible();
  });

  test('should NOT access premium content', async ({ page }) => {
    await page.goto(`${BASE_URL}/premium/article`);
    
    // Should either be 403 or show upgrade message
    const response = await page.waitForResponse(
      response => response.url().includes('/premium/article')
    );
    
    const status = response.status();
    if (status === 403) {
      expect(status).toBe(403);
    } else {
      // Check for upgrade message
      const upgradeMessage = page.locator('.upgrade-message, .no-access');
      await expect(upgradeMessage).toBeVisible();
    }
  });

  test('should NOT access admin content', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    
    const response = await page.waitForResponse(
      response => response.url().includes('/admin/dashboard')
    );
    
    expect(response.status()).toBe(403);
  });
});

test.describe('Access Control - Premium User', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'premium');
  });

  test('should access member content', async ({ page }) => {
    await page.goto(`${BASE_URL}/members/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/members/dashboard`);
    
    const accessDenied = page.locator('.access-denied, .upgrade-message');
    await expect(accessDenied).not.toBeVisible();
  });

  test('should access premium content', async ({ page }) => {
    await page.goto(`${BASE_URL}/premium/article`);
    await expect(page).toHaveURL(`${BASE_URL}/premium/article`);
    
    const accessDenied = page.locator('.access-denied, .upgrade-message');
    await expect(accessDenied).not.toBeVisible();
  });

  test('should NOT access admin content', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    
    const response = await page.waitForResponse(
      response => response.url().includes('/admin/dashboard')
    );
    
    expect(response.status()).toBe(403);
  });

  test('should display premium badge in header', async ({ page }) => {
    const userLevel = page.locator('.user-level');
    await expect(userLevel).toBeVisible();
    await expect(userLevel).toContainText('premium');
  });
});

test.describe('Access Control - Admin User', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
  });

  test('should access all content levels', async ({ page }) => {
    // Test member content
    await page.goto(`${BASE_URL}/members/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/members/dashboard`);
    
    // Test premium content
    await page.goto(`${BASE_URL}/premium/article`);
    await expect(page).toHaveURL(`${BASE_URL}/premium/article`);
    
    // Test admin content
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/admin/dashboard`);
    
    // No access denied messages
    const accessDenied = page.locator('.access-denied, .upgrade-message');
    await expect(accessDenied).not.toBeVisible();
  });

  test('should display admin badge in header', async ({ page }) => {
    const userLevel = page.locator('.user-level');
    await expect(userLevel).toBeVisible();
    await expect(userLevel).toContainText('admin');
  });
});

test.describe('Logout Flow', () => {
  test('should logout and clear session', async ({ page, context }) => {
    await login(page, 'member');
    
    // Verify logged in
    await expect(page.locator('.user-greeting')).toBeVisible();
    
    // Get cookies before logout
    const cookiesBefore = await context.cookies();
    expect(cookiesBefore.some(c => c.name === 'access_verification')).toBeTruthy();
    
    // Logout
    await logout(page);
    
    // Verify redirected to homepage
    await expect(page).toHaveURL(BASE_URL);
    
    // Verify header shows login link
    await expect(page.locator('.login-link')).toBeVisible();
    
    // Verify cookies cleared
    const cookiesAfter = await context.cookies();
    expect(cookiesAfter.some(c => c.name === 'access_verification')).toBeFalsy();
    expect(cookiesAfter.some(c => c.name === 'user_data')).toBeFalsy();
    
    // Try to access protected content
    await page.goto(`${BASE_URL}/members/dashboard`);
    await page.waitForURL(/.*login.*/);
  });
});

test.describe('Cookie Security', () => {
  test('should set HTTP-only cookie for verification', async ({ page, context }) => {
    await login(page, 'member');
    
    const cookies = await context.cookies();
    const verificationCookie = cookies.find(c => c.name === 'access_verification');
    
    expect(verificationCookie).toBeTruthy();
    expect(verificationCookie.httpOnly).toBeTruthy();
    expect(verificationCookie.secure).toBeTruthy();
  });

  test('should detect tampered user_data cookie', async ({ page, context }) => {
    await login(page, 'member');
    
    // Get current cookies
    const cookies = await context.cookies();
    const userDataCookie = cookies.find(c => c.name === 'user_data');
    
    // Tamper with the cookie
    const tamperedData = JSON.parse(decodeURIComponent(userDataCookie.value));
    tamperedData.level = 'premium';
    
    await context.addCookies([{
      ...userDataCookie,
      value: encodeURIComponent(JSON.stringify(tamperedData))
    }]);
    
    // Try to access premium content
    await page.goto(`${BASE_URL}/premium/article`);
    
    // Should be denied or redirected to login
    const response = await page.waitForResponse(
      response => response.url().includes('/premium/article')
    );
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('UI Components', () => {
  test('should display access badge correctly', async ({ page }) => {
    // Add access badge block to test page if not present
    await page.goto(`${BASE_URL}/test-badge`);
    
    // Without login - should show guest
    const guestBadge = page.locator('.access-badge');
    await expect(guestBadge).toContainText('Guest');
    
    // Login and check again
    await login(page, 'premium');
    await page.goto(`${BASE_URL}/test-badge`);
    
    const premiumBadge = page.locator('.access-badge');
    await expect(premiumBadge).toContainText('Premium');
  });

  test('should show protected content block appropriately', async ({ page }) => {
    await page.goto(`${BASE_URL}/test-protected`);
    
    // Without login - should show sign in message
    const signInMessage = page.locator('.sign-in-required');
    await expect(signInMessage).toBeVisible();
    
    // Login as member
    await login(page, 'member');
    await page.goto(`${BASE_URL}/test-protected-premium`);
    
    // Should show upgrade message for premium content
    const upgradeMessage = page.locator('.upgrade-message');
    await expect(upgradeMessage).toBeVisible();
    
    // Login as premium
    await logout(page);
    await login(page, 'premium');
    await page.goto(`${BASE_URL}/test-protected-premium`);
    
    // Should show content
    const content = page.locator('.protected-content.has-access');
    await expect(content).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load public content from cache', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check cache headers
    const response = await page.waitForResponse(
      response => response.url() === BASE_URL
    );
    
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toBeTruthy();
  });

  test('should have acceptable load times for authenticated pages', async ({ page }) => {
    await login(page, 'member');
    
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/members/dashboard`);
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Accessibility', () => {
  test('login form should be keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Tab through form
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('#email');
    const emailLabel = await emailInput.getAttribute('aria-label');
    expect(emailLabel || await page.locator('label[for="email"]').textContent()).toBeTruthy();
  });
});

test.describe('Edge Cases', () => {
  test('should handle multiple tabs consistently', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Login in first tab
    await login(page1, 'member');
    await expect(page1.locator('.user-greeting')).toBeVisible();
    
    // Check second tab
    await page2.goto(`${BASE_URL}/members/dashboard`);
    await expect(page2).toHaveURL(`${BASE_URL}/members/dashboard`);
    await expect(page2.locator('.user-greeting')).toBeVisible();
    
    await context.close();
  });

  test('should handle rapid login/logout', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await login(page, 'member');
      await expect(page.locator('.user-greeting')).toBeVisible();
      await logout(page);
      await expect(page.locator('.login-link')).toBeVisible();
    }
  });
});


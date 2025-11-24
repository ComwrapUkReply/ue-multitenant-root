/**
 * Test utility functions for authentication testing
 */

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

/**
 * Login helper function
 * @param {Page} page - Playwright page object
 * @param {string} userType - Type of user to login as ('member', 'premium', 'admin')
 * @returns {Promise<void>}
 */
async function login(page, userType) {
  const user = TEST_USERS[userType];
  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }

  const baseURL = process.env.TEST_URL || 'http://localhost:3000';
  await page.goto(`${baseURL}/login`);
  
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
}

/**
 * Logout helper function
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function logout(page) {
  await page.click('.logout-button');
  await page.waitForNavigation();
}

/**
 * Clear all cookies
 * @param {BrowserContext} context - Playwright browser context
 * @returns {Promise<void>}
 */
async function clearCookies(context) {
  await context.clearCookies();
}

/**
 * Get authentication cookies
 * @param {BrowserContext} context - Playwright browser context
 * @returns {Promise<Object>} Object with verification and userData cookies
 */
async function getAuthCookies(context) {
  const cookies = await context.cookies();
  
  return {
    verification: cookies.find(c => c.name === 'access_verification'),
    userData: cookies.find(c => c.name === 'user_data')
  };
}

/**
 * Parse user data from cookie
 * @param {Object} cookie - Cookie object
 * @returns {Object|null} Parsed user data or null
 */
function parseUserDataCookie(cookie) {
  if (!cookie || !cookie.value) {
    return null;
  }
  
  try {
    return JSON.parse(decodeURIComponent(cookie.value));
  } catch (error) {
    console.error('Error parsing user data cookie:', error);
    return null;
  }
}

/**
 * Wait for element with custom timeout
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<ElementHandle>}
 */
async function waitForElement(page, selector, timeout = 5000) {
  return page.waitForSelector(selector, { timeout });
}

/**
 * Check if user is on login page
 * @param {Page} page - Playwright page object
 * @returns {boolean}
 */
function isLoginPage(page) {
  return page.url().includes('/login');
}

/**
 * Check if response is access denied
 * @param {Response} response - Playwright response object
 * @returns {boolean}
 */
function isAccessDenied(response) {
  return response.status() === 403;
}

/**
 * Get return URL from login page
 * @param {Page} page - Playwright page object
 * @returns {string|null} Return URL or null
 */
function getReturnUrl(page) {
  if (!isLoginPage(page)) {
    return null;
  }
  
  const url = new URL(page.url());
  return url.searchParams.get('returnUrl');
}

/**
 * Verify header authentication state
 * @param {Page} page - Playwright page object
 * @param {boolean} expectLoggedIn - Whether user should be logged in
 * @returns {Promise<void>}
 */
async function verifyHeaderAuthState(page, expectLoggedIn) {
  if (expectLoggedIn) {
    const userGreeting = page.locator('.user-greeting');
    await userGreeting.waitFor({ state: 'visible' });
    const logoutButton = page.locator('.logout-button');
    await logoutButton.waitFor({ state: 'visible' });
  } else {
    const loginLink = page.locator('.login-link');
    await loginLink.waitFor({ state: 'visible' });
  }
}

/**
 * Measure page load time
 * @param {Page} page - Playwright page object
 * @param {string} url - URL to load
 * @returns {Promise<number>} Load time in milliseconds
 */
async function measureLoadTime(page, url) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  return Date.now() - startTime;
}

/**
 * Check console for errors
 * @param {Page} page - Playwright page object
 * @returns {Promise<Array>} Array of console error messages
 */
async function getConsoleErrors(page) {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Tamper with user data cookie
 * @param {BrowserContext} context - Playwright browser context
 * @param {Object} modifications - Properties to modify
 * @returns {Promise<void>}
 */
async function tamperUserDataCookie(context, modifications) {
  const cookies = await context.cookies();
  const userDataCookie = cookies.find(c => c.name === 'user_data');
  
  if (!userDataCookie) {
    throw new Error('user_data cookie not found');
  }
  
  const userData = parseUserDataCookie(userDataCookie);
  const tamperedData = { ...userData, ...modifications };
  
  await context.addCookies([{
    ...userDataCookie,
    value: encodeURIComponent(JSON.stringify(tamperedData))
  }]);
}

/**
 * Wait for response with specific URL pattern
 * @param {Page} page - Playwright page object
 * @param {string|RegExp} urlPattern - URL pattern to match
 * @returns {Promise<Response>}
 */
async function waitForResponse(page, urlPattern) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }
  );
}

/**
 * Check if element is visible
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>}
 */
async function isElementVisible(page, selector) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 1000 });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verify access level badge
 * @param {Page} page - Playwright page object
 * @param {string} expectedLevel - Expected access level
 * @returns {Promise<void>}
 */
async function verifyAccessBadge(page, expectedLevel) {
  const badge = page.locator('.access-badge');
  await badge.waitFor({ state: 'visible' });
  
  if (expectedLevel === 'guest') {
    await expect(badge).toContainText('Guest');
  } else {
    await expect(badge).toContainText(expectedLevel);
  }
}

module.exports = {
  TEST_USERS,
  login,
  logout,
  clearCookies,
  getAuthCookies,
  parseUserDataCookie,
  waitForElement,
  isLoginPage,
  isAccessDenied,
  getReturnUrl,
  verifyHeaderAuthState,
  measureLoadTime,
  getConsoleErrors,
  tamperUserDataCookie,
  waitForResponse,
  isElementVisible,
  verifyAccessBadge
};


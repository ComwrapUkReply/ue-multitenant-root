/**
 * Authentication utility functions
 * These functions help blocks interact with the authentication system
 */

/**
 * Cookie names - must match what Access Provider sets
 */
const COOKIE_NAMES = {
  VERIFICATION: 'access_verification',
  USER_DATA: 'user_data',
};

/**
 * Parse cookies from document.cookie string
 * @returns {Object} Object with cookie name-value pairs
 */
const parseCookies = () => {
  const cookies = {};

  document.cookie.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
};

/**
 * Get user data from cookie
 * @returns {Object|null} User data object or null if not authenticated
 */
export const getUserData = () => {
  try {
    const cookies = parseCookies();
    const userDataStr = cookies[COOKIE_NAMES.USER_DATA];

    if (!userDataStr) {
      return null;
    }

    const userData = JSON.parse(decodeURIComponent(userDataStr));
    return userData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  const userData = getUserData();
  return userData !== null;
};

/**
 * Check if user has required access level
 * @param {string} requiredLevel - Required access level ('member', 'premium', 'admin')
 * @returns {boolean} True if user has sufficient access
 */
export const hasAccessLevel = (requiredLevel) => {
  const userData = getUserData();

  if (!userData) {
    return false;
  }

  const levelHierarchy = {
    public: 0,
    member: 1,
    premium: 2,
    admin: 3,
  };

  const userLevel = levelHierarchy[userData.level] || 0;
  const requiredLevelNum = levelHierarchy[requiredLevel] || 0;

  return userLevel >= requiredLevelNum;
};

/**
 * Get user's display name
 * @returns {string|null} User's name or null
 */
export const getUserName = () => {
  const userData = getUserData();
  return userData ? userData.userName : null;
};

/**
 * Get user's email
 * @returns {string|null} User's email or null
 */
export const getUserEmail = () => {
  const userData = getUserData();
  return userData ? userData.email : null;
};

/**
 * Get user's access level
 * @returns {string|null} Access level ('member', 'premium', 'admin') or null
 */
export const getUserLevel = () => {
  const userData = getUserData();
  return userData ? userData.level : null;
};

/**
 * Logout function (clears cookies and redirects)
 * @param {string} logoutUrl - URL of logout endpoint
 */
export const logout = async (logoutUrl = '/api/logout') => {
  try {
    await fetch(logoutUrl, {
      method: 'POST',
      credentials: 'include',
    });

    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout error:', error);
    // Even if API call fails, try to redirect
    window.location.href = '/';
  }
};


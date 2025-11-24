/**
 * CloudFlare Worker for Access Control
 * This worker checks authentication and authorization for protected content
 */

// Configuration
const CONFIG = {
  // Your EDS domain
  EDS_DOMAIN: 'main--ue-multitenant-root--ComwrapUkReply.aem.live',

  // Your production domain (after CloudFlare)
  PRODUCTION_DOMAIN: 'yourdomain.com',

  // Access level header name
  ACCESS_HEADER: 'x-access-level',

  // Cookie names
  VERIFICATION_COOKIE: 'access_verification',
  USER_DATA_COOKIE: 'user_data',

  // Access provider URL (replace with your actual URL)
  ACCESS_PROVIDER_URL: 'https://YOUR_ACCESS_PROVIDER/verify',

  // Cache TTL in seconds
  CACHE_TTL: 3600, // 1 hour
};

// Access level hierarchy (higher number = more access)
const ACCESS_LEVELS = {
  public: 0,
  member: 1,
  premium: 2,
  admin: 3,
};

export default {
  async fetch(request, env, ctx) {
    try {
      // 1. Try to get response from cache
      let response = await caches.default.match(request.url);

      if (!response) {
        // 2. Not in cache - fetch from EDS origin
        response = await fetchFromOrigin(request);

        // 3. Cache the response
        ctx.waitUntil(caches.default.put(request.url, response.clone()));
      }

      // 4. Check if resource is protected
      if (isResourceProtected(response)) {
        // 5. Verify user has access
        const accessCheck = await verifyAccess(request, response);

        if (!accessCheck.authorized) {
          return accessCheck.response; // Redirect or 403
        }
      }

      // 6. Return the response
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Fetch content from EDS origin
 * @param {Request} request - Original request
 * @returns {Promise<Response>} Response from EDS
 */
async function fetchFromOrigin(request) {
  // Clone the request
  const url = new URL(request.url);

  // Change hostname to EDS domain
  url.hostname = CONFIG.EDS_DOMAIN;

  // Create new request to EDS
  const edsRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  // Fetch from EDS
  const response = await fetch(edsRequest);

  return response;
}

/**
 * Check if resource requires authentication
 * Reads the x-access-level header set in AEM configuration
 * @param {Response} response - Response from origin
 * @returns {boolean} True if resource is protected
 */
function isResourceProtected(response) {
  const accessLevel = response.headers.get(CONFIG.ACCESS_HEADER);

  // If no header or explicitly public, not protected
  if (!accessLevel || accessLevel === 'public') {
    return false;
  }

  // Any other access level means protected
  return true;
}

/**
 * Verify user has required access level
 * @param {Request} request - Original request
 * @param {Response} response - Response from origin
 * @returns {Promise<Object>} Authorization result
 */
async function verifyAccess(request, response) {
  // Get required access level from response header
  const requiredLevel = response.headers.get(CONFIG.ACCESS_HEADER);

  // Get user cookies
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const verificationToken = cookies[CONFIG.VERIFICATION_COOKIE];
  const userDataStr = cookies[CONFIG.USER_DATA_COOKIE];

  // No verification token = not logged in
  if (!verificationToken) {
    return {
      authorized: false,
      response: redirectToLogin(request.url),
    };
  }

  // Parse user data
  let userData;
  try {
    userData = JSON.parse(decodeURIComponent(userDataStr));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse user data:', e);
    return {
      authorized: false,
      response: redirectToLogin(request.url),
    };
  }

  // Verify the token with access provider
  const isValid = await verifyToken(verificationToken, userData);

  if (!isValid) {
    return {
      authorized: false,
      response: redirectToLogin(request.url),
    };
  }

  // Check if user's level is sufficient
  const userLevel = ACCESS_LEVELS[userData.level] || 0;
  const requiredLevelNum = ACCESS_LEVELS[requiredLevel] || 0;

  if (userLevel < requiredLevelNum) {
    return {
      authorized: false,
      response: new Response('Forbidden: Insufficient access level', {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store',
        },
      }),
    };
  }

  // User is authorized
  return {
    authorized: true,
  };
}

/**
 * Parse cookies from Cookie header string
 * @param {string} cookieString - Cookie header value
 * @returns {Object} Parsed cookies
 */
function parseCookies(cookieString) {
  const cookies = {};

  cookieString.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = rest.join('=').trim();
  });

  return cookies;
}

/**
 * Verify token with access provider
 * @param {string} token - Verification token
 * @param {Object} userData - User data from cookie
 * @returns {Promise<boolean>} True if token is valid
 */
async function verifyToken(token, userData) {
  try {
    const response = await fetch(CONFIG.ACCESS_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verification: token,
        userData,
      }),
    });

    return response.status === 200;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Token verification failed:', error);
    return false;
  }
}

/**
 * Redirect to login page
 * @param {string} returnUrl - URL to return to after login
 * @returns {Response} Redirect response
 */
function redirectToLogin(returnUrl) {
  const loginUrl = new URL('/login', CONFIG.PRODUCTION_DOMAIN);
  loginUrl.searchParams.set('returnUrl', returnUrl);

  return Response.redirect(loginUrl.toString(), 302);
}


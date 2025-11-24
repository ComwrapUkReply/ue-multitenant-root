const crypto = require('crypto');

/**
 * Authenticate user and set cookies
 *
 * Input (POST body):
 * {
 *   "email": "user@example.com",
 *   "password": "userpassword"
 * }
 *
 * Output:
 * - Sets cookies: access_verification, user_data
 * - Returns user info
 */
async function main(params) {
  try {
    const { email, password } = params;

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: {
          error: 'Email and password required',
        },
      };
    }

    // IMPORTANT: Replace this with real authentication
    // This is a dummy implementation for demonstration
    const user = await authenticateUser(email, password);

    if (!user) {
      return {
        statusCode: 401,
        body: {
          error: 'Invalid credentials',
        },
      };
    }

    // Create user data object
    const userData = {
      userId: user.id,
      email: user.email,
      userName: user.name,
      level: user.accessLevel, // 'member', 'premium', 'admin'
    };

    // Generate verification token (encrypted user data)
    const verificationToken = encryptData(JSON.stringify(userData));

    // Create cookies
    const cookies = [
      // HTTP-only cookie for server-side verification
      `access_verification=${verificationToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,

      // JavaScript-readable cookie for client-side display
      `user_data=${encodeURIComponent(JSON.stringify(userData))}; Path=/; Secure; SameSite=Strict; Max-Age=86400`,
    ];

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookies,
        'Content-Type': 'application/json',
      },
      body: {
        success: true,
        user: {
          email: user.email,
          name: user.name,
          level: user.accessLevel,
        },
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error',
      },
    };
  }
}

/**
 * Authenticate user against your user database
 * REPLACE THIS with your actual authentication logic
 */
async function authenticateUser(email, password) {
  // DUMMY IMPLEMENTATION - Replace with real authentication
  // This could connect to:
  // - Your database
  // - LDAP/Active Directory
  // - SSO provider (Okta, Auth0, Azure AD)
  // - Adobe IMS

  const dummyUsers = {
    'member@example.com': {
      id: '1',
      email: 'member@example.com',
      name: 'John Member',
      accessLevel: 'member',
      passwordHash: 'hashed_password_1', // In real app, use bcrypt
    },
    'premium@example.com': {
      id: '2',
      email: 'premium@example.com',
      name: 'Jane Premium',
      accessLevel: 'premium',
      passwordHash: 'hashed_password_2',
    },
    'admin@example.com': {
      id: '3',
      email: 'admin@example.com',
      name: 'Admin User',
      accessLevel: 'admin',
      passwordHash: 'hashed_password_3',
    },
  };

  const user = dummyUsers[email];

  // In real implementation, use bcrypt.compare()
  if (user && password === 'demo123') {
    return user;
  }

  return null;
}

/**
 * Encrypt data for verification token
 */
function encryptData(data) {
  // Get encryption key from environment variable
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  // Create cipher
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data
  return `${iv.toString('hex')}:${encrypted}`;
}

exports.main = main;


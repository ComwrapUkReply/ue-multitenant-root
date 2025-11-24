const crypto = require('crypto');

/**
 * Verify authentication token
 * Called by CloudFlare Worker to validate user access
 *
 * Input (POST body):
 * {
 *   "verification": "encrypted_token",
 *   "userData": { user data object }
 * }
 *
 * Output:
 * - 200 if valid
 * - 400/401 if invalid
 */
async function main(params) {
  try {
    const { verification, userData } = params;

    // Validate input
    if (!verification || !userData) {
      return {
        statusCode: 400,
        body: {
          error: 'Verification token and user data required',
        },
      };
    }

    // Decrypt verification token
    const decryptedData = decryptData(verification);

    if (!decryptedData) {
      return {
        statusCode: 401,
        body: {
          error: 'Invalid verification token',
        },
      };
    }

    // Compare decrypted data with provided user data
    const userDataJson = JSON.stringify(userData);
    const decryptedJson = decryptedData.trim();

    if (decryptedJson !== userDataJson.trim()) {
      // eslint-disable-next-line no-console
      console.error('Token mismatch');
      // eslint-disable-next-line no-console
      console.error('Decrypted:', decryptedJson);
      // eslint-disable-next-line no-console
      console.error('Provided:', userDataJson);

      return {
        statusCode: 401,
        body: {
          error: 'Token verification failed',
        },
      };
    }

    // Optionally: Check token expiration, user status, etc.
    // const tokenAge = checkTokenAge(userData.userId);
    // if (tokenAge > MAX_TOKEN_AGE) { return 401; }

    // Token is valid
    return {
      statusCode: 200,
      body: {
        valid: true,
        userId: userData.userId,
        level: userData.level,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Internal server error',
      },
    };
  }
}

/**
 * Decrypt verification token
 */
function decryptData(encryptedData) {
  try {
    // Get encryption key from environment variable
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      return null;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // Create decipher
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Decryption error:', error);
    return null;
  }
}

exports.main = main;

